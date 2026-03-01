/* ══════════════════════════════════════════════
   spawn.js — map spawn / despawn system
   Global cap = MAX_SPAWNS across all players.
   ══════════════════════════════════════════════ */

function totalActiveSpawns() {
  return Object.keys(activeSpawns).length;
}

/* Kick off spawn loops for every regular player */
function scheduleAll() {
  PLAYERS.forEach(p => {
    const delay = Math.random() * RARITY_SPAWN[p.rarity].interval * 0.7;
    setTimeout(() => spawnLoop(p), delay);
  });
}

/* Start Bear's spawn loop (called after unlock) */
function scheduleBear() {
  spawnLoop(BEAR);
}

function spawnLoop(p) {
  if (!activeSpawns[p.id]) trySpawn(p);
  const cfg    = p.isBear ? RARITY_SPAWN.legendary : RARITY_SPAWN[p.rarity];
  const nextIn = cfg.interval * (0.8 + Math.random() * 0.6);
  setTimeout(() => spawnLoop(p), cfg.duration + nextIn);
}

function trySpawn(p) {
  /* Bear only spawns after unlock */
  if (p.isBear && !bearUnlocked) return;
  /* Respect global cap */
  if (totalActiveSpawns() >= MAX_SPAWNS) return;
  if (activeSpawns[p.id]) return;

  const cfg  = p.isBear ? RARITY_SPAWN.legendary : RARITY_SPAWN[p.rarity];
  const glow = RARITY_COLORS[p.rarity];
  const court = document.getElementById('court-map');

  let x = 12 + Math.random() * 76;
  let y = 14 + Math.random() * 72;

  /* Build DOM element */
  const wrap = document.createElement('div');
  wrap.className = 'spawn-char';
  wrap.dataset.id = p.id;
  wrap.style.cssText = `left:${x}%;top:${y}%;filter:drop-shadow(0 0 ${p.rarity==='legendary'?'12':'6'}px ${glow})`;

  const body = document.createElement('div');
  body.className = 'char-body';
  body.innerHTML = buildChar(p, 50);

  const shadow = document.createElement('div');
  shadow.className = 'char-shadow';

  const tag = document.createElement('div');
  tag.className = 'char-tag';
  tag.style.color = glow;
  tag.textContent = p.isBear ? '???' : p.short;  // Bear teases with ???

  body.appendChild(shadow);
  wrap.appendChild(body);
  wrap.appendChild(tag);
  court.appendChild(wrap);

  requestAnimationFrame(() => wrap.classList.add('popin'));
  wrap.addEventListener('click', () => openCatch(p.id, p.isBear));

  /* Roam within the court area */
  const roamId = setInterval(() => {
    if (!activeSpawns[p.id]) return;
    x = Math.max(8,  Math.min(92, x + (Math.random() - .5) * 10));
    y = Math.max(10, Math.min(88, y + (Math.random() - .5) * 10));
    wrap.style.left = x + '%';
    wrap.style.top  = y + '%';
  }, 3200);

  const despawnId = setTimeout(() => doDeSpawn(p.id), cfg.duration);

  activeSpawns[p.id] = {el:wrap, roamId, despawnId};
}

function doDeSpawn(id) {
  const s = activeSpawns[id];
  if (!s) return;
  clearInterval(s.roamId);
  clearTimeout(s.despawnId);
  s.el.classList.add('popout');
  setTimeout(() => s.el.remove(), 350);
  delete activeSpawns[id];
}
