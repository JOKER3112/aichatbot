/* Petpooja AI — shared UI pieces: helpers, icons, thinking, chats, island
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

function esc(s){return String(s).replace(/[&<>"']/g,c=>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const R$=n=>'₹'+n;

/* ------------------------------------------------------------------ icons
   Stroke, not solid. Every glyph below is drawn as an outline on a 24 box —
   `data-i` is the hook a single global rule uses to force fill:none and
   paint the stroke instead, which is what keeps them consistent no matter
   which component is colouring them.

   Two deliberate exceptions, both because a hollow version would say the
   wrong thing: `star` is a rating value, and an empty star reads as "not
   rated"; `spark` is the Petpooja mark, which is a logo, not an icon. */
const I=(d)=>'<svg data-i viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>';
const IC={
  lock : I('<rect x="4.6" y="10.4" width="14.8" height="10.6" rx="2.6"/>'+
           '<path d="M8 10.4V7a4 4 0 0 1 8 0v3.4"/><circle cx="12" cy="15.6" r="1.25"/>'),
  ok   : I('<path d="M5 12.6 9.6 17.1 19 7.2"/>'),
  x    : I('<path d="M6.6 6.6 17.4 17.4M17.4 6.6 6.6 17.4"/>'),
  plus : I('<path d="M12 5.4v13.2M5.4 12h13.2"/>'),
  minus: I('<path d="M5.4 12h13.2"/>'),
  cart : I('<path d="M2.8 4h2.4l2.5 10.6h9.6l2.3-7.8H6.2"/>'+
           '<circle cx="9.6" cy="19" r="1.5"/><circle cx="17.4" cy="19" r="1.5"/>'),
  mic  : I('<rect x="9.2" y="2.9" width="5.6" height="10.6" rx="2.8"/>'+
           '<path d="M5.9 11.4a6.1 6.1 0 0 0 12.2 0M12 17.6V21"/>'),
  send : I('<path d="M7.3 16.7 16.6 7.4M9.1 7.4h7.5v7.5"/>'),
  sun  : I('<circle cx="12" cy="12" r="4"/>'+
           '<path d="M12 2.6V5M12 19v2.4M4.3 4.3 6 6M18 18l1.7 1.7M2.6 12H5M19 12h2.4M4.3 19.7 6 18M18 6l1.7-1.7"/>'),
  moon : I('<path d="M20.2 14.3A8.3 8.3 0 0 1 9.7 3.8 8.6 8.6 0 1 0 20.2 14.3z"/>'),
  table: I('<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="3.2"/>'),
  bag  : I('<path d="M5.4 7.8h13.2l-1 12.4H6.4z"/>'+
           '<path d="M8.8 7.8V6.1a3.2 3.2 0 0 1 6.4 0v1.7"/>'),
  bike : I('<circle cx="6" cy="16.8" r="3.1"/><circle cx="18" cy="16.8" r="3.1"/>'+
           '<path d="M9.1 16.8h4.3l3-8.2h-2.6M13.4 8.6h3.2l1.4 8.2"/>'),
  /* filled on purpose — see the note above */
  star :'<svg viewBox="0 0 24 24"><path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  spark:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.43872 13.4363C2.43995 13.4363 0 10.9964 0 7.9976C0 4.99882 2.43995 2.56 5.43872 2.56C8.4375 2.56 10.8774 4.99995 10.8774 7.99872C10.8774 8.2742 10.6537 8.49795 10.3782 8.49795C10.1027 8.49795 9.87897 8.2742 9.87897 7.99872C9.87897 5.5509 7.88766 3.55959 5.43985 3.55959C2.99203 3.55959 1.00072 5.5509 1.00072 7.99872C1.00072 10.4465 2.99203 12.4378 5.43985 12.4378C5.71532 12.4378 5.93908 12.6616 5.93908 12.9371C5.93908 13.2126 5.71532 13.4363 5.43985 13.4363H5.43872Z"/><path d="M11.4237 13.4364C8.89947 13.4364 6.84631 11.3833 6.84631 8.85899C6.84631 8.58351 7.07007 8.35976 7.34554 8.35976C7.62102 8.35976 7.84478 8.58351 7.84478 8.85899C7.84478 10.8323 9.45042 12.4368 11.4226 12.4368C13.3948 12.4368 15.0005 10.8312 15.0005 8.85899C15.0005 6.88679 13.3948 5.28115 11.4226 5.28115C11.1471 5.28115 10.9234 5.0574 10.9234 4.78192C10.9234 4.50644 11.1471 4.28268 11.4226 4.28268C13.9469 4.28268 16 6.33584 16 8.86012C16 11.3844 13.9469 13.4375 11.4226 13.4375L11.4237 13.4364Z"/></svg>',
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
   THINKING — fourth pass. The mesh moved out from under this panel and up
   to the app, so the whole screen warms while the assistant works. What's
   left here is the mark and the rotating word, floating on it.

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
    G.killTweensOf(el.querySelectorAll('.thk__r, .thk__orb'));
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
                /* Not "New order" — that's the name of the button that makes
                   one, and three rows sharing it with the action above them
                   is why the list read as four copies of the same thing. */
                title: title || 'Untitled order',
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
/* Opening and closing were built as a party trick — the panel collapsed to
   a 999px pill and stretched back out on a back-ease. It looked good once
   and then got in the way, because it takes half a second and it fights
   whatever happens next. Both directions are shorter and flatter now: the
   panel scales from just under full size on a single out-curve, the rows
   come with it rather than after it, and nothing overshoots. */
function islandOpen(){
  const isl = document.getElementById('isl');
  const scrim = document.getElementById('islScrim');
  const ttl = document.getElementById('ttl');
  renderChats();
  ttl.classList.add('open');
  ttl.setAttribute('aria-expanded','true');
  isl.classList.add('on');
  scrim.classList.add('on');

  const G = M.g();
  if (!G) return;
  G.set(isl, { xPercent: -50, transformOrigin: 'top center' });
  const rows = isl.querySelectorAll('.ch, .isl__new, .isl__h');
  G.killTweensOf([isl, scrim]);
  G.killTweensOf(rows);
  G.timeline()
    .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: .2, ease: 'none' }, 0)
    .fromTo(isl,
      { xPercent: -50, scale: .94, y: -10, opacity: 0 },
      { xPercent: -50, scale: 1, y: 0, opacity: 1,
        duration: .34, ease: 'power3.out' }, 0)
    .from(rows, { y: -7, opacity: 0, duration: .26, stagger: .028,
                  ease: 'power2.out', clearProps: 'transform' }, .07);
}

