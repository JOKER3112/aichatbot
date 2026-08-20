/* Petpooja AI — shared UI pieces: helpers, icons, thinking, chats, island
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

function esc(s){return String(s).replace(/[&<>"']/g,c=>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const R$=n=>'₹'+n;

const IC={
  lock:'<svg viewBox="0 0 24 24"><path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2m-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4M9 8V6a3 3 0 0 1 6 0v2z"/></svg>',
  spark:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.43872 13.4363C2.43995 13.4363 0 10.9964 0 7.9976C0 4.99882 2.43995 2.56 5.43872 2.56C8.4375 2.56 10.8774 4.99995 10.8774 7.99872C10.8774 8.2742 10.6537 8.49795 10.3782 8.49795C10.1027 8.49795 9.87897 8.2742 9.87897 7.99872C9.87897 5.5509 7.88766 3.55959 5.43985 3.55959C2.99203 3.55959 1.00072 5.5509 1.00072 7.99872C1.00072 10.4465 2.99203 12.4378 5.43985 12.4378C5.71532 12.4378 5.93908 12.6616 5.93908 12.9371C5.93908 13.2126 5.71532 13.4363 5.43985 13.4363H5.43872Z"/><path d="M11.4237 13.4364C8.89947 13.4364 6.84631 11.3833 6.84631 8.85899C6.84631 8.58351 7.07007 8.35976 7.34554 8.35976C7.62102 8.35976 7.84478 8.58351 7.84478 8.85899C7.84478 10.8323 9.45042 12.4368 11.4226 12.4368C13.3948 12.4368 15.0005 10.8312 15.0005 8.85899C15.0005 6.88679 13.3948 5.28115 11.4226 5.28115C11.1471 5.28115 10.9234 5.0574 10.9234 4.78192C10.9234 4.50644 11.1471 4.28268 11.4226 4.28268C13.9469 4.28268 16 6.33584 16 8.86012C16 11.3844 13.9469 13.4375 11.4226 13.4375L11.4237 13.4364Z"/></svg>',
  ok:'<svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>',
  minus:'<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14z"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0-5 2.39 3.42C13.65 5.15 12.84 5 12 5s-1.65.15-2.39.42zM3.34 7l4.16-.35A7.2 7.2 0 0 0 5.94 8.5c-.44.74-.69 1.5-.83 2.29zm.02 10 1.76-3.77a7.13 7.13 0 0 0 2.38 4.14zM20.65 7l-1.77 3.79a7.02 7.02 0 0 0-2.38-4.15zm-.01 10-4.14.36a7.5 7.5 0 0 0 1.55-1.86c.44-.73.69-1.5.82-2.28zM12 22l-2.41-3.44c.74.27 1.55.44 2.41.44s1.67-.17 2.41-.44z"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1"/></svg>',
  table:'<svg viewBox="0 0 24 24"><path d="M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-6-2v2h-4V4z"/></svg>',
  bag:'<svg viewBox="0 0 24 24"><path d="M18 6h-2A4 4 0 0 0 8 6H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-6-2a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2"/></svg>',
  bike:'<svg viewBox="0 0 24 24"><path d="M15.5 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4M5 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 8.5A3.5 3.5 0 1 1 5 13.5a3.5 3.5 0 0 1 0 7m5.8-10 2.4-2.4.8.8a5.9 5.9 0 0 0 4 1.6V8.7a4.3 4.3 0 0 1-2.9-1.2l-1.9-1.9a1.8 1.8 0 0 0-2.6 0L7.8 8.4a1.8 1.8 0 0 0 0 2.6L11 14v5h2v-6.2zM19 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7"/></svg>',
};
const MI={dinein:IC.table,pickup:IC.bag,delivery:IC.bike};

/* ========================================================================== */
/* UI                                                                          */
/* ========================================================================== */

/* ==========================================================================
   UI — the whole flow lives in the thread.

   There are no bottom sheets. Options, order review, your details, payment,
   confirmation and tracking are all widgets rendered inline, so nothing ever
   covers the conversation and every step stays in the scrollback.

   Widgets follow one contract:
     .w        the card
     .w__h     small caps label + optional count
     .w__b     body
     .w__f     footer actions
     .w__d     the one-line summary it collapses to once resolved
   ========================================================================== */

