/* ============================================================
   Health chat, Tech Med
   Keyword assistant with a female persona (Dr. Sana).
   Now also remembers conversations so the Home page can show
   short summaries you can tap to reopen.
   ============================================================ */

const BOT = '\uD83D\uDC69\u200D\u2695\uFE0F';   // 👩‍⚕️ shown by each answer
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
  if (c) {
    c.msgs.push({ who, text });
    c.ts = Date.now();
    saveConvos();
    if (typeof renderRecentConvos === 'function') renderRecentConvos();
  }
}

function getRecentConvos(n = 3) {
  return [...convos].sort((a, b) => b.ts - a.ts).slice(0, n);
}

function loadConvoIntoChat(id) {
  const c = convos.find(x => x.id === id);
  if (!c) return;
  currentId = id;
  const log = el('chat-log');
  log.innerHTML = '';
  c.msgs.forEach(m => addMsg(m.text, m.who));
}

/* ---------- rendering a message (avatar + bubble) ---------- */
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
  if (opts.disclaimer) {
    const d = document.createElement('span');
    d.className = 'disc';
    d.textContent = 'General info, not medical advice. For anything serious, contact a healthcare professional.';
    bubble.appendChild(d);
  }

  row.appendChild(avatar);
  row.appendChild(bubble);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
}

/* ---------- the answer bank ---------- */
const RULES = [
  { keywords: ['suicide', 'kill myself', 'end my life', 'self-harm', 'hurt myself', 'want to die'],
    reply: "I'm really glad you told me, and I want you to be safe. Please reach out right now to a local crisis line or emergency services, or to someone you trust, you don't have to go through this alone." },
  { keywords: ['chest pain', "can't breathe", 'cant breathe', 'shortness of breath', 'stroke', 'numb on one side', 'severe bleeding'],
    reply: "That can be an emergency. Please call your local emergency number or get to urgent care right away rather than waiting for this to pass." },
  { keywords: ['headache', 'migraine'],
    reply: "For a tension headache, try water, rest in a dim quiet room, and a short break from screens. If a headache is sudden, severe, or unlike any you've had before, please get it checked promptly." },
  { keywords: ['sleep', 'insomnia', "can't sleep", 'cant sleep', 'tired', 'exhausted'],
    reply: "A steady wake-up time, morning daylight, and a screen curfew about 45 minutes before bed do most of the work for better sleep. Keep the room cool and dark, and save caffeine for the morning." },
  { keywords: ['stress', 'anxious', 'anxiety', 'overwhelmed', 'panic', 'nervous'],
    reply: "Try breathing in for a count of 4 and out for 6 for a couple of minutes, a longer exhale helps calm your body. If stress or anxiety sticks around or gets in the way of daily life, talking to a professional is really worth it." },
  { keywords: ['water', 'hydrate', 'hydration', 'dehydrated', 'thirsty'],
    reply: "Drink to thirst and aim for pale-straw coloured urine. You need more when it's hot, when you exercise, or when you're unwell. There's no need to force litres." },
  { keywords: ['blood pressure', 'hypertension', 'bp'],
    reply: "Blood pressure has two numbers, the top (systolic) is the push when the heart beats, the bottom (diastolic) is the rest in between. Around 120/80 is a common healthy reference, your clinician can tell you what's right for you." },
  { keywords: ['cold', 'flu', 'fever', 'cough', 'sore throat', 'runny nose'],
    reply: "For a typical cold or mild flu, rest, fluids, and time are the main medicine. See a doctor if you have a high or lasting fever, trouble breathing, or symptoms that keep getting worse instead of better." },
  { keywords: ['diet', 'eat', 'nutrition', 'healthy food', 'vegetables'],
    reply: "A simple, flexible aim is plenty of plants, vegetables, fruit, beans, whole grains, nuts and seeds, across the week, with regular meals. Variety matters more than any single food." },
  { keywords: ['exercise', 'workout', 'active', 'walk', 'steps'],
    reply: "Around 150 minutes of movement a week helps, and it doesn't need to be the gym. Short bursts, a brisk 2 to 5 minute walk, taking the stairs, add up, and a walk after meals steadies blood sugar." },
  { keywords: ['medicine', 'medication', 'dose', 'dosage', 'pill', 'tablet'],
    reply: "I can explain what a medicine is generally for, but for how much to take or whether to start or stop one, please check with your pharmacist or prescriber, the right dose depends on you." },
  { keywords: ['sad', 'depressed', 'depression', 'lonely', 'low mood', 'hopeless'],
    reply: "I'm sorry you're feeling low, that's worth taking seriously and being gentle with yourself about. Small steps like daylight, movement, and talking to someone you trust can help, and a doctor or counsellor can offer real support if it lingers." },
  { keywords: ['eyes', 'eye strain', 'screen', 'blurry'],
    reply: "For screen-tired eyes, try the 20-20-20 rule, every 20 minutes look about 20 feet away for 20 seconds. Blink often and keep the screen an arm's length away. If blur or pain persists, see an optometrist." },
];

function findReply(text) {
  const s = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(k => s.includes(k))) return rule.reply;
  }
  return "I can help with everyday things like sleep, stress, hydration, headaches, blood pressure, diet, and movement, try asking about one of those. And remember, anything persistent or severe is always worth a professional's look.";
}

function handleSend(text) {
  text = (text || el('chat-input').value).trim();
  if (!text) return;
  el('chat-input').value = '';
  addMsg(text, 'user');
  recordMsg('user', text);
  setTimeout(() => {
    const r = findReply(text);
    addMsg(r, 'bot', { disclaimer: true });
    recordMsg('bot', r);
  }, 350);
}

function initChat() {
  addMsg("Hi, I'm Dr. Sana, your Tech Med assistant. Ask me about symptoms, habits, or how you're feeling.", 'bot', { disclaimer: true });
  el('chat-send').addEventListener('click', () => handleSend());
  el('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  el('chat-suggest').addEventListener('click', e => {
    const b = e.target.closest('button'); if (b) handleSend(b.textContent);
  });
}
