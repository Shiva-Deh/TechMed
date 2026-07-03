/* ============================================================
   App shell — bottom-nav switching + boot
   ============================================================ */

const VIEWS = ['home', 'blogs', 'chat', 'health'];

function switchView(name) {
  VIEWS.forEach(v => {
    document.getElementById('view-' + v).classList.toggle('is-active', v === name);
  });
  document.querySelectorAll('.nav__btn').forEach(b => {
    b.classList.toggle('is-active', b.dataset.view === name);
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function initNav() {
  document.querySelector('.nav__inner').addEventListener('click', e => {
    const btn = e.target.closest('.nav__btn');
    if (btn) switchView(btn.dataset.view);
  });
  // logo returns home
  document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); switchView('home'); });
  document.getElementById('see-all').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('blog-rail').scrollBy({ left: 300, behavior: 'smooth' });
  });
}

function initDailyTip() {
  const tips = [
    "Stand up and stretch once an hour — your back and focus both thank you.",
    "A two-minute walk after eating helps steady your blood sugar.",
    "Longer exhales calm the body: breathe in for 4, out for 6.",
    "Morning daylight within an hour of waking sets a better sleep rhythm.",
    "Swap one snack for a piece of fruit and a handful of nuts today.",
    "Text someone you care about — connection is good medicine too."
  ];
  // rotate by day so it feels fresh but is stable through the day
  const i = new Date().getDate() % tips.length;
  document.getElementById('daily-tip').textContent = tips[i];
}

function initVitals() {
  // Pull today's water/sleep from the health log if it exists, else nice defaults.
  let water = 6, sleepH = 7, sleepM = 20, steps = 7248;
  try {
    const list = JSON.parse(localStorage.getItem('techmed_health')) || [];
    const today = list[list.length - 1];
    if (today) {
      if (typeof today.water === 'number') water = today.water;
      if (typeof today.sleep === 'number') {
        sleepH = Math.floor(today.sleep);
        sleepM = Math.round((today.sleep - sleepH) * 60);
      }
    }
  } catch (e) {}

  // WATER — fill height between 15% and 72% of the box
  const pct = Math.max(0, Math.min(water / 8, 1));
  const fill = document.getElementById('water-fill');
  const gl = document.getElementById('water-glasses');
  if (fill) setTimeout(() => { fill.style.height = (15 + pct * 57) + '%'; }, 250);
  if (gl) gl.textContent = water;
  const wsub = document.getElementById('water-sub');
  if (wsub) wsub.textContent = 'of 8 today';

  // STEPS — count up + fill the ring
  const goal = 10000;
  const frac = Math.min(steps / goal, 1);
  const prog = document.getElementById('steps-prog');
  const C = 2 * Math.PI * 50; // 314
  if (prog) setTimeout(() => { prog.style.strokeDashoffset = C * (1 - frac); }, 300);
  const countEl = document.getElementById('steps-count');
  if (countEl) {
    let cur = 0;
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      cur = Math.round(steps * (0.5 - Math.cos(Math.PI * p) / 2)); // ease
      countEl.textContent = cur.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // SLEEP
  const sh = document.getElementById('sleep-h'), sm = document.getElementById('sleep-m');
  if (sh) sh.textContent = sleepH;
  if (sm) sm.textContent = String(sleepM).padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDailyTip();
  initBlogs();
  initChat();
  initHealth();
  initVitals();
});
