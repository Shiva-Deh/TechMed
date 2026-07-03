/* ============================================================
   Health chat, Tech Med  (Dr. Sana)
   - Emergencies and safety are always answered locally, first.
   - Common topics have quick, curated answers.
   - Anything else is looked up live on the web via Wikipedia's
     free API (no key needed), so it can answer almost any
     health question and keeps improving as the web does.
   - Every answer carries a "not a doctor" note.
   ============================================================ */

const BOT = '\uD83D\uDC69\u200D\u2695\uFE0F';   // woman health worker
const CONVO_STORE = 'techmed_convos';

function el(id) { return document.getElementById(id); }

/* ---------- conversation memory ---------- */
let convos = loadConvos();
let currentId = null;
function loadConvos() { try { return JSON.parse(localStorage.getItem(CONVO_STORE)) || []; } catch { return []; } }
function saveConvos() { localStorage.setItem(CONVO_STORE, JSON.stringify(convos)); }
function currentConvo() { return convos.find(c => c.id === currentId); }
function recordMsg(who, text) {
  if (who === 'user' && !currentId) {
    currentId = String(Date.now());
    convos.push({ id: currentId, ts: Date.now(), title: text, msgs: [] });
  }
  const c = currentConvo();
  if (c) { c.msgs.push({ who, text }); c.ts = Date.now(); saveConvos(); if (typeof renderRecentConvos === 'function') renderRecentConvos(); }
}
function getRecentConvos(n = 3) { return [...convos].sort((a, b) => b.ts - a.ts).slice(0, n); }
function loadConvoIntoChat(id) {
  const c = convos.find(x => x.id === id); if (!c) return;
  currentId = id;
  const log = el('chat-log'); log.innerHTML = '';
  c.msgs.forEach(m => addMsg(m.text, m.who));
}

/* ---------- rendering ---------- */
function addMsg(text, who, opts = {}) {
  const log = el('chat-log');
  const row = document.createElement('div');
  row.className = `row-msg ${who}`;
  const avatar = document.createElement('div');
  avatar.className = `avatar ${who}`;
  avatar.textContent = who === 'bot' ? BOT : '\uD83D\uDE42';
  const bubble = document.createElement('div');
  bubble.className = `msg ${who}`;
  bubble.textContent = text;
  if (opts.source) {
    const a = document.createElement('a');
    a.className = 'msg-src'; a.href = opts.source; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'Read more on Wikipedia';
    bubble.appendChild(a);
  }
  if (opts.disclaimer) {
    const d = document.createElement('span');
    d.className = 'disc';
    d.textContent = 'General info, not medical advice. For anything serious, contact a healthcare professional.';
    bubble.appendChild(d);
  }
  row.appendChild(avatar); row.appendChild(bubble);
  log.appendChild(row); log.scrollTop = log.scrollHeight;
}
function showTyping() {
  const log = el('chat-log');
  const div = document.createElement('div');
  div.className = 'row-msg bot'; div.id = 'typing-row';
  div.innerHTML = `<div class="avatar bot">${BOT}</div><div class="msg bot"><span class="typing"><i></i><i></i><i></i></span></div>`;
  log.appendChild(div); log.scrollTop = log.scrollHeight;
}
function hideTyping() { const t = el('typing-row'); if (t) t.remove(); }

/* ---------- local answers (safety first, then common topics) ---------- */
const RULES = [
  { keywords: ['suicide', 'kill myself', 'end my life', 'self-harm', 'hurt myself', 'want to die'],
    reply: "I'm really glad you told me, and I want you to be safe. Please reach out right now to a local crisis line or emergency services, or to someone you trust. In Canada or the US you can call or text 988. You do not have to go through this alone." },
  { keywords: ['chest pain', "can't breathe", 'cant breathe', 'shortness of breath', 'stroke', 'numb on one side', 'severe bleeding'],
    reply: "That can be an emergency. Please call your local emergency number or get to urgent care right away rather than waiting for this to pass." },
  { keywords: ['headache', 'migraine'],
    reply: "For a tension headache, try water, rest in a dim quiet room, and a short break from screens. If a headache is sudden, severe, or unlike any you've had before, please get it checked promptly." },
  { keywords: ['sleep', 'insomnia', "can't sleep", 'cant sleep'],
    reply: "A steady wake-up time, morning daylight, and a screen curfew about 45 minutes before bed do most of the work for better sleep. Keep the room cool and dark, and save caffeine for the morning." },
  { keywords: ['stress', 'anxious', 'anxiety', 'overwhelmed', 'panic'],
    reply: "Try breathing in for a count of 4 and out for 6 for a couple of minutes, a longer exhale helps calm your body. If stress or anxiety sticks around, talking to a professional is really worth it." },
  { keywords: ['blood pressure', 'hypertension'],
    reply: "Blood pressure has two numbers, the top (systolic) is the push when the heart beats, the bottom (diastolic) is the rest in between. Around 120/80 is a common healthy reference, your clinician can tell you what's right for you." },
];
function findLocalReply(text) {
  const s = text.toLowerCase();
  for (const r of RULES) if (r.keywords.some(k => s.includes(k))) return r.reply;
  return null;
}

/* ---------- web lookup via Wikipedia (free, no key) ---------- */
function firstSentences(str, n) {
  const parts = str.replace(/\s+/g, ' ').split(/(?<=\.)\s/);
  return parts.slice(0, n).join(' ').trim();
}
async function wikiAnswer(q) {
  try {
    const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=1`;
    const sr = await fetch(sUrl).then(r => r.json());
    const hit = sr && sr.query && sr.query.search && sr.query.search[0];
    if (!hit) return null;
    const title = hit.title;
    const sum = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`).then(r => r.json());
    if (sum.type === 'disambiguation' || !sum.extract) return null;
    return {
      text: firstSentences(sum.extract, 3),
      url: (sum.content_urls && sum.content_urls.desktop && sum.content_urls.desktop.page) || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
    };
  } catch (e) { return null; }
}

async function getReply(text) {
  const local = findLocalReply(text);
  if (local) return { text: local };
  const wiki = await wikiAnswer(text);
  if (wiki) return { text: wiki.text, source: wiki.url };
  return { text: "I couldn't find a clear answer for that one. Try rephrasing it, or ask your doctor or pharmacist for anything specific to you." };
}

async function handleSend(text) {
  text = (text || el('chat-input').value).trim();
  if (!text) return;
  el('chat-input').value = '';
  addMsg(text, 'user'); recordMsg('user', text);
  showTyping(); el('chat-send').disabled = true;
  try {
    const r = await getReply(text);
    hideTyping();
    addMsg(r.text, 'bot', { disclaimer: true, source: r.source });
    recordMsg('bot', r.text);
  } catch (e) {
    hideTyping();
    addMsg("Sorry, I had trouble answering that just now. Please try again.", 'bot');
  } finally {
    el('chat-send').disabled = false;
  }
}

function initChat() {
  addMsg("Hi, I'm Dr. Sana. Ask me almost any health question, from symptoms to conditions to healthy habits, and I'll do my best.", 'bot', { disclaimer: true });
  el('chat-send').addEventListener('click', () => handleSend());
  el('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  el('chat-suggest').addEventListener('click', e => { const b = e.target.closest('button'); if (b) handleSend(b.textContent); });
}
