/* ============================================================
   Health chat
   - Talks to the Anthropic API using a key YOU store in this
     browser (Settings ⚙︎ in the chat). The key never touches
     our servers; it goes straight to api.anthropic.com.
   - If no key is set, a small built-in helper answers common
     questions and points you to add a key for full answers.
   - Always shows a "not a doctor" note and steers serious or
     emergency issues toward real care.
   ============================================================ */

const KEY_STORE = 'techmed_api_key';
// Any current Anthropic model string works — swap this if you prefer another.
const MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `You are the Tech Med health assistant, a calm, plain-spoken companion inside a patient-facing wellbeing app.

Your job: help people understand symptoms, habits, medications, tests, and mental wellbeing in clear everyday language.

Rules:
- You are NOT a doctor and do not diagnose. Explain possibilities and general guidance, and be honest about uncertainty.
- Encourage seeing a professional for anything persistent, severe, or worrying. Name clear red-flag symptoms when relevant (e.g. chest pain, trouble breathing, sudden weakness, severe bleeding) and say to seek urgent care for those.
- If someone expresses thoughts of self-harm, suicide, or being in crisis, respond with warmth, take it seriously, and gently encourage them to contact a local crisis line or emergency services or a trusted person right away. Do not give methods or judgement.
- Never give specific dosing to start/stop prescription medicines; tell them to confirm with a pharmacist or prescriber.
- Keep answers short and warm: a few sentences or a tight list. Avoid jargon; define it when you must use it.
- Do not claim to access their personal records or the app's tracking data.`;

let chatHistory = []; // {role, content}

function el(id) { return document.getElementById(id); }

function addMsg(text, who, opts = {}) {
  const log = el('chat-log');
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.textContent = text;
  if (opts.disclaimer) {
    const d = document.createElement('span');
    d.className = 'disc';
    d.textContent = 'General info, not medical advice. For anything serious, contact a healthcare professional.';
    div.appendChild(d);
  }
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

function showTyping() {
  const log = el('chat-log');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing';
  div.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}
function hideTyping() { const t = el('typing'); if (t) t.remove(); }

/* ---- offline fallback (no key) ---- */
function offlineReply(q) {
  const s = q.toLowerCase();
  const has = (...w) => w.some(x => s.includes(x));

  if (has('suicide','kill myself','end my life','self-harm','hurt myself'))
    return "I'm really glad you reached out, and I want you to be safe. Please contact a local crisis line or emergency services now, or reach out to someone you trust — you don't have to handle this alone.";
  if (has('chest pain','can\'t breathe','cant breathe','stroke','numb on one side'))
    return "That can be an emergency. Please call your local emergency number or get to urgent care right away rather than waiting.";
  if (has('headache','migraine'))
    return "For a tension headache: water, rest in a dim quiet room, and a short break from screens often help. If headaches are sudden, severe, or unusual for you, get them checked.";
  if (has('sleep','insomnia','can\'t sleep'))
    return "A steady wake-up time, morning daylight, and a screen curfew about 45 minutes before bed do the heavy lifting for sleep. Keep the room cool and dark.";
  if (has('stress','anxious','anxiety','overwhelmed'))
    return "Try breathing in for 4 and out for 6 for a couple of minutes — a longer exhale helps calm the body. If stress is ongoing, talking to a professional is worth it.";
  if (has('water','hydrate','hydration'))
    return "Drink to thirst and aim for pale-straw urine. Needs rise with heat, exercise, and illness.";
  if (has('blood pressure'))
    return "Blood pressure is written as two numbers: the top (systolic) is the push when the heart beats, the bottom (diastolic) is the rest between beats. Around 120/80 is a common healthy reference — your clinician can say what's right for you.";
  return "I can answer better with the AI connected — tap ⚙︎ above to add your API key. In the meantime: for most everyday issues, rest, fluids, and steady habits help, and anything persistent or severe is worth a professional's look.";
}

/* ---- live Anthropic call ---- */
async function askAnthropic(userText) {
  const key = localStorage.getItem(KEY_STORE);
  chatHistory.push({ role: 'user', content: userText });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: chatHistory
    })
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(res.status + ' ' + t.slice(0, 160));
  }
  const data = await res.json();
  const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  chatHistory.push({ role: 'assistant', content: reply });
  return reply || "I didn't catch that — could you rephrase?";
}

async function handleSend(text) {
  text = (text || el('chat-input').value).trim();
  if (!text) return;
  el('chat-input').value = '';
  addMsg(text, 'user');

  const hasKey = !!localStorage.getItem(KEY_STORE);
  if (!hasKey) {
    setTimeout(() => addMsg(offlineReply(text), 'bot', { disclaimer: true }), 350);
    return;
  }

  showTyping();
  el('chat-send').disabled = true;
  try {
    const reply = await askAnthropic(text);
    hideTyping();
    addMsg(reply, 'bot', { disclaimer: true });
  } catch (err) {
    hideTyping();
    const msg = /401|invalid|authentication/i.test(err.message)
      ? "That API key looks invalid or expired. Tap ⚙︎ to update it."
      : "I couldn't reach the AI just now. Check your key and connection, then try again.";
    addMsg(msg, 'bot');
    console.error(err);
  } finally {
    el('chat-send').disabled = false;
  }
}

function initChat() {
  // greeting
  addMsg("Hi, I'm your Tech Med assistant. Ask me about symptoms, habits, medicines, or how you're feeling.", 'bot', { disclaimer: true });

  el('chat-send').addEventListener('click', () => handleSend());
  el('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

  el('chat-suggest').addEventListener('click', e => {
    const b = e.target.closest('button'); if (b) handleSend(b.textContent);
  });

  // key controls
  const keyInput = el('api-key');
  keyInput.value = localStorage.getItem(KEY_STORE) || '';
  el('key-save').addEventListener('click', () => {
    const v = keyInput.value.trim();
    if (v) { localStorage.setItem(KEY_STORE, v); addMsg("Great — AI connected. Ask away.", 'bot'); }
  });
  el('key-clear').addEventListener('click', () => {
    localStorage.removeItem(KEY_STORE); keyInput.value = '';
    addMsg("Key cleared. The built-in helper will answer common questions.", 'bot');
  });
}
