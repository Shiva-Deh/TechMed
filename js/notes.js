/* ============================================================
   Notes — a simple personal notepad saved on this device.
   Stored under localStorage key 'techmed_notes'.
   ============================================================ */

const NOTES_STORE = 'techmed_notes';

function loadNotes() { try { return JSON.parse(localStorage.getItem(NOTES_STORE)) || []; } catch { return []; } }
function saveNotes(list) { localStorage.setItem(NOTES_STORE, JSON.stringify(list)); }

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' +
         d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function renderNotes() {
  const wrap = document.getElementById('note-list');
  if (!wrap) return;
  const notes = loadNotes().sort((a, b) => b.ts - a.ts);
  if (notes.length === 0) {
    wrap.innerHTML = '<p class="empty-note">No notes yet. Write your first one above.</p>';
    return;
  }
  wrap.innerHTML = notes.map(n => `
    <div class="note-card">
      <button class="note-del" data-del="${n.id}" aria-label="Delete note">&times;</button>
      ${n.title ? `<b class="note-card__title">${escapeHtml(n.title)}</b>` : ''}
      <div class="note-card__body">${escapeHtml(n.body)}</div>
      <div class="note-card__date">${fmtDate(n.ts)}</div>
    </div>`).join('');
}

function addNote() {
  const titleEl = document.getElementById('note-title');
  const bodyEl = document.getElementById('note-body');
  const title = titleEl.value.trim();
  const body = bodyEl.value.trim();
  if (!title && !body) return;

  const notes = loadNotes();
  notes.push({ id: String(Date.now()), ts: Date.now(), title, body });
  saveNotes(notes);
  titleEl.value = '';
  bodyEl.value = '';
  renderNotes();

  const btn = document.getElementById('note-save');
  const original = btn.textContent;
  btn.textContent = 'Saved \u2713';
  setTimeout(() => (btn.textContent = original), 1400);
}

function initNotes() {
  document.getElementById('note-save').addEventListener('click', addNote);
  document.getElementById('note-list').addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (!del) return;
    const id = del.getAttribute('data-del');
    saveNotes(loadNotes().filter(n => n.id !== id));
    renderNotes();
  });
  renderNotes();
}
