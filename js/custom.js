/* ══════════════════════════════════════════════
   custom.js — My Player view (create / edit / display)
   ══════════════════════════════════════════════ */

/* Build a fake player object from the current form values
   (used for live preview before saving)                   */
function getCustomFakePlayer() {
  const name   = document.getElementById('cp-name')?.value || 'My Player';
  const num    = document.getElementById('cp-num')?.value  || '00';
  const rarity = document.getElementById('cp-rarity')?.value || 'common';
  return {id:'cp', name, short: name.split(' ')[0] || name, rarity, num, isCustom:true};
}

function refreshCustomPreview() {
  const preview = document.getElementById('custom-preview');
  if (!preview) return;
  preview.innerHTML = buildChar(getCustomFakePlayer(), 80);

  /* Live stats panel */
  const ppg = document.getElementById('cp-ppg')?.value || '—';
  const apg = document.getElementById('cp-apg')?.value || '—';
  const rpg = document.getElementById('cp-rpg')?.value || '—';
  const ls  = document.getElementById('cp-live-stats');
  if (ls) ls.innerHTML = `<div>PPG <span>${ppg}</span></div>
                          <div>APG <span>${apg}</span></div>
                          <div>RPG <span>${rpg}</span></div>`;
}

function loadCustomFace(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    customFaceImg = e.target.result;
    refreshCustomPreview();
  };
  reader.readAsDataURL(file);
}

function saveCustomPlayer() {
  const name   = document.getElementById('cp-name')?.value?.trim()  || 'My Player';
  const num    = document.getElementById('cp-num')?.value?.trim()    || '00';
  const ppg    = parseFloat(document.getElementById('cp-ppg')?.value)  || 0;
  const apg    = parseFloat(document.getElementById('cp-apg')?.value)  || 0;
  const rpg    = parseFloat(document.getElementById('cp-rpg')?.value)  || 0;
  const rarity = document.getElementById('cp-rarity')?.value          || 'common';
  const quote  = document.getElementById('cp-quote')?.value?.trim()   || 'Built different.';
  const now    = new Date();

  customPlayer = {
    id: 'cp',
    name, short: name.split(' ')[0] || name,
    rarity, era: `${now.getFullYear()}–Now`,
    lastName: name.split(' ').pop(),
    ppg, apg, rpg, blk: 0,
    quote, num, isCustom: true,
    joinedISO:     now.toISOString(),
    joinedDisplay: fmtDateNice(now.toISOString()),
  };

  saveState();

  const badge = document.getElementById('cp-saved');
  if (badge) { badge.style.display = 'block'; setTimeout(() => badge.style.display = 'none', 2500); }

  renderCustomCard();
  renderCustomStats();
}

function renderCustomStats() {
  const sec = document.getElementById('cp-stats-section');
  if (!sec || !customPlayer) { if (sec) sec.innerHTML = ''; return; }

  const playtime      = fmtDuration(totalPlayMs + (Date.now() - sessionStart));
  const lsDisplay     = lastSeen ? fmtDateNice(lastSeen) : 'This session';
  const joinedDisplay = customPlayer.joinedISO
    ? fmtDateNice(customPlayer.joinedISO)
    : (customPlayer.joinedDisplay || '—');

  sec.innerHTML = `<div class="cp-stats-panel" style="max-width:520px;margin:16px auto 0">
    <h4>📊 My Player Stats</h4>
    <div class="cp-stat-row"><span class="cp-stat-label">Joined</span>        <span class="cp-stat-val">${joinedDisplay}</span></div>
    <div class="cp-stat-row"><span class="cp-stat-label">Time Played</span>   <span class="cp-stat-val">${playtime}</span></div>
    <div class="cp-stat-row"><span class="cp-stat-label">Last Active</span>   <span class="cp-stat-val">${lsDisplay}</span></div>
    <div class="cp-stat-row"><span class="cp-stat-label">Cards Caught</span>  <span class="cp-stat-val">${caught.size}</span></div>
    <div class="cp-stat-row"><span class="cp-stat-label">When Traded</span>   <span class="cp-stat-val" style="color:rgba(245,240,232,.3);font-style:italic">Coming with Social features</span></div>
    <div class="cp-stat-row"><span class="cp-stat-label">Friends Since</span> <span class="cp-stat-val" style="color:rgba(245,240,232,.3);font-style:italic">Coming with Social features</span></div>
  </div>`;
}

function renderCustomCard() {
  const area = document.getElementById('custom-card-display');
  if (!area || !customPlayer) { if (area) area.innerHTML = ''; return; }
  const count = cardCounts['cp'] || 1;
  area.innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-size:.78rem;color:rgba(245,240,232,.35);text-align:center;margin:12px 0 8px;letter-spacing:1px">YOUR CARD — tap to flip</div>
    <div class="cards-grid" style="max-width:220px;margin:0 auto">
      ${buildCardHTML(customPlayer, count)}
    </div>`;
}

function initCustomView() {
  /* Pre-fill form from saved customPlayer */
  if (customPlayer) {
    document.getElementById('cp-name').value   = customPlayer.name   || '';
    document.getElementById('cp-num').value    = customPlayer.num    || '';
    document.getElementById('cp-ppg').value    = customPlayer.ppg    || '';
    document.getElementById('cp-apg').value    = customPlayer.apg    || '';
    document.getElementById('cp-rpg').value    = customPlayer.rpg    || '';
    document.getElementById('cp-rarity').value = customPlayer.rarity || 'common';
    document.getElementById('cp-quote').value  = customPlayer.quote  || '';
  }
  refreshCustomPreview();
  renderCustomCard();
  renderCustomStats();

  /* Live preview on every keystroke */
  ['cp-name','cp-num','cp-rarity','cp-ppg','cp-apg','cp-rpg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', refreshCustomPreview);
  });
}
