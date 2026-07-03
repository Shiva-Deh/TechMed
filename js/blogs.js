/* ============================================================
   Blog rendering
   - Home shows a featured post + a horizontal rail.
   - The Blogs page shows a grid, or one full article.
   - Each post links to  #blog/<id>  so it opens the full blog
     in the Blogs section (and can be opened in a new tab).
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

function renderFeatured() {
  const post = BLOGS.find(b => b.featured) || BLOGS[0];
  const el = document.getElementById('featured');
  el.innerHTML = `
    <a class="feature__media" href="#blog/${post.id}">${tileHTML(post)}</a>
    <div class="feature__body">
      <span class="tag">${escapeHtml(post.tag)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.summary)}</p>
      <a class="link" href="#blog/${post.id}" style="font-weight:600;text-decoration:none">Read more &rarr;</a>
    </div>`;
}

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

function renderRail() {
  const rail = document.getElementById('blog-rail');
  rail.innerHTML = BLOGS.filter(b => !b.featured).map(cardHTML).join('');
}

function renderBlogGrid() {
  const grid = document.getElementById('blog-grid');
  if (grid) grid.innerHTML = BLOGS.map(cardHTML).join('');
}

/* ---- full article inside the Blogs page ---- */
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

function wireRailArrows() {
  const rail = document.getElementById('blog-rail');
  const prev = document.querySelector('.rail-btn.prev');
  const next = document.querySelector('.rail-btn.next');
  const step = () => Math.min(rail.clientWidth * 0.8, 360);
  prev?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => rail.scrollBy({ left:  step(), behavior: 'smooth' }));
}

function initBlogs() {
  renderRail();
  renderBlogGrid();
  wireRailArrows();
}
