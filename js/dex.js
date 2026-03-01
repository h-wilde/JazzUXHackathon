/* ══════════════════════════════════════════════
   dex.js — JazzDex completion grid
   ══════════════════════════════════════════════ */

function renderDex() {
  const grid = document.getElementById('dex-grid');
  if (!grid) return;
  updateCounts();

  /* Bear appears at front of list once unlocked */
  let list = sortedPlayers(PLAYERS);
  if (bearUnlocked) list = [BEAR, ...list];

  const totalNeeded  = PLAYERS.length;
  const caughtCount  = PLAYERS.filter(p => caught.has(p.id)).length;
  const missing      = PLAYERS.filter(p => !caught.has(p.id));
  /* Highlight remaining slots when close to completion */
  const nearComplete = caughtCount >= totalNeeded - 5;

  const missingBanner = nearComplete && missing.length > 0
    ? `<div class="dex-missing-label">🔴 <strong>${missing.length} remaining:</strong> ${missing.map(p => p.short).join(', ')}</div>`
    : '';

  grid.innerHTML = missingBanner + list.map(p => {
    const got       = caught.has(p.id);
    const isMissing = !got && nearComplete;
    return `<div class="dex-slot ${got ? 'got' : ''} ${isMissing ? 'missing' : ''}">
      <div class="dex-char">${buildChar(p, 42)}</div>
      <div class="dex-pname">${got ? p.short : '???'}</div>
    </div>`;
  }).join('');
}
