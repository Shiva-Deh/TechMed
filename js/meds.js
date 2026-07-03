/* ============================================================
   Medication reminders, a month calendar on the Home page.
   - Tap a day to select it.
   - Choose "Just this day" (one date) or "Every <weekday>".
   - Add a medication name + how much, saved as a reminder.
   Saved on this device under 'techmed_meds'.
   ============================================================ */

const MEDS_STORE = 'techmed_meds';
const DOW_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let medView = new Date();               // month currently shown
let medSelected = ymd(new Date());      // selected date "YYYY-MM-DD"
let medScope = 'once';                   // 'once' | 'weekly'

function loadMeds() { try { return JSON.parse(localStorage.getItem(MEDS_STORE)) || []; } catch { return []; } }
function saveMeds(list) { localStorage.setItem(MEDS_STORE, JSON.stringify(list)); }

function ymd(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function parseYmd(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function weekdayOf(s) { return parseYmd(s).getDay(); }

/* does a date have any reminder? (a specific one, or a weekly match) */
function remindersForDate(dateStr) {
  const wd = weekdayOf(dateStr);
  return loadMeds().filter(r =>
    (r.type === 'once' && r.date === dateStr) ||
    (r.type === 'weekly' && r.weekday === wd)
  );
}

/* ---------- calendar ---------- */
function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  const title = document.getElementById('cal-title');
  if (!grid) return;

  const y = medView.getFullYear(), m = medView.getMonth();
  title.textContent = MONTHS[m] + ' ' + y;

  const firstDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const todayStr = ymd(new Date());

  let cells = '';
  for (let i = 0; i < firstDow; i++) cells += '<span class="cal__cell cal__cell--empty"></span>';
  for (let d = 1; d <= days; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const has = remindersForDate(dateStr).length > 0;
    const cls = ['cal__cell'];
    if (dateStr === todayStr) cls.push('is-today');
    if (dateStr === medSelected) cls.push('is-selected');
    cells += `<button class="${cls.join(' ')}" data-date="${dateStr}">
                ${d}${has ? '<i class="cal__dot"></i>' : ''}
              </button>`;
  }
  grid.innerHTML = cells;
}

/* ---------- selected-day panel ---------- */
function renderMedPanel() {
  const label = document.getElementById('med-sel-label');
  const wdSpan = document.getElementById('scope-weekday');
  const d = parseYmd(medSelected);
  label.textContent = 'Selected day: ' + d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  wdSpan.textContent = DOW_LONG[d.getDay()];

  // reflect scope buttons
  document.querySelectorAll('#med-scope .seg__btn').forEach(b =>
    b.classList.toggle('is-on', b.dataset.scope === medScope));

  renderMedList();
}

function renderMedList() {
  const wrap = document.getElementById('med-list');
  const list = remindersForDate(medSelected);
  if (list.length === 0) {
    wrap.innerHTML = '<p class="empty-note">No medication set for this day yet.</p>';
    return;
  }
  wrap.innerHTML = list.map(r => {
    const when = r.type === 'weekly' ? `Every ${DOW_LONG[r.weekday]}` : 'This day only';
    return `<div class="med-item">
      <button class="note-del" data-mdel="${r.id}" aria-label="Delete reminder">&times;</button>
      <b class="med-item__name">${escapeHtml(r.med)}</b>
      <div class="med-item__dose">${escapeHtml(r.dose || '')}</div>
      <span class="med-item__when">${when}</span>
    </div>`;
  }).join('');
}

/* ---------- actions ---------- */
function addMed() {
  const nameEl = document.getElementById('med-name');
  const doseEl = document.getElementById('med-dose');
  const med = nameEl.value.trim();
  const dose = doseEl.value.trim();
  if (!med) { nameEl.focus(); return; }

  const list = loadMeds();
  const base = { id: String(Date.now()), med, dose };
  if (medScope === 'weekly') list.push({ ...base, type: 'weekly', weekday: weekdayOf(medSelected) });
  else list.push({ ...base, type: 'once', date: medSelected });
  saveMeds(list);

  nameEl.value = ''; doseEl.value = '';
  renderCalendar();
  renderMedList();

  const btn = document.getElementById('med-add');
  const original = btn.textContent;
  btn.textContent = 'Added \u2713';
  setTimeout(() => (btn.textContent = original), 1300);
}

function initMeds() {
  document.getElementById('cal-prev').addEventListener('click', () => { medView.setMonth(medView.getMonth() - 1); renderCalendar(); });
  document.getElementById('cal-next').addEventListener('click', () => { medView.setMonth(medView.getMonth() + 1); renderCalendar(); });

  document.getElementById('cal-grid').addEventListener('click', e => {
    const cell = e.target.closest('[data-date]');
    if (!cell) return;
    medSelected = cell.getAttribute('data-date');
    renderCalendar();
    renderMedPanel();
  });

  document.getElementById('med-scope').addEventListener('click', e => {
    const b = e.target.closest('.seg__btn'); if (!b) return;
    medScope = b.dataset.scope;
    renderMedPanel();
  });

  document.getElementById('med-add').addEventListener('click', addMed);

  document.getElementById('med-list').addEventListener('click', e => {
    const del = e.target.closest('[data-mdel]');
    if (!del) return;
    const id = del.getAttribute('data-mdel');
    saveMeds(loadMeds().filter(r => r.id !== id));
    renderCalendar();
    renderMedList();
  });

  renderCalendar();
  renderMedPanel();
}
