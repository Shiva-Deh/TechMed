/* ============================================================
   Health chat, Tech Med  (Dr. Sana)
   Triage order (most important first):
     1. Self-harm / crisis        -> supportive crisis reply
     2. Urgent physical symptoms  -> first-aid + seek-care reply
     3. Common everyday topics    -> quick curated answer
     4. Anything else             -> live web lookup (Wikipedia),
        filtered so it can only return health-relevant results
        (never songs, films, albums, etc.)
   Every answer carries a "not a doctor" note.
   ============================================================ */

const BOT = '\uD83D\uDC69\u200D\u2695\uFE0F';
const CONVO_STORE = 'techmed_convos';
function el(id) { return document.getElementById(id); }

/* ---------- conversation memory ---------- */
let convos = loadConvos();
let currentId = null;
function loadConvos() { try { return JSON.parse(localStorage.getItem(CONVO_STORE)) || []; } catch { return []; } }
function saveConvos() { localStorage.setItem(CONVO_STORE, JSON.stringify(convos)); }
function currentConvo() { return convos.find(c => c.id === currentId); }
function recordMsg(who, text) {
  if (who === 'user' && !currentId) { currentId = String(Date.now()); convos.push({ id: currentId, ts: Date.now(), title: text, msgs: [] }); }
  const c = currentConvo();
  if (c) { c.msgs.push({ who, text }); c.ts = Date.now(); saveConvos(); if (typeof renderRecentConvos === 'function') renderRecentConvos(); }
}
function getRecentConvos(n = 3) { return [...convos].sort((a, b) => b.ts - a.ts).slice(0, n); }
function loadConvoIntoChat(id) {
  const c = convos.find(x => x.id === id); if (!c) return;
  currentId = id; const log = el('chat-log'); log.innerHTML = '';
  c.msgs.forEach(m => addMsg(m.text, m.who));
}

/* ---------- rendering ---------- */
function addMsg(text, who, opts = {}) {
  const log = el('chat-log');
  const row = document.createElement('div'); row.className = `row-msg ${who}`;
  const avatar = document.createElement('div'); avatar.className = `avatar ${who}`;
  avatar.textContent = who === 'bot' ? BOT : '\uD83D\uDE42';
  const bubble = document.createElement('div'); bubble.className = `msg ${who}`;
  bubble.textContent = text;
  if (opts.urgent) bubble.classList.add('msg--urgent');
  if (opts.source) {
    const a = document.createElement('a');
    a.className = 'msg-src'; a.href = opts.source; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'Read more on Wikipedia';
    bubble.appendChild(a);
  }
  if (opts.disclaimer) {
    const d = document.createElement('span'); d.className = 'disc';
    d.textContent = 'General info, not medical advice. For anything serious, contact a healthcare professional.';
    bubble.appendChild(d);
  }
  row.appendChild(avatar); row.appendChild(bubble);
  log.appendChild(row); log.scrollTop = log.scrollHeight;
}
function showTyping() {
  const log = el('chat-log');
  const div = document.createElement('div'); div.className = 'row-msg bot'; div.id = 'typing-row';
  div.innerHTML = `<div class="avatar bot">${BOT}</div><div class="msg bot"><span class="typing"><i></i><i></i><i></i></span></div>`;
  log.appendChild(div); log.scrollTop = log.scrollHeight;
}
function hideTyping() { const t = el('typing-row'); if (t) t.remove(); }

/* ---------- 1. crisis ---------- */
const CRISIS_KEYS = ['suicide', 'kill myself', 'end my life', 'end it all', 'self-harm', 'self harm', 'hurt myself', 'harm myself', 'want to die', "don't want to live", 'better off dead', 'worthless'];
const CRISIS_REPLY = "I'm really glad you told me, and I want you to be safe. Please reach out right now to a local crisis line or someone you trust. In Canada or the US you can call or text 988, and if you are in immediate danger call your local emergency number. You do not have to go through this alone.";

