/* ============================================================
   Patient History, the baseline intake questionnaire.
   Question types (from the source document):
     text / textarea / number  = open-ended, written answer
     multi                      = choose one or more options
     single                     = choose one option
     yesno                      = Yes / No  (starred ones show a
                                  follow-up box for clarification)
   Answers are saved on this device under 'techmed_history' and
   are structured so a later symptom module can consume them.
   ============================================================ */

const HISTORY_STORE = 'techmed_history';

const HISTORY_SCHEMA = [
  { title: 'Identification', questions: [
    { id: 'name', label: 'Full name', type: 'text' },
    { id: 'preferred', label: 'Preferred name', type: 'text' },
    { id: 'age', label: 'Age', type: 'number' },
    { id: 'occupation', label: 'Current occupation', type: 'text' },
    { id: 'gender', label: 'Gender', type: 'single', options: ['Female', 'Male', 'Non-binary', 'Self-describe', 'Prefer not to say'] },
    { id: 'ethnicity', label: 'Ethnic background', type: 'text' },
  ]},
  { title: 'Past medical history', questions: [
    { id: 'pmh_walk', label: 'Can you walk me through any major illnesses, hospitalizations, or surgeries you have had?', type: 'textarea' },
    { id: 'pmh_chronic', label: 'Have you ever been diagnosed with any of these?', type: 'multi', options: ['High blood pressure', 'Diabetes', 'High cholesterol', 'Heart disease'] },
    { id: 'pmh_lung', label: 'Any chronic lung conditions (asthma or COPD)?', type: 'yesno', clarify: 'Which one, and how is it managed?' },
    { id: 'pmh_clot', label: 'Any history of blood clots or stroke?', type: 'yesno', clarify: 'When, and any lasting effects?' },
    { id: 'pmh_organ', label: 'Have you ever been told you have a thyroid, kidney, or liver problem?', type: 'yesno', clarify: 'Which, and any treatment?' },
    { id: 'pmh_hosp', label: 'Have you ever been hospitalized overnight?', type: 'yesno', clarify: 'What was it for?' },
  ]},
  { title: 'Past surgical history', questions: [
    { id: 'psh_ops', label: 'Tell me about any operations you have had, including roughly when.', type: 'textarea' },
    { id: 'psh_comp', label: 'Were there any complications, such as bleeding, infection, or reactions to anesthesia?', type: 'yesno', clarify: 'Please describe.' },
  ]},
  { title: 'Medications', questions: [
    { id: 'meds_current', label: 'What medications, over-the-counter items, or supplements do you take?', type: 'textarea' },
    { id: 'meds_change', label: 'Have you recently started or stopped any medication?', type: 'yesno', clarify: 'Which, and why?' },
    { id: 'meds_adhere', label: 'How often do you take them as prescribed?', type: 'single', options: ['Always', 'Usually', 'Sometimes', 'Rarely'] },
  ]},
  { title: 'Allergies', questions: [
    { id: 'allergy_any', label: 'Do you have any allergies to medications, foods, or other substances?', type: 'yesno', clarify: 'What are you allergic to, and what happens?' },
    { id: 'allergy_severe', label: 'Have you ever had a severe reaction needing an epinephrine injection or an ER visit?', type: 'yesno' },
  ]},
  { title: 'Family history', questions: [
    { id: 'fh_parents', label: 'Are your parents alive and generally healthy? If deceased, at what age and from what cause?', type: 'textarea' },
    { id: 'fh_sib', label: 'Do you have siblings or children, and are they healthy?', type: 'yesno', clarify: 'Please share any concerns.' },
    { id: 'fh_runs', label: 'Are there any illnesses that run in the family?', type: 'yesno', clarify: 'Which ones?' },
    { id: 'fh_worried', label: 'Is there anything in your family history you are worried about?', type: 'textarea' },
    { id: 'fh_blood', label: 'Are your parents related by blood?', type: 'yesno' },
    { id: 'fh_cardiac', label: 'Any heart attack, stroke, or sudden death in a close relative at a young age (before about 55 in men, 65 in women)?', type: 'yesno' },
    { id: 'fh_cancer', label: 'Any cancer in the family?', type: 'yesno', clarify: 'What type, which relative, and at what age?' },
    { id: 'fh_metabolic', label: 'Does diabetes, thyroid, or autoimmune disease run in the family?', type: 'yesno', clarify: 'Which?' },
    { id: 'fh_clot_mh', label: 'Any blood-clotting disorders, or mental-health conditions in the family?', type: 'yesno', clarify: 'Please describe.' },
  ]},
  { title: 'Social history', questions: [
    { id: 'sh_living', label: 'Who do you live with, and is your housing stable?', type: 'textarea' },
    { id: 'sh_safe', label: 'Do you feel safe at home?', type: 'yesno', safety: 'home' },
    { id: 'sh_work', label: 'What do you do for work or school? Any exposure to chemicals, dust, fumes, or radiation?', type: 'textarea' },
    { id: 'sh_smoke', label: 'Do you smoke or vape, now or in the past?', type: 'single', options: ['Never', 'In the past', 'Currently'] },
    { id: 'sh_smoke_amt', label: 'If so, how much and for how long?', type: 'text' },
    { id: 'sh_alcohol', label: 'How often do you drink, and how much on a typical day?', type: 'text' },
    { id: 'sh_alcohol_cut', label: 'Have you ever felt you should cut down?', type: 'yesno' },
    { id: 'sh_drugs', label: 'Do you use cannabis or any recreational drugs?', type: 'yesno', clarify: 'Which, and how often?' },
    { id: 'sh_inject', label: 'Do you ever inject, or share needles or equipment?', type: 'yesno' },
    { id: 'sh_diet', label: 'What is your typical diet like? Any recent appetite or weight changes?', type: 'textarea' },
    { id: 'sh_exercise', label: 'Do you exercise? What type, and how often?', type: 'text' },
    { id: 'sh_sleep', label: 'How many hours do you sleep, do you feel rested, and do you snore or have pauses in breathing?', type: 'textarea' },
    { id: 'sh_doctor', label: 'Do you have a family doctor?', type: 'yesno' },
    { id: 'sh_afford', label: 'Can you afford your medications?', type: 'yesno' },
    { id: 'sh_barriers', label: 'Any barriers to getting care?', type: 'multi', options: ['Cost', 'Transport', 'Language', 'None'] },
    { id: 'sh_travel', label: 'Any recent travel or sick contacts?', type: 'yesno', clarify: 'Where, or who?' },
  ]},
  { title: 'Mental health & safety', note: 'You can skip anything you are not comfortable answering.', questions: [
    { id: 'mh_mood', label: 'How is your mood lately?', type: 'single', options: ['Good', 'Okay', 'Low', 'Very low'] },
    { id: 'mh_support', label: 'Any major stressors, and do you have support from friends or family?', type: 'textarea' },
    { id: 'mh_selfharm', label: "Have you had any thoughts of harming yourself, or that life isn't worth living?", type: 'yesno', safety: 'selfharm' },
  ]},
  { title: 'Sexual & reproductive history', optional: true, note: 'Optional, share only if relevant.', questions: [
    { id: 'sr_active', label: 'Are you sexually active, and do you use protection or contraception?', type: 'textarea' },
    { id: 'sr_preg', label: 'Any chance you could be pregnant, or when was your last period? (if applicable)', type: 'text' },
  ]},
  { title: 'Function & independence', optional: true, note: 'Optional, mainly relevant for older or frail patients.', questions: [
    { id: 'fi_adl', label: 'Are you independent with daily activities (bathing, dressing, cooking, managing medications)?', type: 'yesno' },
    { id: 'fi_falls', label: 'Any recent falls?', type: 'yesno', clarify: 'How many, and any injuries?' },
  ]},
];