/* ==========================================================================
   THINKING — reinterpreted from the Lottie.

   The Lottie was two corner brackets plus top/bottom gradient sweeps
   animating opacity and scale over 1.67s — a frame "scanning" an image.
   That reads as generation, which is the wrong idea here: the assistant
   isn't inventing a dish, it's searching a kitchen. So the brackets stay
   (they still say "looking at something"), the sweep becomes a single band
   travelling top to bottom like a pass over a counter, and the middle
   carries a rotating line of kitchen work instead of a spinner.

   Phrases are ordered so the last few are about the cart, which is where
   the flow is heading.
   ========================================================================== */
const THINK_LINES = [
  'Checking the kitchen…',
  'Warming the tawa…',
  'Tasting the sambar…',
  'Counting the idlis…',
  'Pulling filter coffee…',
  'Asking the chef…',
  'Plating it up…',
  'Adding to your cart…',
];

/* --------------------------------------------------------------------------
   THINKING — third pass, and the box is gone.

   The card version had three problems on one small panel. It was a bordered
   surface sitting between two other bordered surfaces, so "the assistant is
   working" looked like "another widget arrived". Its fill was hard-coded
   dark, which is why it stayed black in light mode. And the skeleton
   underneath was promising a carousel that half the answers never deliver.

   This is a mesh gradient instead: four soft colour fields drifting behind
   the thread with no container at all, the word floating on top. Nothing is
   claiming to be a card, so nothing has to justify an edge — and because
   every colour comes from theme tokens, light mode is warm daylight rather
   than a black rectangle.
   -------------------------------------------------------------------------- */
function thinkPanel(){
  const el = document.createElement('div');
  el.className = 'thk';
  el.id = 'thk';
  el.innerHTML =
    '<div class="thk__mesh" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
    '<div class="thk__top">' +
      '<div class="thk__orb">' +
        '<span class="thk__r"></span><span class="thk__r"></span><span class="thk__r"></span>' +
        IC.spark +
      '</div>' +
      '<div class="thk__w"><span data-line>' + THINK_LINES[0] + '</span></div>' +
    '</div>';
  return el;
}

