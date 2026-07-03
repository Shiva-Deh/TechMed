/* ============================================================
   App shell, routing, bottom nav, Home widgets, boot
   ============================================================ */

const VIEWS = ['home', 'blogs', 'chat', 'health', 'notes'];

function switchView(name) {
  if (!VIEWS.includes(name)) name = 'home';
  VIEWS.forEach(v => {
    document.getElementById('view-' + v).classList.toggle('is-active', v === name);
  });
  document.querySelectorAll('.nav__btn').forEach(b => {
    b.classList.toggle('is-active', b.dataset.view === name);
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ---- hash routing (supports opening a blog in a new tab) ---- */
function route() {
  const h = location.hash;
  const blog = h.match(/^#blog\/(.+)$/);
  if (blog) {
    switchView('blogs');
    showBlogDetail(decodeURIComponent(blog[1]));
    return;
  }
  const view = h.replace('#', '');
  switchView(VIEWS.includes(view) ? view : 'home');
  if (view === 'blogs' || view === '') showBlogList();
}

function initNav() {
  document.querySelector('.nav__inner').addEventListener('click', e => {
    const btn = e.target.closest('.nav__btn');
    if (btn) location.hash = '#' + btn.dataset.view;
  });
  document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); location.hash = '#home'; });

  // any element with data-view-link jumps to that view
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-view-link]');
    if (link) { e.preventDefault(); location.hash = '#' + link.getAttribute('data-view-link'); }
  });

  window.addEventListener('hashchange', route);
}

/* ---- Recent conversations on Home ---- */
function renderRecentConvos() {
  const wrap = document.getElementById('recent-convos');
  if (!wrap) return;
  const list = (typeof getRecentConvos === 'function') ? getRecentConvos(3) : [];
  if (list.length === 0) {
    wrap.innerHTML = '<div class="cond"><div class="cond__txt"><b>No conversations yet</b><small>Ask Dr. Sana something in the Chat tab.</small></div></div>';
    return;
  }
  const half = s => s.length > 46 ? s.slice(0, 46).trim() + '…' : s;
  wrap.innerHTML = list.map(c => {
    const when = new Date(c.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `<div class="cond convo" data-convo="${c.id}">
      <span class="cond__dot" style="background:#2E6BE6"></span>
      <div class="cond__txt"><b>${escapeHtml(half(c.title))}</b><small>${c.msgs.length} messages · ${when}</small></div>
      <span class="cond__link">Open ›</span>
    </div>`;
  }).join('');
}

function initRecentConvos() {
  const wrap = document.getElementById('recent-convos');
  wrap.addEventListener('click', e => {
    const row = e.target.closest('[data-convo]');
    if (!row) return;
    const id = row.getAttribute('data-convo');
    if (typeof loadConvoIntoChat === 'function') loadConvoIntoChat(id);
    location.hash = '#chat';
  });
  renderRecentConvos();
}

/* ---- Home vitals (water fills, steps counts, sleep moon) ---- */
function initVitals() {
  let water = 6, sleepH = 7, sleepM = 20, steps = null;
  try {
    const list = JSON.parse(localStorage.getItem('techmed_health')) || [];
    const today = list[list.length - 1];
    if (today) {
      if (typeof today.water === 'number') water = today.water;
      if (typeof today.steps === 'number') steps = today.steps;
      if (typeof today.sleep === 'number') {
        sleepH = Math.floor(today.sleep);
        sleepM = Math.round((today.sleep - sleepH) * 60);
      }
    }
  } catch (e) {}
  if (steps == null) steps = 0;   // real steps come from the Health check-in

  // WATER
  const pct = Math.max(0, Math.min(water / 8, 1));
  const fill = document.getElementById('water-fill');
  if (fill) setTimeout(() => { fill.style.height = (15 + pct * 57) + '%'; }, 250);
  const gl = document.getElementById('water-glasses'); if (gl) gl.textContent = water;

  // STEPS
  const goal = 10000;
  const frac = Math.min(steps / goal, 1);
  const prog = document.getElementById('steps-prog');
  const C = 2 * Math.PI * 50;
  if (prog) setTimeout(() => { prog.style.strokeDashoffset = C * (1 - frac); }, 300);
  const countEl = document.getElementById('steps-count');
  if (countEl) {
    const target = steps, t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      countEl.textContent = Math.round(target * (0.5 - Math.cos(Math.PI * p) / 2)).toLocaleString();
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
  initBlogs();
  initChat();
  initHealth();
  initNotes();
  initMeds();
  initRecentConvos();
  initVitals();
  route();   // honor any #hash on first load (e.g. a shared blog link)
});
