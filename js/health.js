/* ============================================================
   Health tracking
   - Simple daily check-ins stored in this browser (localStorage).
   - Two headline "rings" (Mind + Body), metric tiles, a 7-day
     trend chart, and a quick log form.
   - Kept intentionally gentle: no calorie counting or targets,
     just supportive awareness of mind and body.
   ============================================================ */

const HEALTH_STORE = 'techmed_health';
let selectedMood = 4;
let trendChart = null;

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(HEALTH_STORE)) || []; }
  catch { return []; }
}
function saveEntries(list) { localStorage.setItem(HEALTH_STORE, JSON.stringify(list)); }
function todayKey() { return new Date().toISOString().slice(0, 10); }

/* ---- scores (0–100), gentle formulas ---- */
function mindScore(e) {
  if (!e) return null;
  const mood = (e.mood - 1) / 4;             // 0..1
  const calm = (10 - e.stress) / 9;          // 0..1 (less stress = higher)
  return Math.round((mood * 0.6 + calm * 0.4) * 100);
}
function bodyScore(e) {
  if (!e) return null;
  const sleepFit = 1 - Math.min(Math.abs(e.sleep - 8) / 4, 1); // best near 8h
  const waterFit = Math.min(e.water / 8, 1);
  const energy = (e.energy - 1) / 9;
  return Math.round((sleepFit * 0.4 + waterFit * 0.25 + energy * 0.35) * 100);
}

/* ---- SVG ring ---- */
function drawRing(svgId, value, color) {
  const svg = document.getElementById(svgId);
  const v = value == null ? 0 : value;
  const R = 46, C = 2 * Math.PI * R;
  const off = C * (1 - v / 100);
  const label = value == null ? '–' : v;
  svg.innerHTML = `
    <circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--line)" stroke-width="10"/>
    <circle cx="60" cy="60" r="${R}" fill="none" stroke="${color}" stroke-width="10"
      stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}"
      transform="rotate(-90 60 60)" style="transition:stroke-dashoffset .7s ease"/>
    <text class="val" x="60" y="58" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <text class="unit" x="60" y="76" text-anchor="middle">out of 100</text>`;
}

/* ---- metric tiles ---- */
function trendPill(cur, prev, invert = false) {
  if (prev == null || cur == null) return '';
  const up = cur > prev;
  const good = invert ? !up : up;
  const arrow = up ? '▲' : (cur < prev ? '▼' : '–');
  return `<span class="trend ${good ? 'up' : 'down'}">${arrow}</span>`;
}

function renderMetrics(entries) {
  const grid = document.getElementById('metric-grid');
  const today = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const moodFace = ['😴','😞','😕','😐','🙂','😄'];

  const tiles = [
    { ico:'🧠', lab:'Mood today',  big: today ? moodFace[today.mood] : '—', pill:'' },
    { ico:'😴', lab:'Sleep',       big: today ? today.sleep + 'h' : '—', pill: today&&prev?trendPill(today.sleep, prev.sleep):'' },
    { ico:'💧', lab:'Water',       big: today ? today.water : '—',        pill: today&&prev?trendPill(today.water, prev.water):'' },
    { ico:'⚡', lab:'Energy',      big: today ? today.energy+'/10' : '—', pill: today&&prev?trendPill(today.energy, prev.energy):'' },
    { ico:'🌊', lab:'Stress',      big: today ? today.stress+'/10' : '—', pill: today&&prev?trendPill(today.stress, prev.stress, true):'' },
    { ico:'📆', lab:'Check-ins',   big: entries.length,                    pill:'' },
  ];

  grid.innerHTML = tiles.map(t => `
    <div class="metric">
      <div class="top"><span class="ico">${t.ico}</span>${t.pill}</div>
      <div class="big">${t.big}</div>
      <div class="lab">${t.lab}</div>
    </div>`).join('');
}

/* ---- 7-day chart ---- */
function renderChart(entries) {
  const last7 = entries.slice(-7);
  const labels = last7.map(e => e.date.slice(5));           // MM-DD
  const mood = last7.map(e => e.mood * 2);                  // scale 1-5 -> 2-10
  const sleep = last7.map(e => e.sleep);

  const ctx = document.getElementById('trend-chart');
  if (trendChart) trendChart.destroy();

  if (last7.length === 0) {
    ctx.parentElement.innerHTML = '<p style="color:var(--muted);font-size:14px;text-align:center;padding:40px 0">Log a day or two and your trend appears here.</p>';
    return;
  }

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Mood', data: mood, borderColor: '#1E3A6E', backgroundColor: 'rgba(30,58,110,.12)', tension: .35, fill: true, pointRadius: 3 },
        { label: 'Sleep (h)', data: sleep, borderColor: '#E5566D', backgroundColor: 'rgba(229,86,109,.10)', tension: .35, fill: false, pointRadius: 3, borderDash: [5,4] }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, suggestedMax: 10, grid: { color: '#EAF1EE' } }, x: { grid: { display: false } } },
      plugins: { legend: { labels: { boxWidth: 12, font: { size: 12 } } } }
    }
  });
}

/* ---- main render ---- */
function renderHealth() {
  const entries = loadEntries();
  const today = entries[entries.length - 1];
  drawRing('ring-mind', mindScore(today), '#1E3A6E');
  drawRing('ring-body', bodyScore(today), '#E5566D');
  renderMetrics(entries);
  renderChart(entries);
}

/* ---- log form ---- */
function saveToday() {
  const entry = {
    date: todayKey(),
    mood: selectedMood,
    energy: +document.getElementById('in-energy').value,
    stress: +document.getElementById('in-stress').value,
    sleep: +document.getElementById('in-sleep').value,
    water: +document.getElementById('in-water').value,
    note: document.getElementById('in-note').value.trim()
  };
  const entries = loadEntries();
  const i = entries.findIndex(e => e.date === entry.date);
  if (i >= 0) entries[i] = entry; else entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  saveEntries(entries);
  renderHealth();

  const btn = document.getElementById('save-log');
  const original = btn.textContent;
  btn.textContent = '✓ Saved for today';
  setTimeout(() => (btn.textContent = original), 1600);
}

function initHealth() {
  // sliders live value
  ['energy','stress'].forEach(k => {
    const inp = document.getElementById('in-' + k);
    const out = document.getElementById('sv-' + k);
    inp.addEventListener('input', () => (out.textContent = inp.value));
  });
  // mood buttons
  document.getElementById('mood-row').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    selectedMood = +b.dataset.mood;
    document.querySelectorAll('#mood-row button').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
  });
  document.querySelector('#mood-row button[data-mood="4"]').classList.add('sel');

  // prefill from today's entry if it exists
  const today = loadEntries().find(e => e.date === todayKey());
  if (today) {
    selectedMood = today.mood;
    document.getElementById('in-energy').value = today.energy;
    document.getElementById('sv-energy').textContent = today.energy;
    document.getElementById('in-stress').value = today.stress;
    document.getElementById('sv-stress').textContent = today.stress;
    document.getElementById('in-sleep').value = today.sleep;
    document.getElementById('in-water').value = today.water;
    document.getElementById('in-note').value = today.note || '';
    document.querySelectorAll('#mood-row button').forEach(x => x.classList.remove('sel'));
    document.querySelector(`#mood-row button[data-mood="${today.mood}"]`)?.classList.add('sel');
  }

  document.getElementById('save-log').addEventListener('click', saveToday);
  renderHealth();
}
