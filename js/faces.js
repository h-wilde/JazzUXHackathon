/* ══════════════════════════════════════════════
   faces.js — upload player headshots
   ══════════════════════════════════════════════ */

function renderFaces() {
  const grid = document.getElementById('faces-grid');
  if (!grid) return;
  grid.innerHTML = PLAYERS.map(p => {
    const col = RARITY_COLORS[p.rarity];
    const has = !!faceImages[p.id];
    return `<div class="face-slot" style="border-color:${col}55">
      <label>
        <div class="face-preview" id="fp-${p.id}">
          ${has ? `<img src="${faceImages[p.id]}"/>` : '📷'}
        </div>
        <div class="face-pname">${p.short}</div>
        <div class="face-sub" style="color:${col}">${p.rarity}</div>
        <input type="file" accept="image/*" onchange="loadFace(${p.id}, this)">
      </label>
    </div>`;
  }).join('');
}

function loadFace(id, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    faceImages[id] = e.target.result;

    /* Update the faces panel preview */
    const prev = document.getElementById('fp-' + id);
    if (prev) prev.innerHTML = `<img src="${e.target.result}"/>`;

    saveState();

    /* Refresh any view that's currently active */
    if (document.getElementById('cards-view').classList.contains('active'))  renderCards();
    if (document.getElementById('dex-view').classList.contains('active'))    renderDex();
    if (document.getElementById('court-view').classList.contains('active'))  rebuildRoamers();

    /* Refresh character in open catch modal */
    const mc = document.getElementById('modal-char');
    if (mc && currentTarget && currentTarget.id === id) {
      mc.innerHTML = buildChar(currentTarget, 68);
    }

    /* Refresh character on map if currently spawned */
    const sb = document.querySelector(`.spawn-char[data-id="${id}"] .char-body`);
    if (sb) sb.innerHTML = buildChar(PLAYERS.find(pl => pl.id === id), 50);
  };
  reader.readAsDataURL(file);
}
