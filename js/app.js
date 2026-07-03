/* ============================================================
   App shell — bottom-nav switching + boot
   ============================================================ */

const VIEWS = ['home', 'chat', 'health'];

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

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDailyTip();
  initBlogs();
  initChat();
  initHealth();
});
