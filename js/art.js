/* Petpooja AI — drawn dish art
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

const USE_ART = false;   /* false = real photos first, local SVG as the fallback */

const PLATE = {
  leaf:   '#1F4A2C',
  wood:   '#3A2A1C',
  slate:  '#2A2724',
  cream:  '#EDE3D2',
  steel:  '#C9CDD2',
};

function artSVG(inner, bg){
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">' +
    '<rect width="200" height="150" fill="' + bg + '"/>' + inner + '</svg>');
}

/* Deterministic jitter so each dish looks slightly different but never
   changes between renders. */
function seedOf(id){ return id.split('').reduce((a,c) => a + c.charCodeAt(0), 0); }
function jit(seed, i, span){ return ((seed * (i + 7) * 31) % (span * 2)) - span; }

const ART = {
  /* Idli — steamed discs on a banana leaf, sambar + chutney katoris. */
  discs(s){
    let g = '<ellipse cx="100" cy="86" rx="88" ry="52" fill="' + PLATE.leaf + '"/>' +
            '<ellipse cx="100" cy="84" rx="80" ry="45" fill="#2A6139"/>';
    [[72,72],[108,66],[90,96]].forEach((p, i) => {
      g += '<ellipse cx="' + (p[0] + jit(s,i,3)) + '" cy="' + p[1] + '" rx="25" ry="17" fill="#FBF6EC"/>' +
           '<ellipse cx="' + (p[0] + jit(s,i,3)) + '" cy="' + (p[1] - 3) + '" rx="21" ry="12" fill="#FFFDF7"/>';
    });
    g += '<circle cx="158" cy="70" r="17" fill="#8A4A18"/><circle cx="158" cy="70" r="13" fill="#C4671F"/>' +
         '<circle cx="156" cy="106" r="14" fill="#D9DCCF"/><circle cx="156" cy="106" r="10.5" fill="#F1F3E9"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Vada — golden torus, one behind the other. */
  ring(s){
    let g = '<ellipse cx="100" cy="88" rx="82" ry="48" fill="#3E3A34"/>';
    [[80,80,30],[122,92,26]].forEach((p, i) => {
      g += '<ellipse cx="' + (p[0] + jit(s,i,2)) + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + (p[2] * .72) + '" fill="#B9762E"/>' +
           '<ellipse cx="' + (p[0] + jit(s,i,2)) + '" cy="' + (p[1] - 2) + '" rx="' + (p[2] - 4) + '" ry="' + (p[2] * .62) + '" fill="#D68F3E"/>' +
           '<ellipse cx="' + (p[0] + jit(s,i,2)) + '" cy="' + p[1] + '" rx="8" ry="6" fill="#3E3A34"/>';
    });
    return artSVG(g, PLATE.slate);
  },

  /* Dosa — the folded golden cone with two chutney bowls. */
  cone(s){
    let g = '<ellipse cx="100" cy="92" rx="90" ry="50" fill="#20303A"/>' +
            '<ellipse cx="100" cy="90" rx="82" ry="43" fill="#2B4250"/>' +
            '<path d="M28 96 Q60 44 96 52 Q132 60 158 96 Q100 112 28 96 Z" fill="#C88129"/>' +
            '<path d="M36 94 Q64 54 96 60 Q128 68 148 94 Q100 106 36 94 Z" fill="#E0A048"/>' +
            '<path d="M52 90 Q76 64 98 68 Q122 74 136 90 Q100 98 52 90 Z" fill="#EFBB6B" opacity=".85"/>';
    for (let i = 0; i < 5; i++)
      g += '<ellipse cx="' + (62 + i * 18 + jit(s,i,4)) + '" cy="' + (82 + jit(s,i,4)) + '" rx="4" ry="2.4" fill="#B0682044"/>';
    g += '<circle cx="42" cy="118" r="13" fill="#E6E9DA"/><circle cx="42" cy="118" r="9.5" fill="#F5F7EE"/>' +
         '<circle cx="76" cy="122" r="12" fill="#7C4514"/><circle cx="76" cy="122" r="8.5" fill="#A85C1B"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Uttapam — thick speckled pancake. */
  pancake(s){
    let g = '<ellipse cx="100" cy="86" rx="86" ry="50" fill="#33302B"/>' +
            '<circle cx="100" cy="82" r="52" fill="#C98A34"/>' +
            '<circle cx="100" cy="79" r="47" fill="#E3A94E"/>';
    for (let i = 0; i < 12; i++){
      const ang = (seedOf('u') * (i + 3)) % 360, r = 12 + (i % 4) * 9;
      g += '<circle cx="' + (100 + Math.cos(ang) * r).toFixed(1) + '" cy="' + (79 + Math.sin(ang) * r * .8).toFixed(1) +
           '" r="' + (2.6 + (i % 3)) + '" fill="' + (i % 3 ? '#9E4B22' : '#4E7A38') + '"/>';
    }
    return artSVG(g, PLATE.slate);
  },

  /* Biryani / rice — mound with garnish. */
  mound(s){
    let g = '<ellipse cx="100" cy="96" rx="86" ry="46" fill="#2E2A26"/>' +
            '<ellipse cx="100" cy="94" rx="76" ry="38" fill="#413A32"/>' +
            '<path d="M34 96 Q100 40 166 96 Q100 118 34 96 Z" fill="#E8CE94"/>' +
            '<path d="M46 94 Q100 52 154 94 Q100 110 46 94 Z" fill="#F2DCAA"/>';
    for (let i = 0; i < 14; i++){
      const x = 50 + (i * 13 + jit(s,i,7)) % 104, y = 70 + (i * 9 + jit(s,i,6)) % 30;
      g += '<ellipse cx="' + x + '" cy="' + y + '" rx="5" ry="2" fill="' +
           (i % 4 === 0 ? '#C4611C' : i % 4 === 1 ? '#7E3F12' : '#FFF3D6') + '" opacity=".9"/>';
    }
    g += '<ellipse cx="128" cy="76" rx="13" ry="9" fill="#8C3A16"/>' +
         '<ellipse cx="72" cy="80" rx="10" ry="7" fill="#3F6B2C"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Curry — bowl, gravy surface, oil beads. */
  bowl(s){
    let g = '<ellipse cx="100" cy="100" rx="80" ry="44" fill="#2C2825"/>' +
            '<path d="M38 84 Q100 62 162 84 Q152 126 100 130 Q48 126 38 84 Z" fill="#C9CDD2"/>' +
            '<ellipse cx="100" cy="84" rx="62" ry="26" fill="#A83B18"/>' +
            '<ellipse cx="100" cy="82" rx="56" ry="22" fill="#C7502020"/>' +
            '<ellipse cx="100" cy="82" rx="56" ry="22" fill="#C25320"/>';
    for (let i = 0; i < 7; i++)
      g += '<ellipse cx="' + (74 + (i * 17 + jit(s,i,6)) % 54) + '" cy="' + (76 + (i * 7) % 14) +
           '" rx="' + (3 + i % 3) + '" ry="' + (2 + i % 2) + '" fill="#E8A33C" opacity=".75"/>';
    g += '<ellipse cx="112" cy="78" rx="9" ry="5" fill="#F0E7D2" opacity=".9"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Fried chunks — Chicken 65, fish fry. */
  fry(s){
    let g = '<ellipse cx="100" cy="94" rx="84" ry="46" fill="#2B2724"/>' +
            '<ellipse cx="100" cy="92" rx="74" ry="38" fill="#E9E4D8"/>';
    for (let i = 0; i < 9; i++){
      const x = 58 + (i * 21 + jit(s,i,9)) % 88, y = 74 + (i * 13 + jit(s,i,7)) % 32;
      g += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (11 + i % 3) + '" ry="' + (8 + i % 2) +
           '" fill="' + (i % 2 ? '#B23A18' : '#CB4E1E') + '" transform="rotate(' + ((i * 37) % 60 - 30) + ' ' + x + ' ' + y + ')"/>';
    }
    for (let i = 0; i < 5; i++)
      g += '<path d="M' + (66 + i * 19) + ' ' + (66 + (i % 3) * 6) + ' q6 -7 13 -1" stroke="#3F6B2C" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Parotta — flaky stacked rounds. */
  layers(s){
    let g = '<ellipse cx="100" cy="96" rx="84" ry="44" fill="#312C26"/>';
    [[100,96,54],[98,84,50],[102,73,45]].forEach((p, i) => {
      g += '<ellipse cx="' + (p[0] + jit(s,i,3)) + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + (p[2] * .34) + '" fill="#B9822F"/>' +
           '<ellipse cx="' + (p[0] + jit(s,i,3)) + '" cy="' + (p[1] - 3) + '" rx="' + (p[2] - 5) + '" ry="' + (p[2] * .28) + '" fill="#DCA34A"/>';
    });
    return artSVG(g, PLATE.slate);
  },

  /* Kothu parotta — parotta shredded on the griddle with egg and salna.
     Chopped, tossed, uneven; nothing like the neat stack of a plain
     parotta, which is why it needed its own drawing. */
  kothu(s){
    let g = '<ellipse cx="100" cy="94" rx="86" ry="46" fill="#2B2724"/>' +
            '<ellipse cx="100" cy="92" rx="76" ry="38" fill="#40382F"/>';
    for (let i = 0; i < 22; i++){
      const x = 44 + (i * 23 + jit(s,i,11)) % 112;
      const y = 70 + (i * 17 + jit(s,i,9)) % 40;
      const w = 7 + (i % 4) * 3, rot = (i * 53) % 180 - 90;
      const col = i % 5 === 0 ? '#8C3A16' : i % 5 === 1 ? '#E8C86A' : i % 5 === 2 ? '#C4611C' : '#D8A martin';
      g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="4.5" rx="2" fill="' +
           (col === '#D8A martin' ? '#D89B45' : col) + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
    }
    g += '<ellipse cx="126" cy="82" rx="9" ry="6.5" fill="#F2E4C4"/>' +
         '<ellipse cx="126" cy="82" rx="4" ry="3" fill="#E8A33C"/>' +
         '<path d="M62 76 q7 -7 14 -1" stroke="#3F6B2C" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Samosa — two triangles. */
  triangle(s){
    let g = '<ellipse cx="100" cy="98" rx="82" ry="42" fill="#2E2A25"/>';
    [[78,86,1],[124,78,-1]].forEach((p, i) => {
      const x = p[0] + jit(s,i,3), y = p[1];
      g += '<path d="M' + x + ' ' + (y - 30) + ' L' + (x + 34 * p[2]) + ' ' + (y + 22) + ' L' + (x - 34 * p[2]) + ' ' + (y + 22) + ' Z" fill="#B77A2C"/>' +
           '<path d="M' + x + ' ' + (y - 24) + ' L' + (x + 27 * p[2]) + ' ' + (y + 17) + ' L' + (x - 27 * p[2]) + ' ' + (y + 17) + ' Z" fill="#D9993C"/>';
    });
    g += '<circle cx="44" cy="112" r="12" fill="#2F5A2A"/><circle cx="44" cy="112" r="8.5" fill="#437A38"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Filter coffee — tumbler and davara. */
  /* Filter coffee is a steel tumbler in a davara. Chai is a smaller glass
     with a tan brew — same family, genuinely different object. */
  cup(s, chai){
    if (chai) {
      let c = '<ellipse cx="100" cy="116" rx="66" ry="24" fill="#2B2724"/>' +
              '<path d="M78 58 L122 58 L116 118 Q100 124 84 118 Z" fill="#FFFFFF" fill-opacity=".16"/>' +
              '<path d="M82 76 L118 76 L113 116 Q100 121 87 116 Z" fill="#B07C45"/>' +
              '<ellipse cx="100" cy="76" rx="18" ry="5" fill="#D3A470"/>' +
              '<ellipse cx="100" cy="75" rx="12" ry="3" fill="#E8CBA4"/>' +
              '<path d="M85 62 L88 62 L86 114" stroke="#FFFFFF" stroke-opacity=".2" stroke-width="3" fill="none"/>';
      for (let i = 0; i < 3; i++)
        c += '<path d="M' + (90 + i * 10) + ' 50 q5 -8 0 -14" stroke="#FFFFFF" stroke-opacity=".16" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      return artSVG(c, PLATE.slate);
    }
    let g = '<ellipse cx="100" cy="112" rx="80" ry="30" fill="#2B2724"/>' +
            '<path d="M56 118 Q100 132 144 118 Q140 128 100 132 Q60 128 56 118 Z" fill="#8E939A"/>' +
            '<path d="M50 112 Q100 128 150 112 L146 106 Q100 118 54 106 Z" fill="#B9BEC4"/>' +
            '<path d="M74 52 L126 52 L120 108 Q100 116 80 108 Z" fill="#C6CBD1"/>' +
            '<path d="M78 56 L122 56 L117 104 Q100 110 83 104 Z" fill="#DEE2E6"/>' +
            '<path d="M82 62 L118 62 L114 84 Q100 90 86 84 Z" fill="#8A5A2E"/>' +
            '<ellipse cx="100" cy="62" rx="18" ry="5" fill="#C08A50"/>' +
            '<ellipse cx="100" cy="60" rx="13" ry="3.4" fill="#E6D0B0"/>';
    for (let i = 0; i < 3; i++)
      g += '<path d="M' + (88 + i * 12) + ' 44 q5 -8 0 -15" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    return artSVG(g, PLATE.wood);
  },

  /* Tall glass — rose milk, buttermilk. */
  glass(s, tint){
    const liquid = tint || '#E9C3CE';
    let g = '<ellipse cx="100" cy="120" rx="72" ry="24" fill="#2B2724"/>' +
            '<path d="M76 40 L124 40 L118 122 Q100 128 82 122 Z" fill="#FFFFFF" fill-opacity=".14"/>' +
            '<path d="M80 62 L120 62 L115 119 Q100 124 85 119 Z" fill="' + liquid + '"/>' +
            '<ellipse cx="100" cy="62" rx="20" ry="5" fill="#FFFFFF" fill-opacity=".5"/>' +
            '<path d="M84 46 L88 46 L86 118" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="3" fill="none"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Gulab jamun — dark spheres sitting in syrup. */
  spheres(s){
    let g = '<ellipse cx="100" cy="98" rx="80" ry="42" fill="#2C2724"/>' +
            '<ellipse cx="100" cy="96" rx="66" ry="32" fill="#E4E7DE"/>' +
            '<ellipse cx="100" cy="96" rx="58" ry="26" fill="#B07A34"/>';
    [[84,88],[118,92]].forEach((p, i) => {
      g += '<circle cx="' + (p[0] + jit(s,i,3)) + '" cy="' + p[1] + '" r="21" fill="#5C3016"/>' +
           '<circle cx="' + (p[0] + jit(s,i,3) - 5) + '" cy="' + (p[1] - 6) + '" r="7" fill="#8A5230" opacity=".7"/>';
    });
    return artSVG(g, PLATE.slate);
  },

  /* Payasam — pale bowl with nuts. */
  bowlSweet(s){
    let g = '<ellipse cx="100" cy="102" rx="78" ry="40" fill="#2C2724"/>' +
            '<path d="M42 82 Q100 62 158 82 Q148 122 100 126 Q52 122 42 82 Z" fill="#DFE3E7"/>' +
            '<ellipse cx="100" cy="82" rx="58" ry="24" fill="#EFE2C6"/>';
    for (let i = 0; i < 8; i++)
      g += '<ellipse cx="' + (72 + (i * 15 + jit(s,i,5)) % 58) + '" cy="' + (76 + (i * 6) % 12) +
           '" rx="4.5" ry="3" fill="' + (i % 2 ? '#C08A4A' : '#8A5A2E') + '"/>';
    return artSVG(g, PLATE.slate);
  },

  /* Thali — big plate ringed with katoris. */
  thali(s){
    let g = '<rect width="200" height="150" fill="' + PLATE.slate + '"/>' +
            '<circle cx="100" cy="80" r="66" fill="#C9CDD2"/>' +
            '<circle cx="100" cy="80" r="59" fill="#DFE3E7"/>' +
            '<ellipse cx="100" cy="96" rx="30" ry="18" fill="#F5EFE0"/>';
    const bits = [['#C4611C',66,50],['#3F6B2C',100,44],['#A83B18',134,50],
                  ['#E0B23C',146,84],['#8A5A2E',56,86],['#D9DCCF',124,110]];
    bits.forEach(b => {
      g += '<circle cx="' + b[1] + '" cy="' + b[2] + '" r="15" fill="#B9BEC4"/>' +
           '<circle cx="' + b[1] + '" cy="' + b[2] + '" r="11.5" fill="' + b[0] + '"/>';
    });
    return artSVG(g, PLATE.slate);
  },
};

/* Which drawing each dish gets. Keyed by id so a rename never silently
   changes the picture. */
const ART_FOR = {
  't1':'discs','t2':'ring','t3':'cone','t4':'cone','t5':'cone','t6':'mound','t7':'layers',
  'm1':'thali','m2':'mound','m3':'mound','m4':'mound',
  'c1':'bowl','c2':'fry','c3':'bowl','c4':'fry','c5':'fry','c6':'kothu',
  'k1':'triangle','k2':'ring',
  'b1':'cup','b2':'cup','b3':'glass','b4':'glass',
  's1':'spheres','s2':'bowlSweet',
};

function dishArt(it){
  const fam = ART_FOR[it.id] || 'bowl';
  const s = seedOf(it.id);
  if (fam === 'glass') return ART.glass(s, it.id === 'b4' ? '#E8EDE2' : '#E9C3CE');
  if (fam === 'cup')   return ART.cup(s, it.id === 'b2');   /* b2 = masala chai */
  return (ART[fam] || ART.bowl)(s);
}

/* ========================================================================== */
/* MENU                                                                        */
/* ========================================================================== */

/* exported for the other modules */
window.USE_ART=USE_ART;
window.PLATE=PLATE;
window.ART=ART;
window.ART_FOR=ART_FOR;
window.artSVG=artSVG;
window.seedOf=seedOf;
window.jit=jit;
window.dishArt=dishArt;
