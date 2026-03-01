/* ══════════════════════════════════════════════
   state.js — all mutable game state + persistence
   ══════════════════════════════════════════════ */

/* Mutable state — shared across all modules */
let caught       = new Set();
let cardCounts   = {};
let faceImages   = {};
let activeSpawns = {};
let roamPos      = {};
let roamTimer    = null;
let courtAF      = null;
let currentTarget= null;
let hoopAF       = null;
let courtRoster  = [];      // array of player ids (max 5); 'cp' for custom, 999 for bear
let bearUnlocked = false;
let customPlayer = null;
let customFaceImg= null;

/* Session play-time tracking */
let sessionStart = Date.now();
let totalPlayMs  = 0;
let lastSeen     = null;

/* ── Persistence ── */
function saveState() {
  try {
    totalPlayMs += Date.now() - sessionStart;
    sessionStart = Date.now();
    localStorage.setItem('jd_caught',    JSON.stringify([...caught]));
    localStorage.setItem('jd_counts',    JSON.stringify(cardCounts));
    localStorage.setItem('jd_faces',     JSON.stringify(faceImages));
    localStorage.setItem('jd_roster',    JSON.stringify(courtRoster));
    localStorage.setItem('jd_bear',      bearUnlocked ? '1' : '0');
    localStorage.setItem('jd_custom',    JSON.stringify(customPlayer));
    localStorage.setItem('jd_cface',     customFaceImg || '');
    localStorage.setItem('jd_roampos',   JSON.stringify(roamPos));
    localStorage.setItem('jd_playtime',  totalPlayMs.toString());
    localStorage.setItem('jd_lastseen',  new Date().toISOString());
    flashSave();
  } catch(e) {}
}

function loadState() {
  try {
    const c  = localStorage.getItem('jd_caught');
    const cc = localStorage.getItem('jd_counts');
    const f  = localStorage.getItem('jd_faces');
    const r  = localStorage.getItem('jd_roster');
    const b  = localStorage.getItem('jd_bear');
    const cp = localStorage.getItem('jd_custom');
    const cf = localStorage.getItem('jd_cface');
    const rp = localStorage.getItem('jd_roampos');
    const pt = localStorage.getItem('jd_playtime');
    const ls = localStorage.getItem('jd_lastseen');
    if (c)  caught = new Set(JSON.parse(c));
    if (cc) cardCounts = JSON.parse(cc);
    if (f)  faceImages = JSON.parse(f);
    if (r)  {
      const parsed = JSON.parse(r);
      courtRoster = parsed.filter(id => id === 'cp' || id === 999 || caught.has(id));
    }
    if (b)  bearUnlocked = b === '1';
    if (cp) customPlayer = JSON.parse(cp);
    if (cf) customFaceImg = cf || null;
    if (rp) roamPos = JSON.parse(rp);
    if (pt) totalPlayMs = parseInt(pt) || 0;
    if (ls) lastSeen = ls;
  } catch(e) {}
}

function flashSave() {
  const b = document.getElementById('save-badge');
  if (!b) return;
  b.style.opacity = '1';
  b.textContent = '💾 saved';
  setTimeout(() => b.style.opacity = '0', 2000);
}

/* ── Header count sync ── */
function updateCounts() {
  const unique = PLAYERS.filter(p => caught.has(p.id)).length;
  document.getElementById('caught-count').textContent = unique;
  const dn = document.getElementById('dex-n');   if (dn) dn.textContent = unique;
  const df = document.getElementById('dex-fill');
  if (df) df.style.width = (unique / PLAYERS.length * 100) + '%';
}

/* ── Export stub for Social / future backend ── */
function exportPlayerData() {
  return {
    caught: [...caught],
    cardCounts,
    customPlayer,
    totalPlayMs: totalPlayMs + (Date.now() - sessionStart),
    lastSeen: new Date().toISOString(),
    // TODO: add uid, friendsList when accounts are implemented
  };
}
