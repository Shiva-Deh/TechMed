/* ============================================================
   Blog rendering — featured post + horizontal scroll rail
   Reads the BLOGS array from data/blogs.js
   ============================================================ */

function tileHTML(post) {
  // Use a real photo if provided, else a coloured placeholder tile.
  if (post.image && post.image.trim() !== "") {
    return `<img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
  }
  return `<div class="ph" data-hue="${post.hue || 'mint'}">
            <div class="ph__grain"></div>
            <div class="ph__icon">${post.icon || '🩺'}</div>
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
    <div class="feature__media">${tileHTML(post)}</div>
    <div class="feature__body">
      <span class="tag">${escapeHtml(post.tag)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.summary)}</p>
      <a class="link" href="#" data-open="${post.id}" style="font-weight:600;text-decoration:none">Read more →</a>
    </div>`;
}

function renderRail() {
  const rail = document.getElementById('blog-rail');
  const posts = BLOGS.filter(b => !b.featured);
  rail.innerHTML = posts.map(p => `
    <article class="card" data-open="${p.id}">
      <div class="card__media">${tileHTML(p)}</div>
      <div class="card__body">
        <span class="tag">${escapeHtml(p.tag)}</span>
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.summary)}</p>
        <div class="meta"><span>${escapeHtml(p.date)}</span><span class="dot"></span><span>2 min read</span></div>
      </div>
    </article>`).join('');
}

/* ---- Read-more overlay ---- */
function openPost(id) {
  const post = BLOGS.find(b => b.id === id);
  if (!post) return;

  let overlay = document.getElementById('reader');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'reader';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '80',
      background: 'rgba(16,40,32,.45)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    });
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeReader(); });
  }

  overlay.innerHTML = `
    <div style="background:var(--surface);width:100%;max-width:var(--max);max-height:92vh;
                overflow-y:auto;border-radius:22px 22px 0 0;box-shadow:var(--shadow-lg);animation:fade .3s ease both">
      <div style="height:210px">${tileHTML(post)}</div>
      <div style="padding:20px 20px 28px">
        <button id="reader-close" aria-label="Close"
          style="position:sticky;top:0;float:right;border:1px solid var(--line);background:var(--surface);
                 width:36px;height:36px;border-radius:50%;font-size:18px;color:var(--muted)">✕</button>
        <span class="tag">${escapeHtml(post.tag)}</span>
        <h2 style="font-size:24px;margin:12px 0 6px;line-height:1.2">${escapeHtml(post.title)}</h2>
        <div style="font-size:12.5px;color:var(--muted);margin-bottom:16px">${escapeHtml(post.date)} · 2 min read</div>
        <div style="font-size:15.5px;line-height:1.7;color:#28352F;white-space:pre-wrap">${escapeHtml(post.body)}</div>
      </div>
    </div>`;
  document.body.style.overflow = 'hidden';
  document.getElementById('reader-close').addEventListener('click', closeReader);
}

function closeReader() {
  const o = document.getElementById('reader');
  if (o) o.remove();
  document.body.style.overflow = '';
}

// Delegate clicks for any "Read more" / card
document.addEventListener('click', e => {
  const opener = e.target.closest('[data-open]');
  if (opener) { e.preventDefault(); openPost(opener.getAttribute('data-open')); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeReader(); });

// Rail arrow buttons (desktop)
function wireRailArrows() {
  const rail = document.getElementById('blog-rail');
  const prev = document.querySelector('.rail-btn.prev');
  const next = document.querySelector('.rail-btn.next');
  const step = () => Math.min(rail.clientWidth * 0.8, 360);
  prev?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => rail.scrollBy({ left:  step(), behavior: 'smooth' }));
}

function initBlogs() {
  renderFeatured();
  renderRail();
  wireRailArrows();
}
