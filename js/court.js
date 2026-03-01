/* ══════════════════════════════════════════════
   court.js — roam court, dribble/pass animation,
              roster bar, player picker
   ══════════════════════════════════════════════ */

/* ── Roster bar ── */
function renderRosterBar() {
  const bar  = document.getElementById('roster-bar');
  const hint = document.getElementById('roster-hint');
  if (!bar) return;
  const MAX = 5;
  let html = '';

  for (let i = 0; i < MAX; i++) {
    const pid = courtRoster[i];
    if (pid !== undefined) {
      const p = pid === 'cp' ? customPlayer
              : pid === 999 ? BEAR
              : PLAYERS.find(pl => pl.id === pid);
      if (p) {
        const col = RARITY_COLORS[p.rarity] || '#F9A01B';
        html += `<div class="roster-slot filled" title="${p.name} — tap to swap"
                      onclick="openPicker(${i})" style="border-color:${col}">
                   ${buildChar(p, 38)}
                 </div>`;
      } else {
        html += `<div class="roster-slot" onclick="openPicker(${i})">+</div>`;
      }
    } else {
      html += `<div class="roster-slot" onclick="openPicker(${i})">+</div>`;
    }
  }

  bar.innerHTML = html;
  const filled = courtRoster.filter(x => x !== undefined).length;
  if (hint) hint.textContent = filled === 0
    ? 'Tap + to add players (up to 5)'
    : 'Tap any slot to swap — hover to remove';
}

/* ── Player picker ── */
let pickerSlotIdx = null;

function openPicker(slotIdx) {
  pickerSlotIdx = slotIdx;
  const grid = document.getElementById('picker-grid');
  if (!grid) return;

  const available = PLAYERS.filter(p => caught.has(p.id));
  if (customPlayer) available.push({...customPlayer});
  if (bearUnlocked && caught.has(999)) available.push(BEAR);

  const currentInSlot = courtRoster[slotIdx];

  grid.innerHTML = available.map(p => {
    const isThis   = currentInSlot === p.id;
    const onCourt  = courtRoster.includes(p.id) && !isThis;
    return `<div class="picker-item ${isThis ? 'on-court' : ''}"
                 onclick="selectInSlot(${JSON.stringify(p.id)})">
      <div class="pi-char">${buildChar(p, 40)}</div>
      <div class="pi-name">${p.short}</div>
      ${isThis  ? `<div style="font-size:.5rem;color:var(--gold);font-family:'Barlow Condensed',sans-serif">IN THIS SLOT</div>` : ''}
      ${onCourt && !isThis ? `<div style="font-size:.5rem;color:rgba(245,240,232,.35);font-family:'Barlow Condensed',sans-serif">ON COURT</div>` : ''}
    </div>`;
  }).join('');

  /* Remove option if slot is filled */
  if (currentInSlot !== undefined) {
    grid.innerHTML += `<div class="picker-item" onclick="clearSlot(${slotIdx})"
                            style="border-color:var(--red);color:var(--red)">
      <div class="pi-char" style="font-size:1.4rem;height:44px;display:flex;align-items:center;justify-content:center">✕</div>
      <div class="pi-name">Remove</div>
    </div>`;
  }

  if (!available.length) {
    grid.innerHTML = `<div style="font-family:'Barlow Condensed',sans-serif;color:rgba(245,240,232,.5);padding:20px;text-align:center">Catch players first!</div>`;
  }

  document.getElementById('picker-overlay').classList.add('open');
}

function selectInSlot(pid) {
  if (pickerSlotIdx === null) return;
  /* If already in another slot, swap */
  const existingSlot = courtRoster.indexOf(pid);
  if (existingSlot !== -1 && existingSlot !== pickerSlotIdx) {
    courtRoster[existingSlot] = courtRoster[pickerSlotIdx];
  }
  courtRoster[pickerSlotIdx] = pid;
  closePicker();
  saveState();
  rebuildRoamers();
  renderRosterBar();
}

function clearSlot(slotIdx) {
  courtRoster.splice(slotIdx, 1, undefined);
  while (courtRoster.length && courtRoster[courtRoster.length - 1] === undefined) {
    courtRoster.pop();
  }
  closePicker();
  saveState();
  rebuildRoamers();
  renderRosterBar();
}

function closePicker() {
  document.getElementById('picker-overlay').classList.remove('open');
  pickerSlotIdx = null;
}

