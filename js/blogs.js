/* ============================================================
   Blog rendering
   - Home: a carousel with a big center story and smaller
     snapshots either side. Swipe or tap a side to change it.
   - Blogs page: a grid, or one full article (#blog/<id>).
   Each post links to #blog/<id> so it opens the full article
   (and can be opened in a new tab).
   ============================================================ */

function tileHTML(post) {
  if (post.image && post.image.trim() !== "") {
    return `<img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
  }
  return `<div class="ph" data-hue="${post.hue || 'mint'}">
            <div class="ph__grain"></div>
            <div class="ph__icon">${post.icon || '\uD83E\uDE7A'}</div>
          </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

/* ---------- Home carousel ---------- */
let carIndex = 0;

function mainCardHTML(p) {
  return `<a class="car-card car-card--main" href="#blog/${p.id}">
    <div class="car-card__media">${tileHTML(p)}</div>
    <div class="car-card__body">
      <span class="tag">${escapeHtml(p.tag)}</span>
      <h4>${escapeHtml(p.title)}</h4>
      <p>${escapeHtml(p.summary)}</p>
      <span class="meta">${escapeHtml(p.date)} &middot; 2 min read</span>
    </div>
  </a>`;
}
function sideCardHTML(p, side) {
  return `<button class="car-card car-card--side ${side}" data-side="${p.id}" type="button" aria-label="${escapeHtml(p.title)}">
    <div class="car-card__media">${tileHTML(p)}</div>
    <span class="car-card__mini">${escapeHtml(p.title)}</span>
  </button>`;
}
function renderCarousel() {
  const stage = document.getElementById('car-stage');
  if (!stage) return;
  const n = BLOGS.length;
  const i = ((carIndex % n) + n) % n;
  const left = BLOGS[(i - 1 + n) % n];
  const center = BLOGS[i];
  const right = BLOGS[(i + 1) % n];
  stage.innerHTML = sideCardHTML(left, 'left') + mainCardHTML(center) + sideCardHTML(right, 'right');
}
function carMove(dir) { carIndex += dir; renderCarousel(); }

function wireCarousel() {
  document.getElementById('car-next')?.addEventListener('click', () => carMove(1));
  document.getElementById('car-swipe')?.addEventListener('click', () => carMove(1));
  document.getElementById('car-prev')?.addEventListener('click', () => carMove(-1));

  const stage = document.getElementById('car-stage');
  if (!stage) return;
  stage.addEventListener('click', e => {
    const side = e.target.closest('[data-side]');
    if (!side) return;
    const id = side.getAttribute('data-side');
    const idx = BLOGS.findIndex(b => b.id === id);
    if (idx >= 0) { carIndex = idx; renderCarousel(); }
  });
  // touch swipe
  let startX = null;
  stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) carMove(dx < 0 ? 1 : -1);
    startX = null;
  });
}

/* ---------- Blogs page grid ---------- */
function cardHTML(p) {
  return `
    <a class="card" href="#blog/${p.id}">
      <div class="card__media">${tileHTML(p)}</div>
      <div class="card__body">
        <span class="tag">${escapeHtml(p.tag)}</span>
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.summary)}</p>
        <div class="meta"><span>${escapeHtml(p.date)}</span><span class="dot"></span><span>2 min read</span></div>
      </div>
    </a>`;
}
function renderBlogGrid() {
  const grid = document.getElementById('blog-grid');
  if (grid) grid.innerHTML = BLOGS.map(cardHTML).join('');
}

/* ---------- Full article ---------- */
function showBlogDetail(id) {
  const post = BLOGS.find(b => b.id === id);
  const grid = document.getElementById('blog-grid');
  const detail = document.getElementById('blog-detail');
  if (!post || !detail) { showBlogList(); return; }
  detail.innerHTML = `
    <a class="back-link" href="#blogs">&larr; All stories</a>
    <div class="detail-media">${tileHTML(post)}</div>
    <span class="tag">${escapeHtml(post.tag)}</span>
    <h1 class="detail-title">${escapeHtml(post.title)}</h1>
    <div class="detail-meta">${escapeHtml(post.date)} &middot; 2 min read</div>
    <div class="detail-body">${escapeHtml(post.body)}</div>`;
  if (grid) grid.hidden = true;
  detail.hidden = false;
  window.scrollTo({ top: 0, behavior: 'auto' });
}
function showBlogList() {
  const grid = document.getElementById('blog-grid');
  const detail = document.getElementById('blog-detail');
  if (detail) { detail.hidden = true; detail.innerHTML = ''; }
  if (grid) grid.hidden = false;
}

function initBlogs() {
  renderBlogGrid();
  renderCarousel();
  wireCarousel();
}
