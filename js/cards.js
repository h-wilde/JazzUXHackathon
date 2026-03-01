/* ══════════════════════════════════════════════
   cards.js — card HTML builder + cards view renderer
   ══════════════════════════════════════════════ */

function buildCardHTML(p, count) {
  const face = p.isCustom ? customFaceImg : faceImages[p.id];

  const frontFace = face
    ? `<div class="card-face card-front">
         <img class="card-front-img" src="${face}" alt="${p.name}"/>
         <div class="card-jersey-badge">#${p.num}</div>
         <div class="card-front-overlay">
           <div class="card-pname">${p.name}</div>
           <span class="card-rbadge rarity-${p.rarity}">${p.rarity}</span>
         </div>
       </div>`
    : `<div class="card-face card-front">
         <div class="card-front-noimg">
           <div class="card-char">${buildChar(p, 70)}</div>
           <div class="card-pname">${p.name}</div>
           <div class="card-era">${p.era}</div>
           <span class="card-rbadge rarity-${p.rarity}" style="margin-top:2px">${p.rarity}</span>
         </div>
         <div class="card-jersey-badge">#${p.num}</div>
       </div>`;

  const customDateRow = p.isCustom && p.joinedDisplay
    ? `<div class="srow"><span class="sl">Joined</span><span class="sv" style="font-size:.72rem">${p.joinedDisplay}</span></div>`
    : '';

  return `<div class="card-flip-wrap" data-r="${p.rarity}" onclick="this.classList.toggle('flipped')">
    <div class="card-count-badge">×${count}</div>
    <div class="card-inner">
      ${frontFace}
      <div class="card-face card-back">
        <div class="card-back-inner">
          <div class="card-back-num">#${String(p.id).padStart(3,'0')} · ${p.rarity.toUpperCase()}</div>
          <div class="card-back-name">${p.name}</div>
          <div class="card-back-era">${p.era}</div>
          <div class="card-back-stats">
            <div class="srow"><span class="sl">PPG</span><span class="sv">${p.ppg}</span></div>
            <div class="srow"><span class="sl">APG</span><span class="sv">${p.apg}</span></div>
            <div class="srow"><span class="sl">RPG</span><span class="sv">${p.rpg}</span></div>
            <div class="srow"><span class="sl">BLK</span><span class="sv">${p.blk}</span></div>
            ${customDateRow}
          </div>
          <div class="card-back-quote">"${p.quote}"</div>
          <div class="card-back-hint">tap to flip back</div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  /* Sort caught regular players by rarity then name */
  let toShow = sortedPlayers(PLAYERS.filter(p => caught.has(p.id)));
  /* Bear goes first if unlocked */
  if (bearUnlocked && caught.has(999)) toShow = [BEAR, ...toShow];
  /* Custom player at the end */
  if (customPlayer) toShow.push(customPlayer);

  if (!toShow.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;font-family:'Barlow Condensed',sans-serif;color:rgba(245,240,232,.35);font-size:1rem;padding:40px 0;text-align:center">
      Catch players on the Map to see their cards here!
    </div>`;
    return;
  }

  grid.innerHTML = toShow.map(p => buildCardHTML(p, cardCounts[p.id] || 1)).join('');
}