/* ── Roam court ── */
function rebuildRoamers() {
  const court  = document.getElementById('roam-court');
  const footer = document.getElementById('court-footer-top');

  const players = courtRoster
    .filter(id => id !== undefined)
    .map(id => {
      if (id === 'cp') return customPlayer;
      if (id === 999)  return BEAR;
      return PLAYERS.find(p => p.id === id);
    })
    .filter(Boolean);

  court.querySelectorAll('.roamer-div').forEach(r => r.remove());
  if (courtAF)    { cancelAnimationFrame(courtAF); courtAF = null; }
  if (roamTimer)  { clearInterval(roamTimer);      roamTimer = null; }

  const cv = document.getElementById('court-cv');
  if (cv) {
    cv.width  = court.offsetWidth  || 900;
    cv.height = court.offsetHeight || 490;
  }

  if (!players.length) {
    if (footer) footer.textContent = 'Use the slots below to put players on the court!';
    renderRosterBar();
    return;
  }

  if (footer) footer.textContent = players.length === 1
    ? `${players[0].short} is warming up! 🏀`
    : `${players.map(p => p.short).join(', ')} running drills 🏀`;

  players.forEach(p => {
    if (!roamPos[p.id]) roamPos[p.id] = {x: 20 + Math.random()*60, y: 20 + Math.random()*60};
    const el = document.createElement('div');
    el.className = 'roamer-div';
    el.id = 'rv-' + p.id;
    el.style.left = roamPos[p.id].x + '%';
    el.style.top  = roamPos[p.id].y + '%';
    el.innerHTML  = `${buildChar(p,50)}
      <div class="roamer-tag" style="color:${RARITY_COLORS[p.rarity]||'#F9A01B'}">${p.short}</div>`;
    court.appendChild(el);
  });

  /* Roam timer */
  roamTimer = setInterval(() => {
    players.forEach(p => {
      const pos = roamPos[p.id];
      if (!pos) return;
      pos.x = Math.max(8,  Math.min(92, pos.x + (Math.random()-.5)*14));
      pos.y = Math.max(10, Math.min(90, pos.y + (Math.random()-.5)*14));
      const el = document.getElementById('rv-' + p.id);
      if (el) { el.style.left = pos.x + '%'; el.style.top = pos.y + '%'; }
    });
  }, 4500);

  /* Ball animation */
  if (players.length === 1) startDribble(players[0]);
  else startPassing(players);

  renderRosterBar();
}

/* ── Dribble animation (1 player) ── */
function startDribble(player) {
  const canvas = document.getElementById('court-cv');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let t = 0, tDir = 1;
  const SPEED = 0.045;

  /* SVG is 56w×60h rendered at size 50 → scale ≈ 0.89
     Character is positioned translate(-50%,-100%) so feet = courtY
     Hand ≈ 33/60 of the way up from feet, slightly right of centre   */
  const CHAR_H       = Math.round(50 * 1.07);  // rendered height px
  const HAND_UP_FRAC = 33 / 60;
  const HAND_X_OFFSET = 12;

  function getPos() {
    const pos = roamPos[player.id] || {x:50, y:50};
    const feetX = (pos.x / 100) * canvas.width;
    const feetY = (pos.y / 100) * canvas.height;
    return {
      handX: feetX + HAND_X_OFFSET,
      handY: feetY - CHAR_H * HAND_UP_FRAC,
      feetY,
    };
  }

  function drawBall(x, y) {
    const r = 9;
    const g = ctx.createRadialGradient(x - r*.3, y - r*.3, r*.12, x, y, r);
    g.addColorStop(0, '#ffb347'); g.addColorStop(1, '#c84800');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r, -.4, .4); ctx.stroke();
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const {handX, handY, feetY} = getPos();
    const eased = Math.pow(t, .55);
    const bx = handX;
    const by = handY + eased * (feetY - handY - 6);

    /* Floor shadow */
    const shadowAlpha = 0.15 + 0.2 * eased;
    const shadowW     = 7    + 5   * eased;
    ctx.globalAlpha = shadowAlpha;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(bx, feetY + 2, shadowW, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

    drawBall(bx, by);
    t += tDir * SPEED;
    if (t >= 1) { t = 1; tDir = -1; }
    if (t <= 0) { t = 0; tDir =  1; }
    courtAF = requestAnimationFrame(frame);
  }

  courtAF = requestAnimationFrame(frame);
}

/* ── Pass animation (2+ players) ── */
function startPassing(players) {
  const canvas = document.getElementById('court-cv');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let fromIdx = 0, toIdx = 1, t = 0;
  const SPEED = 0.012;

  function getPos(p) {
    const pos = roamPos[p.id] || {x:50, y:50};
    return {x: (pos.x/100)*canvas.width, y: (pos.y/100)*canvas.height};
  }

  function arcPt(t, f, to) {
    const cpX = (f.x + to.x)*.5, cpY = Math.min(f.y, to.y) - canvas.height*.28;
    return {
      x: (1-t)*(1-t)*f.x + 2*(1-t)*t*cpX + t*t*to.x,
      y: (1-t)*(1-t)*f.y + 2*(1-t)*t*cpY + t*t*to.y,
    };
  }

  function drawBall(x, y) {
    const r = 9;
    const g = ctx.createRadialGradient(x - r*.3, y - r*.3, r*.12, x, y, r);
    g.addColorStop(0, '#ffb347'); g.addColorStop(1, '#c84800');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r, -.4, .4); ctx.stroke();
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const from = players[fromIdx], to = players[toIdx];
    if (!from || !to) { courtAF = requestAnimationFrame(frame); return; }

    const fp = getPos(from), tp = getPos(to);
    t += SPEED;
    const {x:bx, y:by} = arcPt(t, fp, tp);
    const floorY = fp.y + (tp.y - fp.y)*t;
    const ht = Math.sin(Math.PI * t);

    ctx.save(); ctx.globalAlpha = .22 * ht; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(bx, floorY + 6, 10*(.4 + .6*ht), 3, 0, 0, Math.PI*2);
    ctx.fill(); ctx.restore();

    drawBall(bx, by);

    if (t >= 1) {
      t = 0;
      fromIdx = toIdx;
      const others = players.map((_, i) => i).filter(i => i !== fromIdx);
      toIdx = others[Math.floor(Math.random() * others.length)];
      setTimeout(() => { courtAF = requestAnimationFrame(frame); }, 500);
      return;
    }
    courtAF = requestAnimationFrame(frame);
  }

  courtAF = requestAnimationFrame(frame);
}