/* ---------- 2. urgent physical symptoms (first aid) ---------- */
const URGENT = [
  { keys: ['bleeding', 'bleed', 'wound', 'deep cut', 'gash', 'blood won', "won't stop bleeding", 'cut and it'],
    reply: "For bleeding, press firmly on the spot with a clean cloth and keep steady pressure for about 10 minutes, and raise the area above heart level if you can. If the bleeding is heavy or spurting, soaks through, will not stop, or the cut is deep, gaping, or from something dirty or rusty, treat it as an emergency and get urgent care or call your local emergency number now." },
  { keys: ['choking', 'something stuck in my throat', 'can\'t swallow'],
    reply: "If someone is choking and cannot breathe, speak, or cough, this is an emergency, call your local emergency number now. If they can still cough, encourage them to keep coughing." },
  { keys: ['chest pain', 'heart attack', 'pressure in my chest', 'pain in my chest'],
    reply: "Chest pain can be an emergency, especially with sweating, nausea, or pain spreading to the arm, jaw, or back. Please call your local emergency number now rather than waiting." },
  { keys: ['stroke', 'face drooping', 'slurred speech', 'numb on one side', 'can\'t move one side', 'weakness on one side'],
    reply: "Sudden face drooping, arm weakness, or slurred speech can be signs of a stroke. This is an emergency, call your local emergency number immediately, minutes matter." },
  { keys: ['can\'t breathe', 'cant breathe', 'struggling to breathe', 'shortness of breath', 'trouble breathing'],
    reply: "Trouble breathing can be serious. If it is sudden or severe, or your lips or face look blue, call your local emergency number now." },
  { keys: ['allergic reaction', 'throat closing', 'lips swelling', 'tongue swelling', 'anaphylaxis', 'face swelling up'],
    reply: "A severe allergic reaction (swelling of the lips, tongue, or throat, trouble breathing, or widespread hives) is an emergency. Use an epinephrine auto-injector if one is available and call your local emergency number now." },
  { keys: ['overdose', 'took too many', 'poison', 'swallowed something', 'ingested'],
    reply: "If you think you or someone has taken too much medicine or swallowed something harmful, contact your local poison control or emergency number right away, even if they seem okay for now." },
  { keys: ['seizure', 'convulsion', 'unconscious', 'passed out', 'won\'t wake up', 'not waking up', 'fainted'],
    reply: "If someone is unconscious or having a seizure, call your local emergency number. Keep them safe from injury, do not put anything in their mouth, and stay with them until help arrives." },
  { keys: ['burn', 'burned', 'scalded', 'scald'],
    reply: "For a minor burn, cool it under cool running water for about 20 minutes and cover it loosely with clean cling film or a clean cloth. For large, deep, or blistering burns, or burns to the face, hands, or genitals, get urgent care." },
  { keys: ['broken bone', 'fracture', 'broke my', 'think it\'s broken'],
    reply: "If you might have a broken bone (severe pain, swelling, a limb that looks bent, or you cannot use it), keep it still and supported and get it checked with an x-ray at urgent care." },
  { keys: ['hit my head', 'head injury', 'concussion', 'banged my head'],
    reply: "After a head injury, watch for a worsening headache, repeated vomiting, confusion, drowsiness, or unequal pupils, and get emergency care right away if any of those appear." },
];

/* ---------- 3. common curated ---------- */
const COMMON = [
  { keys: ['headache', 'migraine'], reply: "For a tension headache, try water, rest in a dim quiet room, and a short screen break. If a headache is sudden, severe, or unlike any you've had before, get it checked promptly." },
  { keys: ['sleep', 'insomnia', "can't sleep", 'cant sleep'], reply: "A steady wake-up time, morning daylight, and a screen curfew about 45 minutes before bed do most of the work for sleep. Keep the room cool and dark, and save caffeine for the morning." },
  { keys: ['stress', 'anxious', 'anxiety', 'overwhelmed', 'panic'], reply: "Try breathing in for a count of 4 and out for 6 for a couple of minutes, a longer exhale helps calm your body. If it sticks around, talking to a professional is worth it." },
  { keys: ['blood pressure', 'hypertension'], reply: "Blood pressure has two numbers, the top when the heart beats and the bottom at rest. Around 120/80 is a common healthy reference, and your clinician can tell you what's right for you." },
  { keys: ['fever', 'cold', 'flu', 'sore throat', 'cough', 'runny nose'], reply: "For a typical cold or mild flu, rest, fluids, and time help most. See a doctor for a high or lasting fever, trouble breathing, or symptoms that keep getting worse." },
];

function scan(list, text) { for (const r of list) if (r.keys.some(k => text.includes(k))) return r.reply; return null; }

/* ---------- 4. web lookup, health-filtered ---------- */
const NON_MEDICAL = ['song', 'album', 'single by', 'ep by', 'band', 'musician', 'singer', 'rapper', 'soundtrack',
  'film', 'movie', 'tv series', 'television series', 'sitcom', 'miniseries', 'actor', 'actress', 'novel', 'book by',
  'video game', 'manga', 'anime', 'footballer', 'basketball', 'wrestler', 'painting', 'sculpture', 'municipality', 'village in', 'town in'];