function islandClose(){
  const isl = document.getElementById('isl');
  const scrim = document.getElementById('islScrim');
  const ttl = document.getElementById('ttl');
  ttl.classList.remove('open');
  ttl.setAttribute('aria-expanded','false');

  const done = () => {
    isl.classList.remove('on'); scrim.classList.remove('on');
    const G2 = M.g(); if (G2) G2.set(isl, { clearProps: 'transform,opacity' });
  };
  const G = M.g();
  if (!G) { done(); return; }
  G.killTweensOf([isl, scrim]);
  /* Deliberately quick: this runs while the thread underneath is already
     swapping, and the two used to trip over each other. */
  G.timeline({ onComplete: done })
    .to(isl, { xPercent: -50, scale: .96, y: -8, opacity: 0,
               duration: .2, ease: 'power2.in' }, 0)
    .to(scrim, { opacity: 0, duration: .2, ease: 'none' }, 0);
}

/* Every row used to be the same orange tile with a subtitle under it, so
   the list read as copies of one thing and you had to read the small text
   to tell them apart. The difference is structural now: New order is the
   one filled action, the chat you're in gets a brand rail down its edge and
   a tinted mark, and the rest are plain. The subtitles are gone — they
   restated what the row already said. What's left is the title and the item
   count, which is the only thing that actually differs between chats. */
function renderChats(){
  const box = document.getElementById('islList');
  const cs = Chats.list();
  box.innerHTML =
    /* The one action in this panel, and now the only thing in it wearing
       the primary. It used to share both its name and its colour weight
       with every row below it. */
    '<button class="isl__new" data-a="newchat">' +
      '<span class="isl__new-i">' + IC.plus + '</span>' +
      '<span class="ch__n">New order</span></button>' +
    cs.map(c => {
      const live = c.id === Chats.activeId();
      const items = live ? Cart.totals().n : c.lines.reduce((a,l) => a + l.q, 0);
      return '<div class="ch' + (live ? ' now' : '') + '" data-a="openchat" data-id="' + c.id + '"' +
        (live ? ' aria-current="true"' : '') + '>' +
        /* The current one is marked by the rail down its left edge; the mark
           just tints to agree with it. A filled colour tile made that row
           look like a second button competing with the action above it. */
        '<span class="ch__i">' + IC.spark + '</span>' +
        '<span class="ch__n">' + esc(c.title) + '</span>' +
        (items ? '<span class="ch__c">' + items + '</span>' : '') +
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