let answers = loadHistory();
function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_STORE)) || {}; } catch { return {}; } }
function saveHistory() { localStorage.setItem(HISTORY_STORE, JSON.stringify(answers)); }

const SAFETY_HTML = {
  selfharm: `If you are having thoughts of harming yourself, please reach out now, you do not have to face this alone.
    In Canada or the US you can call or text <b>988</b> (Suicide Crisis Helpline). If you are elsewhere or in immediate danger,
    contact your local emergency number. Talking to someone you trust can help too.`,
  home: `If you do not feel safe at home, support is available. Consider reaching out to someone you trust or a local support
    service, and in an emergency contact your local emergency number.`
};

function qHTML(q) {
  let inner = '';
  if (q.type === 'text' || q.type === 'number') {
    inner = `<input class="field-in" data-field="${q.id}" type="${q.type === 'number' ? 'number' : 'text'}" />`;
  } else if (q.type === 'textarea') {
    inner = `<textarea class="field-in" data-field="${q.id}"></textarea>`;
  } else if (q.type === 'single') {
    inner = `<div class="seg wrap-seg">${q.options.map(o =>
      `<button type="button" class="seg__btn" data-single="${q.id}" data-val="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}</div>`;
  } else if (q.type === 'multi') {
    inner = `<div class="chk-group">${q.options.map(o =>
      `<label class="chk"><input type="checkbox" data-multi="${q.id}" value="${escapeHtml(o)}"><span>${escapeHtml(o)}</span></label>`).join('')}</div>`;
  } else if (q.type === 'yesno') {
    inner = `<div class="yn">
        <button type="button" class="yn__btn" data-yn="${q.id}" data-val="yes">Yes</button>
        <button type="button" class="yn__btn" data-yn="${q.id}" data-val="no">No</button>
      </div>`;
    if (q.clarify) inner += `<textarea class="field-in clarify" data-clarify="${q.id}" placeholder="${escapeHtml(q.clarify)}" hidden></textarea>`;
    if (q.safety) inner += `<div class="safety-note" data-safety="${q.id}" hidden>${SAFETY_HTML[q.safety]}</div>`;
  }
  return `<div class="hq"><label class="hq__label">${escapeHtml(q.label)}</label>${inner}</div>`;
}

