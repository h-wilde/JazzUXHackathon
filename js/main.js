/* ══════════════════════════════════════════════
   main.js — view switcher + app initialisation
   This file runs last; all other JS files must
   be loaded before it.
   ══════════════════════════════════════════════ */

/* ── View switcher ── */
function showView(id, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');

  if (id === 'court-view')  rebuildRoamers();
  if (id === 'dex-view')    renderDex();
  if (id === 'cards-view')  renderCards();
  if (id === 'faces-view')  renderFaces();
  if (id === 'custom-view') initCustomView();
}

/* ── Bootstrap ── */
loadState();
updateCounts();

/* Ensure bear state is consistent after load */
if (bearUnlocked && !caught.has(999)) {
  caught.add(999);
  cardCounts[999] = 1;
}

/* Initial renders */
renderCards();
renderDex();
renderFaces();

/* Sync header totals */
document.getElementById('total-count').textContent = PLAYERS.length;
document.getElementById('dex-total').textContent   = PLAYERS.length;
document.getElementById('save-badge').style.opacity = '0';

/* Autosave play-time every 2 minutes */
setInterval(saveState, 120_000);

/* Start spawning */
scheduleAll();
if (bearUnlocked) scheduleBear();
