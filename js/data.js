/* ══════════════════════════════════════════════
   data.js — static game data, constants, helpers
   ══════════════════════════════════════════════ */

const RARITY_COLORS = {common:'#00B2A9',rare:'#7C4DFF',epic:'#FF6D00',legendary:'#F9A01B'};
const SHIRT_COLORS  = {common:'#00868a',rare:'#5533aa',epic:'#aa3300',legendary:'#aa7700'};

/* Spawn timing per rarity
   interval = ms between spawn cycles
   duration = ms each player is on the map     */
const RARITY_SPAWN = {
  common:   {interval:7000,  duration:18000},
  rare:     {interval:13000, duration:9000},
  epic:     {interval:22000, duration:6000},
  legendary:{interval:40000, duration:3500},
};

/* Max simultaneous spawns on map — raise to make it easier */
const MAX_SPAWNS = 5;

/* Rarity sort order */
const RARITY_ORDER = {legendary:0, epic:1, rare:2, common:3};

/* PLAYERS — legendary → epic → rare → common */
const PLAYERS = [
  // LEGENDARY
  {id:1,  name:'Karl Malone',      short:'Malone',    rarity:'legendary', lastName:'Malone',    era:'1985–2003', ppg:25.0, apg:3.6,  rpg:10.1, blk:1.0, quote:'The Mailman always delivers.',      num:'32'},
  {id:2,  name:'John Stockton',    short:'Stockton',  rarity:'legendary', lastName:'Stockton',  era:'1984–2003', ppg:13.1, apg:10.5, rpg:2.7,  blk:0.2, quote:'Greatest PG of all time.',          num:'12'},
  // EPIC
  {id:3,  name:'Pete Maravich',    short:'Pistol',    rarity:'epic',      lastName:'Maravich',  era:'1974–1980', ppg:24.4, apg:5.4,  rpg:4.2,  blk:0.2, quote:'Pistol Pete — pure magic.',         num:'7'},
  {id:4,  name:'Donovan Mitchell', short:'Spida',     rarity:'epic',      lastName:'Mitchell',  era:'2017–2021', ppg:23.9, apg:4.4,  rpg:4.4,  blk:0.5, quote:'Spida climbs any wall.',            num:'45'},
  {id:5,  name:'Adrian Dantley',   short:'Dantley',   rarity:'epic',      lastName:'Dantley',   era:'1979–1986', ppg:26.6, apg:2.9,  rpg:5.7,  blk:0.3, quote:'A scoring machine.',                num:'4'},
  // RARE
  {id:6,  name:'Rudy Gobert',      short:'Gobert',    rarity:'rare',      lastName:'Gobert',    era:'2013–2022', ppg:14.3, apg:1.3,  rpg:13.5, blk:2.3, quote:'The Stifle Tower.',                 num:'27'},
  {id:7,  name:'Darrell Griffith', short:'Griff',     rarity:'rare',      lastName:'Griffith',  era:'1980–1991', ppg:16.2, apg:2.2,  rpg:3.6,  blk:0.5, quote:'Dr. Dunkenstein takes flight.',     num:'35'},
  {id:8,  name:'Andrei Kirilenko', short:'AK-47',     rarity:'rare',      lastName:'Kirilenko', era:'2001–2011', ppg:12.2, apg:3.2,  rpg:6.4,  blk:2.2, quote:'AK-47 — one of a kind.',            num:'47'},
  {id:9,  name:'Mehmet Okur',      short:'Okur',      rarity:'rare',      lastName:'Okur',      era:'2004–2011', ppg:14.6, apg:1.8,  rpg:7.3,  blk:1.2, quote:'The Turkish Hammer.',               num:'13'},
  {id:10, name:'Deron Williams',   short:'D-Will',    rarity:'rare',      lastName:'Williams',  era:'2005–2011', ppg:18.8, apg:9.3,  rpg:3.7,  blk:0.3, quote:'D-Will was something special.',     num:'8'},
  {id:11, name:'Mark Eaton',       short:'Eaton',     rarity:'rare',      lastName:'Eaton',     era:'1982–1993', ppg:6.0,  apg:0.6,  rpg:7.9,  blk:3.5, quote:'No easy buckets.',                  num:'53'},
  {id:12, name:'Thurl Bailey',     short:'T.Bailey',  rarity:'rare',      lastName:'Bailey',    era:'1983–1991', ppg:13.3, apg:1.3,  rpg:6.1,  blk:1.6, quote:'Big T — heart of gold.',            num:'41'},
  // COMMON
  {id:13, name:'Bojan Bogdanovic', short:'Bojan',     rarity:'common',    lastName:'Bogdanovic',era:'2019–2022', ppg:18.2, apg:2.1,  rpg:3.7,  blk:0.2, quote:'Automatic from corner.',            num:'44'},
  {id:14, name:'Carlos Boozer',    short:'Boozer',    rarity:'common',    lastName:'Boozer',    era:'2004–2010', ppg:16.5, apg:1.8,  rpg:9.6,  blk:0.6, quote:'Power and finesse combined.',       num:'5'},
  {id:15, name:'Jordan Clarkson',  short:'Clarkson',  rarity:'common',    lastName:'Clarkson',  era:'2019–Now',  ppg:17.4, apg:2.5,  rpg:3.3,  blk:0.2, quote:'Sixth Man energy.',                 num:'00'},
  {id:16, name:'Jeff Hornacek',    short:'Hornacek',  rarity:'common',    lastName:'Hornacek',  era:'1994–2000', ppg:16.6, apg:4.7,  rpg:3.3,  blk:0.2, quote:"A clutch shooter's shooter.",       num:'14'},
  {id:17, name:'Joe Ingles',       short:'Ingles',    rarity:'common',    lastName:'Ingles',    era:'2014–2022', ppg:8.5,  apg:3.3,  rpg:3.1,  blk:0.3, quote:'Aussie wit & threes.',              num:'2'},
  {id:18, name:'Kyle Korver',      short:'Korver',    rarity:'common',    lastName:'Korver',    era:'2007–2010', ppg:11.5, apg:1.5,  rpg:3.0,  blk:0.2, quote:'The most dangerous shooter alive.', num:'26'},
];

/* Jazz Bear — secret unlock after catching all 18 */
const BEAR = {
  id:999, name:'Jazz Bear', short:'Bear', rarity:'legendary', lastName:'Bear',
  era:'1994–Now', ppg:0, apg:0, rpg:0, blk:999,
  quote:'The heart and soul of Delta Center.', num:'🐻', isBear:true,
};

/* Sort by rarity desc, then lastName A→Z */
function sortedPlayers(list) {
  return [...list].sort((a, b) => {
    const rd = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
    return rd !== 0 ? rd : (a.lastName||a.name).localeCompare(b.lastName||b.name);
  });
}

/* Utility: format milliseconds → "2h 15m" */
function fmtDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* Utility: ISO string → "March 5th, 2025" */
function fmtDateNice(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const day = d.getDate();
  const suffix = day===1||day===21||day===31?'st':day===2||day===22?'nd':day===3||day===23?'rd':'th';
  return d.toLocaleDateString('en-US',{month:'long',year:'numeric'}).replace(',',` ${day}${suffix},`);
}
