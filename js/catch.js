/* ══════════════════════════════════════════════
   catch.js — catch modal, hoop mini-game, bear unlock
   3 shots: first make auto-catches the player.
   ══════════════════════════════════════════════ */

/* ── Bear unlock ── */
function checkBearUnlock() {
  if (bearUnlocked) return;
  const allCaught = PLAYERS.every(p => caught.has(p.id));
  if (!allCaught) return;

  bearUnlocked = true;
  caught.add(999);
  cardCounts[999] = 1;
  saveState();
  showBearToast();
  scheduleBear();
}

function showBearToast() {
  const t = document.getElementById('bear-toast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

/* ── Open catch modal ── */
function openCatch(id, isBear = false) {
  currentTarget = isBear ? BEAR : PLAYERS.find(p => p.id === id);
  const p = currentTarget;

  const pips = [0,1,2].map(i =>
    `<div class="shot-pip pending" id="sp${i}">🏀</div>`
  ).join('');

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-header">
      <div class="modal-char" id="modal-char">${buildChar(p, 68)}</div>
      <div class="modal-info">
        <div class="modal-name">${p.isBear ? '???' : p.name}</div>
        <span class="modal-rbadge rarity-${p.rarity}">${p.isBear ? 'MYSTERY' : p.rarity.toUpperCase()}</span>
      </div>
    </div>
    <div class="hoop-section">
      <div class="hoop-title">MAKE A BASKET — 3 chances, first make catches!</div>
      <div class="shot-row">${pips}</div>
      <canvas id="hoop-cv" width="380" height="150"></canvas>
      <button class="throw-btn" id="throw-btn" onclick="doThrow()">🏀 THROW</button>
    </div>
    <div class="fail-msg" id="fail-msg">😓 All 3 missed — they got away!</div>
    <div class="success-screen" id="success-screen">
      <span class="burst">${p.isBear ? '🐻' : '🎉'}</span>
      <h3>${p.isBear ? 'JAZZ BEAR!' : 'CAUGHT!'}</h3>
      <p>${p.isBear
        ? 'The legend himself is in your JazzDex!'
        : p.name + ' added to your JazzDex!'}</p>
    </div>`;

  document.getElementById('catch-modal').classList.add('open');
  initHoop();
}

/* ── Hoop mini-game ── */
function initHoop() {
  const canvas = document.getElementById('hoop-cv');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const hoopX = W * .75, hoopY = H * .30, rimR = 20;
  const ballX = W * .14,  ballY = H * .84;
  const sweetW = 22; // tolerance window — increase to make it easier

  /* Aim oscillation speed scales with rarity */
  const AIM_SPEEDS = {common:.016, rare:.026, epic:.036, legendary:.050};
  const speed = AIM_SPEEDS[currentTarget?.rarity] || .025;

  let aimAngle = 0;
  let phase = 'aim';    // 'aim' | 'fly' | 'between'
  let flyT = 0, flyScatter = 0;
  let swish = 0;
  let shotsDone = 0;

  function scatter() { return Math.sin(aimAngle) * 58; }

  /* Quadratic bezier point */
  function arcPt(t, sc) {
    const tx = hoopX + sc;
    const cpX = (ballX + tx) * .5, cpY = Math.min(ballY, hoopY) - H * .55;
    return {
      bx: (1-t)*(1-t)*ballX + 2*(1-t)*t*cpX + t*t*tx,
      by: (1-t)*(1-t)*ballY + 2*(1-t)*t*cpY + t*t*hoopY,
    };
  }

  function drawBall(x, y, r = 11) {
    const g = ctx.createRadialGradient(x - r*.35, y - r*.35, r*.1, x, y, r);
    g.addColorStop(0, '#ffb347'); g.addColorStop(1, '#c84800');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, r, -.5, .5); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI-.5, Math.PI+.5); ctx.stroke();
  }

  function drawHoop() {
    /* Backboard */
    ctx.fillStyle = '#e0d8c0'; ctx.fillRect(hoopX + rimR + 3, hoopY - 28, 7, 50);
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1;
    ctx.strokeRect(hoopX + rimR + 3, hoopY - 28, 7, 50);
    /* Net */
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const nx = hoopX - rimR + (rimR*2/4)*i;
      ctx.beginPath(); ctx.moveTo(nx, hoopY + 4);
      ctx.lineTo(hoopX + (nx - hoopX)*.4, hoopY + 26); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(hoopX - rimR*.5, hoopY + 26);
    ctx.lineTo(hoopX + rimR*.5, hoopY + 26); ctx.stroke();
    /* Rim */
    ctx.strokeStyle = '#E05500'; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.ellipse(hoopX, hoopY, rimR, 5, 0, 0, Math.PI*2); ctx.stroke();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawHoop();

    /* Swish flash */
    if (swish > 0) {
      ctx.globalAlpha = swish * .45;
      ctx.fillStyle = '#F9A01B';
      ctx.beginPath(); ctx.arc(hoopX, hoopY, rimR + 16, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      swish = Math.max(0, swish - .06);
    }

    if (phase === 'aim') {
      aimAngle += speed;
      const sc = scatter(), inZone = Math.abs(sc) < sweetW;

      ctx.save(); ctx.setLineDash([5,5]);
      ctx.strokeStyle = inZone ? 'rgba(249,160,27,.95)' : 'rgba(255,255,255,.3)';
      ctx.lineWidth   = inZone ? 2.4 : 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const {bx,by} = arcPt(i/40, sc);
        i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
      }
      ctx.stroke(); ctx.setLineDash([]); ctx.restore();

      if (inZone) {
        ctx.strokeStyle = 'rgba(249,160,27,.5)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(hoopX, hoopY, rimR+7, 8, 0, 0, Math.PI*2); ctx.stroke();
      }
      drawBall(ballX, ballY);
      hoopAF = requestAnimationFrame(frame);

    } else if (phase === 'fly') {
      flyT += .032;
      const {bx, by} = arcPt(flyT, flyScatter);
      drawBall(bx, by);
      if (flyT < 1) hoopAF = requestAnimationFrame(frame);
      else resolveShot(Math.abs(flyScatter) < sweetW);

    } else {
      /* 'between' — brief pause before next aim */
      drawBall(ballX, ballY);
      hoopAF = requestAnimationFrame(frame);
    }
  }

  function resolveShot(made) {
    const pip = document.getElementById('sp' + shotsDone);
    shotsDone++;

    if (made) {
      if (pip) { pip.classList.remove('pending'); pip.classList.add('made'); pip.textContent = '✓'; }
      swish = 1;
      cancelAnimationFrame(hoopAF);
      ctx.clearRect(0, 0, W, H); drawHoop();
      ctx.globalAlpha = .4; ctx.fillStyle = '#F9A01B';
      ctx.beginPath(); ctx.arc(hoopX, hoopY, rimR+16, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      document.getElementById('throw-btn').disabled = true;
      setTimeout(autoCatch, 600);

    } else {
      if (pip) { pip.classList.remove('pending'); pip.classList.add('miss'); pip.textContent = '✗'; }
      if (shotsDone >= 3) {
        cancelAnimationFrame(hoopAF);
        document.getElementById('throw-btn').disabled = true;
        setTimeout(() => {
          document.getElementById('fail-msg').style.display = 'block';
          setTimeout(closeModal, 1800);
        }, 300);
      } else {
        phase = 'between';
        hoopAF = requestAnimationFrame(frame);
        setTimeout(() => { phase = 'aim'; }, 500);
      }
    }
  }

  function autoCatch() {
    const p = currentTarget;
    if (!p) return;
    caught.add(p.id);
    cardCounts[p.id] = (cardCounts[p.id] || 0) + 1;
    updateCounts();
    doDeSpawn(p.id);
    saveState();
    if (!p.isBear) checkBearUnlock();
    if (hoopAF) cancelAnimationFrame(hoopAF);
    document.getElementById('success-screen').style.display = 'block';
    setTimeout(closeModal, 1900);
    if (document.getElementById('court-view').classList.contains('active')) rebuildRoamers();
    if (document.getElementById('cards-view').classList.contains('active')) renderCards();
  }

  /* Expose throw to the onclick button */
  window._doThrow = () => {
    if (phase !== 'aim') return;
    flyScatter = scatter();
    flyT = 0;
    phase = 'fly';
  };

  hoopAF = requestAnimationFrame(frame);
}

function doThrow() {
  if (window._doThrow) window._doThrow();
}

function closeModal() {
  if (hoopAF) cancelAnimationFrame(hoopAF);
  document.getElementById('catch-modal').classList.remove('open');
  window._doThrow = null;
  currentTarget = null;
}