function looksNonMedical(sum) {
  const t = ((sum.description || '') + ' ' + (sum.extract || '')).toLowerCase();
  return NON_MEDICAL.some(w => t.includes(w));
}
function firstSentences(str, n) {
  const parts = str.replace(/\s+/g, ' ').split(/(?<=\.)\s/);
  return parts.slice(0, n).join(' ').trim();
}
async function fetchWiki(q) {
  const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=1`;
  const sr = await fetch(sUrl).then(r => r.json());
  const hit = sr && sr.query && sr.query.search && sr.query.search[0];
  if (!hit) return null;
  const sum = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`).then(r => r.json());
  if (!sum || !sum.extract || sum.type === 'disambiguation') return null;
  return { title: hit.title, sum };
}
async function wikiAnswer(q) {
  try {
    let res = await fetchWiki(q);
    if (!res || looksNonMedical(res.sum)) res = await fetchWiki(q + ' medicine') || res;
    if (!res || looksNonMedical(res.sum) || !res.sum.extract) return null;
    return {
      text: firstSentences(res.sum.extract, 3),
      url: (res.sum.content_urls && res.sum.content_urls.desktop && res.sum.content_urls.desktop.page) || `https://en.wikipedia.org/wiki/${encodeURIComponent(res.title)}`
    };
  } catch (e) { return null; }
}

/* ---------- is the question even about health? ---------- */
const HEALTH_TERMS = ['health', 'medical', 'medicine', 'doctor', 'nurse', 'hospital', 'clinic', 'symptom', 'pain',
  'ache', 'fever', 'cough', 'cold', 'flu', 'sick', 'ill', 'disease', 'condition', 'infection', 'virus', 'bacteria',
  'medication', 'drug', 'pill', 'tablet', 'dose', 'treatment', 'therapy', 'diagnos', 'blood', 'heart', 'lung',
  'liver', 'kidney', 'stomach', 'gut', 'head', 'throat', 'skin', 'rash', 'allerg', 'diabet', 'cancer', 'asthma',
  'pressure', 'cholesterol', 'anxiety', 'depress', 'stress', 'sleep', 'insomnia', 'diet', 'nutrition', 'vitamin',
  'exercise', 'weight', 'pregnan', 'period', 'menstru', 'injury', 'wound', 'burn', 'fracture', 'sprain', 'nausea',
  'vomit', 'diarr', 'constipat', 'dizz', 'fatigue', 'tired', 'sore', 'swelling', 'cramp', 'migraine', 'headache',
  'mental', 'wellbeing', 'body', 'muscle', 'bone', 'joint', 'eye', 'ear', 'nose', 'tooth', 'teeth', 'dental',
  'mood', 'vaccine', 'immune', 'hormone', 'thyroid', 'bruise', 'bleed', 'breath', 'chest', 'faint', 'seizure',
  'anemia', 'ulcer', 'arthritis', 'covid', 'flu', 'nutrient', 'calorie', 'fitness', 'hydrat', 'poison'];
function isHealthRelated(text) {
  const s = text.toLowerCase();
  return HEALTH_TERMS.some(t => s.includes(t));
}


async function getReply(raw) {
  const text = raw.toLowerCase();
  if (CRISIS_KEYS.some(k => text.includes(k))) return { text: CRISIS_REPLY, urgent: true };
  const urgent = scan(URGENT, text); if (urgent) return { text: urgent, urgent: true };
  const common = scan(COMMON, text); if (common) return { text: common };
  const wiki = await wikiAnswer(raw);
  if (wiki) return { text: wiki.text, source: wiki.url };
  if (isHealthRelated(raw))
    return { text: "This is a health question, but I can't answer it reliably enough to be safe here, it's beyond what I should try to judge on my own. Please check with a doctor, pharmacist, or nurse, who can advise you properly." };
  return { text: "This looks like it's outside health, which is the only area I'm built to classify and answer. If it is a medical concern, a doctor or another health professional is the right person to advise you." };
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
    addMsg(r.text, 'bot', { disclaimer: true, source: r.source, urgent: r.urgent });
    recordMsg('bot', r.text);
  } catch (e) {
    hideTyping();
    addMsg("Sorry, I had trouble answering that just now. Please try again.", 'bot');
  } finally { el('chat-send').disabled = false; }
}

function initChat() {
  addMsg("Hi, I'm Dr. Sana. Ask me almost any health question, from symptoms to conditions to healthy habits, and I'll do my best.", 'bot', { disclaimer: true });
  el('chat-send').addEventListener('click', () => handleSend());
  el('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  el('chat-suggest').addEventListener('click', e => { const b = e.target.closest('button'); if (b) handleSend(b.textContent); });
}