function sectionHTML(sec) {
  const body = sec.questions.map(qHTML).join('');
  const note = sec.note ? `<p class="hq__note">${escapeHtml(sec.note)}</p>` : '';
  if (sec.optional) {
    return `<details class="hsec hsec--opt"><summary>${escapeHtml(sec.title)} <span class="opt-tag">optional</span></summary>${note}${body}</details>`;
  }
  return `<div class="hsec"><h3 class="hsec__title">${escapeHtml(sec.title)}</h3>${note}${body}</div>`;
}

function applySaved() {
  const form = document.getElementById('history-form');
  // text/number/textarea
  form.querySelectorAll('[data-field]').forEach(el => { const v = answers[el.dataset.field]; if (v != null) el.value = v; });
  // single
  form.querySelectorAll('[data-single]').forEach(b => { if (answers[b.dataset.single] === b.dataset.val) b.classList.add('is-on'); });
  // multi
  form.querySelectorAll('[data-multi]').forEach(c => { const a = answers[c.dataset.multi] || []; if (a.includes(c.value)) c.checked = true; });
  // yesno + clarify + safety
  form.querySelectorAll('[data-yn]').forEach(b => {
    const val = answers[b.dataset.yn];
    if (val === b.dataset.val) b.classList.add('is-on');
  });
  form.querySelectorAll('[data-clarify]').forEach(t => {
    const id = t.dataset.clarify;
    if (answers[id] === 'yes') t.hidden = false;
    if (answers[id + '_note'] != null) t.value = answers[id + '_note'];
  });
  form.querySelectorAll('[data-safety]').forEach(n => {
    const id = n.dataset.safety;
    const trigger = (n.parentElement.querySelector('[data-yn]').dataset.yn); // same id
    const val = answers[id];
    const show = (SAFETY_MODE(id) === 'yes' && val === 'yes') || (SAFETY_MODE(id) === 'no' && val === 'no');
    n.hidden = !show;
  });
}

// which answer reveals the safety note for a given question id
function SAFETY_MODE(id) {
  for (const sec of HISTORY_SCHEMA) for (const q of sec.questions)
    if (q.id === id && q.safety) return q.safety === 'home' ? 'no' : 'yes';
  return 'yes';
}

