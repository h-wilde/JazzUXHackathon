/* ══════════════════════════════════════════════
   char.js — SVG character builder
   Edit the SVG markup here to change body shape.
   bobDur controls the bounce animation speed.
   ══════════════════════════════════════════════ */

function buildChar(p, size = 56) {
  const shirt  = SHIRT_COLORS[p.rarity] || '#00868a';
  const glow   = RARITY_COLORS[p.rarity] || '#00B2A9';
  const rawId  = p.id;   // stable unique id for clipPath
  const face   = p.isBear ? null : (p.isCustom ? customFaceImg : faceImages[p.id] || null);

  /* Wobble speed varies per player so they don't all bob in sync */
  const bobDur  = (1.4 + (String(p.id).charCodeAt(0) % 5) * 0.18) + 's';
  const headFill = face ? 'transparent' : (p.isBear ? '#8B4513' : '#dfc090');

  const bearFace = p.isBear ? `
    <circle cx="17" cy="7"  r="5" fill="#6B3410"/>
    <circle cx="39" cy="7"  r="5" fill="#6B3410"/>
    <circle cx="17" cy="7"  r="3" fill="#8B4513"/>
    <circle cx="39" cy="7"  r="3" fill="#8B4513"/>
    <ellipse cx="28" cy="22" rx="7" ry="5" fill="#c8956a"/>
    <ellipse cx="28" cy="19" rx="3" ry="2" fill="#1a0a00"/>
    <circle cx="23" cy="15" r="2.5" fill="#1a0a00"/>
    <circle cx="33" cy="15" r="2.5" fill="#1a0a00"/>
    <circle cx="23.7" cy="14.2" r=".8" fill="white"/>
    <circle cx="33.7" cy="14.2" r=".8" fill="white"/>
    <path d="M24 23 Q28 27 32 23" stroke="#5a2a10" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  ` : '';

  const faceEl = face
    ? `<image href="${face}" x="13" y="3" width="30" height="30" clip-path="url(#hc${rawId})"/>`
    : (p.isBear ? bearFace : '');

  return `<svg width="${size}" height="${Math.round(size*1.07)}" viewBox="0 0 56 60"
      xmlns="http://www.w3.org/2000/svg" style="overflow:visible;display:block">
  <defs>
    <clipPath id="hc${rawId}"><circle cx="28" cy="18" r="15"/></clipPath>
  </defs>
  <g style="animation:chbob${rawId} ${bobDur} ease-in-out infinite">
    <style>
      @keyframes chbob${rawId}{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    </style>
    <!-- feet shadows -->
    <ellipse cx="20" cy="59" rx="7" ry="2.8" fill="#111"/>
    <ellipse cx="36" cy="59" rx="7" ry="2.8" fill="#111"/>
    <!-- legs -->
    <rect x="16" y="46" width="9"  height="14" rx="4" fill="${shirt}" opacity=".85"/>
    <rect x="31" y="46" width="9"  height="14" rx="4" fill="${shirt}" opacity=".85"/>
    <!-- torso -->
    <rect x="13" y="29" width="30" height="20" rx="7" fill="${shirt}"/>
    <!-- jersey number -->
    <text x="28" y="43" text-anchor="middle"
          font-size="${p.isBear?9:7}" font-family="Arial Black,sans-serif"
          font-weight="900" fill="rgba(255,255,255,.88)">${p.num}</text>
    <!-- arms -->
    <rect x="4"  y="30" width="11" height="7" rx="3.5" fill="${shirt}" opacity=".9"/>
    <rect x="41" y="30" width="11" height="7" rx="3.5" fill="${shirt}" opacity=".9"/>
    <!-- neck -->
    <rect x="24" y="26" width="8" height="6" rx="3" fill="${headFill}"/>
    <!-- head (sways slightly) -->
    <g style="animation:hdsway${rawId} ${bobDur} ease-in-out infinite;transform-origin:28px 18px">
      <style>
        @keyframes hdsway${rawId}{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
      </style>
      <circle cx="28" cy="18" r="15" fill="${headFill}"/>
      ${faceEl}
      <circle cx="28" cy="18" r="15" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>
      ${!p.isBear ? `<path d="M13 11 Q28 2 43 11" fill="${shirt}" opacity=".55"/>` : ''}
    </g>
    <!-- rarity indicator -->
    ${p.rarity==='legendary' ? `<text x="47" y="7" font-size="8" fill="${glow}">★</text>` : ''}
    ${p.rarity==='epic'      ? `<text x="47" y="7" font-size="7" fill="${glow}">◆</text>` : ''}
  </g>
</svg>`;
}