/* Returns stop() so nothing keeps running once the answer lands. */
function thinkPlay(el){
  const G = M.g();
  const word = el.querySelector('[data-line]');
  let i = 0;
  const timers = [];

  /* Phrase swap: out through a slight blur, in from below. Blur rather than
     a hard cut because the words are a mood, not data to read precisely. */
  const rotate = () => {
    i = (i + 1) % THINK_LINES.length;
    if (!G) { word.textContent = THINK_LINES[i]; return; }
    G.timeline()
      .to(word, { y: -14, opacity: 0, filter: 'blur(5px)', duration: .24, ease: 'power2.in' })
      .add(() => { word.textContent = THINK_LINES[i]; })
      .fromTo(word,
        { y: 14, opacity: 0, filter: 'blur(5px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: .34, ease: 'power3.out' });
  };
  timers.push(setInterval(rotate, 1100));

  if (!G) return () => timers.forEach(clearInterval);

  /* The mesh. Each field drifts on its own period and none of the periods
     divide evenly into another, so the pattern never visibly repeats in the
     second and a half anyone actually watches it for. */
  const blobs = el.querySelectorAll('.thk__mesh i');
  const drift = [
    { x:  26, y: -18, s: 1.18, d: 3.1 },
    { x: -30, y:  16, s: .84,  d: 3.7 },
    { x:  18, y:  24, s: 1.12, d: 4.3 },
    { x: -22, y: -20, s: .9,   d: 2.9 },
  ];
  blobs.forEach((b, k) => {
    const p = drift[k % drift.length];
    G.to(b, { xPercent: p.x, yPercent: p.y, scale: p.s, duration: p.d,
              repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
  G.fromTo(el.querySelector('.thk__mesh'), { opacity: 0 }, { opacity: 1, duration: .5, ease: 'power2.out' });

  /* Heat off a pan: three rings pushing outward, offset so there is always
     one mid-flight. Sonar with a warm palette rather than a scanning frame. */
  el.querySelectorAll('.thk__r').forEach((r, k) => {
    G.fromTo(r,
      { scale: 1, opacity: .55 },
      { scale: 2.1, opacity: 0, duration: 1.8, repeat: -1,
        ease: 'power2.out', delay: k * .6 });
  });
  G.to(el.querySelector('.thk__orb'),
    { scale: 1.05, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  G.from(el.querySelector('.thk__top'), { opacity: 0, y: 12, duration: .44, ease: 'power3.out' });

  return () => {
    timers.forEach(clearInterval);
    G.killTweensOf(el.querySelectorAll('.thk__r, .thk__orb, .thk__mesh, .thk__mesh i'));
    G.killTweensOf([el, word, el.querySelector('.thk__top')]);
  };
}

/* ==========================================================================
   CHATS — several conversations, each with its own thread and its own cart.

   A chat stores the rendered thread HTML plus the cart lines and fulfilment.
   Swapping is therefore a DOM swap plus a state restore, which keeps the
   scrollback exactly as you left it rather than replaying it.
   ========================================================================== */
const Chats = (function(){
  let list = [], active = null, n = 0;
  const now = () => Date.now();

  function make(title){
    const c = { id: 'c' + (++n) + Date.now().toString(36),
                title: title || 'New order',
                html: '', lines: [], ful: null, at: now(), titled: false };
    list.unshift(c);
    active = c.id;
    return c;
  }
  const get = (id) => list.find(c => c.id === id) || null;
  const cur = () => get(active);

  /** Freeze the live thread + cart into the active chat record. */
  function save(threadEl){
    const c = cur(); if (!c) return;
    c.html = threadEl.innerHTML;
    const s = Cart.snap();
    c.lines = JSON.parse(JSON.stringify(Cart.raw()));
    c.ful = s.ful;
    c.at = now();
  }

  /** Name the chat after the first thing the user actually asked for. */
  function autoTitle(text){
    const c = cur(); if (!c || c.titled) return;
    c.title = text.length > 26 ? text.slice(0, 26).trim() + '…' : text;
    c.titled = true;
  }

  function close(id){
    const i = list.findIndex(c => c.id === id);
    if (i < 0) return null;
    list.splice(i, 1);
    if (active === id) active = list.length ? list[0].id : null;
    return active;
  }

  return { list: () => list, make, get, cur, save, autoTitle, close,
           setActive: (id) => { active = id; },
           activeId: () => active };
})();

/* ==========================================================================
   ISLAND — the header title is the control, and the panel is the same
   object grown large. It expands from the pill's own width and radius with
   a springy two-axis scale, content arriving only once the shape settles.
   Closing a chat squashes that row and the panel re-settles to its new
   height, so it never reads as a list inside a box — it reads as one
   surface reshaping.
   ========================================================================== */
function islandOpen(){
  const isl = document.getElementById('isl');
  const scrim = document.getElementById('islScrim');
  const ttl = document.getElementById('ttl');
  renderChats();
  ttl.classList.add('open');
  ttl.setAttribute('aria-expanded','true');
  isl.classList.add('on');
  scrim.classList.add('on');
  const Gs=M.g(); if(Gs) Gs.set(isl,{xPercent:-50,transformOrigin:'top center'});

  const G = M.g();
  if (!G) return;
  const rows = isl.querySelectorAll('.ch, .isl__new, .isl__h');
  G.killTweensOf([isl, scrim]);
  G.timeline()
    .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: .24 }, 0)
    /* Width leads, height follows — that's what makes it feel like the pill
       stretching rather than a panel fading in. */
    .fromTo(isl,
      { xPercent: -50, scaleX: .55, scaleY: .12, opacity: 0, borderRadius: '999px' },
      { xPercent: -50, scaleX: 1, scaleY: 1, opacity: 1, borderRadius: '24px',
        duration: .52, ease: 'back.out(1.5)' }, 0)
    .from(rows, { y: -10, opacity: 0, duration: .3, stagger: .045, ease: 'power3.out' }, .18);
}

function islandClose(){
  const isl = document.getElementById('isl');
  const scrim = document.getElementById('islScrim');
  const ttl = document.getElementById('ttl');
  ttl.classList.remove('open');
  ttl.setAttribute('aria-expanded','false');

  const done = () => { isl.classList.remove('on'); scrim.classList.remove('on'); };
  const G = M.g();
  if (!G) { done(); return; }
  G.killTweensOf([isl, scrim]);
  G.timeline({ onComplete: done })
    .to(isl.querySelectorAll('.ch, .isl__new'), { y: -6, opacity: 0, duration: .16, stagger: .02 }, 0)
    .to(isl, { xPercent: -50, scaleX: .55, scaleY: .12, opacity: 0, borderRadius: '999px',
               duration: .3, ease: 'power2.in' }, .06)
    .to(scrim, { opacity: 0, duration: .24 }, 0);
}

function renderChats(){
  const box = document.getElementById('islList');
  const cs = Chats.list();
  box.innerHTML =
    '<button class="isl__new" data-a="newchat">' +
      '<span class="ch__i">' + IC.plus + '</span>' +
      '<span class="ch__b"><span class="ch__n">New order</span>' +
      '<span class="ch__d">Start a fresh conversation</span></span></button>' +
    cs.map(c => {
      const live = c.id === Chats.activeId();
      const items = live ? Cart.totals().n : c.lines.reduce((a,l) => a + l.q, 0);
      const when = new Date(c.at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      return '<div class="ch' + (live ? ' now' : '') + '" data-a="openchat" data-id="' + c.id + '">' +
        '<span class="ch__i">' + IC.spark + '</span>' +
        '<span class="ch__b"><span class="ch__n">' + esc(c.title) +
          (items ? '<span class="cnt">' + items + '</span>' : '') + '</span>' +
        '<span class="ch__d">' + (live ? 'Open now' : 'Last active ' + when) + '</span></span>' +
        (cs.length > 1 ? '<button class="ch__x" data-a="closechat" data-id="' + c.id +
          '" aria-label="Close this chat">' + IC.x + '</button>' : '') +
      '</div>';
    }).join('');
}

/* A closed chat collapses into nothing and the panel settles to its new
   height in the same timeline — one object reshaping, not a row vanishing
   out of a static box. */
function closeChatRow(id){
  const row = document.querySelector('.ch[data-a="openchat"][data-id="' + id + '"]');
  const isl = document.getElementById('isl');
  const G = M.g();
  const finish = () => {
    const nowActive = Chats.close(id);
    if (!nowActive) { Chats.make(); }
    renderChats();
    if (G) G.from(isl.querySelectorAll('.ch, .isl__new'),
      { opacity: 0, y: -6, duration: .24, stagger: .03 });
  };
  if (!row || !G) { finish(); return; }

  const h0 = isl.offsetHeight;
  G.timeline()
    .to(row, { x: 40, opacity: 0, duration: .2, ease: 'power2.in' })
    .to(row, { height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0,
               duration: .22, ease: 'power2.inOut',
               onComplete(){
                 finish();
                 const h1 = isl.offsetHeight;
                 G.fromTo(isl, { height: h0 }, { height: h1, duration: .34,
                   ease: 'power3.out', clearProps: 'height' });
               } });
}

/* exported for the other modules */
window.IC=IC;
window.MI=MI;
/* Composer prompt ideas. A static "Ask anything about menu…" teaches
   nothing; these teach the grammar the parser actually understands —
   quantities, dish names, constraints — by example, one at a time. */
const PROMPTS = [
  "Show me today's special",
  'Add 3 filter coffees',
  'Something spicy under \u20b9150',
  'Veg meal for two',
  'Full chicken biryani, no onion',
  'What goes with masala dosa?',
  'Two idlis and a vada',
  'Anything light for breakfast',
];

window.PROMPTS=PROMPTS;
window.THINK_LINES=THINK_LINES;
window.Chats=Chats;
window.esc=esc;
window.thinkPanel=thinkPanel;
window.thinkPlay=thinkPlay;
window.islandOpen=islandOpen;
window.islandClose=islandClose;
window.renderChats=renderChats;
window.closeChatRow=closeChatRow;
window.R$=R$;