function initHistory() {
  const form = document.getElementById('history-form');
  if (!form) return;
  form.innerHTML = HISTORY_SCHEMA.map(sectionHTML).join('');
  applySaved();

  // text / textarea / number / clarify
  form.addEventListener('input', e => {
    const f = e.target.closest('[data-field]');
    if (f && f.dataset.field) { answers[f.dataset.field] = f.value; saveHistory(); return; }
    const c = e.target.closest('[data-clarify]');
    if (c) { answers[c.dataset.clarify + '_note'] = c.value; saveHistory(); }
  });

  // checkboxes
  form.addEventListener('change', e => {
    const c = e.target.closest('[data-multi]');
    if (!c) return;
    const id = c.dataset.multi;
    const picked = [...form.querySelectorAll(`[data-multi="${id}"]:checked`)].map(x => x.value);
    answers[id] = picked; saveHistory();
  });

  // buttons: single + yesno
  form.addEventListener('click', e => {
    const s = e.target.closest('[data-single]');
    if (s) {
      const id = s.dataset.single;
      answers[id] = s.dataset.val; saveHistory();
      form.querySelectorAll(`[data-single="${id}"]`).forEach(b => b.classList.toggle('is-on', b === s));
      return;
    }
    const y = e.target.closest('[data-yn]');
    if (y) {
      const id = y.dataset.yn, val = y.dataset.val;
      answers[id] = val; saveHistory();
      form.querySelectorAll(`[data-yn="${id}"]`).forEach(b => b.classList.toggle('is-on', b === y));
      // clarify box
      const clar = form.querySelector(`[data-clarify="${id}"]`);
      if (clar) clar.hidden = (val !== 'yes');
      // safety note
      const note = form.querySelector(`[data-safety="${id}"]`);
      if (note) note.hidden = !((SAFETY_MODE(id) === 'yes' && val === 'yes') || (SAFETY_MODE(id) === 'no' && val === 'no'));
    }
  });

function buildFlags() {
  const a = answers;
  const has = (id, val) => Array.isArray(a[id]) ? a[id].includes(val) : a[id] === val;
  const chronic = Array.isArray(a.pmh_chronic) ? a.pmh_chronic : [];
  const flags = [];

  if (chronic.includes('High blood pressure') || chronic.includes('Heart disease') || chronic.includes('High cholesterol') || a.fh_cardiac === 'yes' || a.sh_smoke === 'Currently')
    flags.push('Heart and blood pressure: regular blood pressure and cholesterol checks are worth keeping up.');
  if (chronic.includes('Diabetes') || a.fh_metabolic === 'yes')
    flags.push('Blood sugar: periodic screening is worth discussing, especially with family history.');
  if (a.pmh_lung === 'yes')
    flags.push('Breathing (asthma or COPD): keep any inhalers current and know your triggers.');
  if (a.pmh_clot === 'yes' || a.fh_clot_mh === 'yes')
    flags.push('Circulation: mention any clot or stroke history at your appointments.');
  if (a.allergy_any === 'yes' || a.allergy_severe === 'yes')
    flags.push('Allergies: keep any prescribed emergency medication (such as an epinephrine pen) with you.');
  if (a.sh_smoke === 'Currently')
    flags.push('Smoking: quitting is one of the biggest wins for your health, ask about support.');
  if (a.sh_alcohol_cut === 'yes')
    flags.push('Alcohol: you noted wanting to cut down, your doctor can help with that.');
  if (a.sh_inject === 'yes')
    flags.push('Injection safety: testing and harm-reduction services are available and confidential.');
  if (a.fh_cancer === 'yes')
    flags.push('Family cancer history: ask whether earlier or more frequent screening is right for you.');
  if (a.sh_doctor === 'no' || a.sh_afford === 'no')
    flags.push('Access to care: community health centres can help if cost or not having a doctor is a barrier.');
  if (a.fi_falls === 'yes')
    flags.push('Falls: a balance check and medication review can lower the risk of another one.');
  if (a.mh_mood === 'Low' || a.mh_mood === 'Very low')
    flags.push('Mental wellbeing: your mood answers suggest some support could help, a doctor or counsellor is a good step.');
  return flags;
}

function renderHistoryResult() {
  const box = document.getElementById('history-result');
  const flags = buildFlags();
  const crisis = answers.mh_selfharm === 'yes';

  let html = '<h3 class="hist-result__title">Based on your answers</h3>';
  html += '<p class="hist-result__note">This is a general summary to talk through with a professional, not a diagnosis.</p>';

  if (crisis) {
    html += `<div class="safety-note">You mentioned thoughts of harming yourself. Please reach out now, you deserve support.
      In Canada or the US you can call or text <b>988</b>, or contact your local emergency number.</div>`;
  }

  if (flags.length) {
    html += '<div class="flag-list">' + flags.map(f => {
      const i = f.indexOf(':');
      const head = i > 0 ? f.slice(0, i) : 'Worth noting';
      const rest = i > 0 ? f.slice(i + 1).trim() : f;
      return `<div class="flag"><b>${escapeHtml(head)}</b><span>${escapeHtml(rest)}</span></div>`;
    }).join('') + '</div>';
  } else {
    html += '<p class="hist-result__ok">Nothing specific stood out from your answers. Keep up your healthy habits, and check in with a doctor for anything that changes.</p>';
  }

  html += `<div class="ask-cta">
      <span>Have more questions about any of these?</span>
      <button class="ask-cta__btn" type="button" data-view-link="chat">Ask our chatbot &rarr;</button>
    </div>`;

  box.innerHTML = html;
  box.hidden = false;
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

  document.getElementById('history-save').addEventListener('click', () => {
    saveHistory();
    renderHistoryResult();
    const btn = document.getElementById('history-save');
    const o = btn.textContent; btn.textContent = 'Saved to this device';
    setTimeout(() => (btn.textContent = o), 1600);
  });
}
