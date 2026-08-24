/* Petpooja AI — motion system
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

const M=(function(){
  const red=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const g=()=>(typeof window.gsap!=='undefined'&&!red)?window.gsap:null;
  return {
    red, g,
    in(el,ai){const G=g();if(!G||!el)return;
      G.from(el,{opacity:0,y:ai?9:7,duration:ai?.34:.24,ease:'power3.out',clearProps:'transform'});},
    cards(l){const G=g();if(!G||!l.length)return;
      G.from(l,{opacity:0,y:18,duration:.4,stagger:.06,ease:'power3.out',clearProps:'transform'});},
    /* One-shot "there's something here" for the chat switcher, played only
       when a second chat first exists. Decoration: the badge already reads
       correctly with GSAP absent. */
    nudge(el){const G=g();if(!G||!el)return;
      G.fromTo(el,{scale:1},{scale:1.06,duration:.18,ease:'power2.out',
        yoyo:true,repeat:3,transformOrigin:'left center',
        onComplete:()=>G.set(el,{scale:1})});},
    /* -------------------------------------------------- composer states
       Nothing animates except the box getting taller.

       An earlier pass used Flip to fly the controls to their new row. That
       was solving a problem the layout could solve for free: the dock is
       pinned to the bottom of the screen, so a taller composer grows
       upward, and with the grid bottom-aligned the cart, mic and send sit
       at the same screen position in both states. They don't need to be
       animated because they never actually move — only the field does, and
       it moves because the box's top edge does.

       With GSAP absent or reduced motion on, the class toggle alone is
       still completely correct. */
    composer(cp,on){
      const G=g();
      if(!cp) return;
      if(!G||M.red){ cp.classList.toggle('open',on); return; }

      const h0=cp.offsetHeight;
      cp.classList.toggle('open',on);          /* DOM is correct from here */
      const h1=cp.offsetHeight;

      G.killTweensOf(cp);
      G.fromTo(cp,{height:h0},{height:h1,duration:.4,ease:'power2.inOut',
        onComplete:()=>G.set(cp,{clearProps:'height'})});

      /* One pass of light along the box as it opens, then gone. */
      const sw=cp.querySelector('.cp__sweep i');
      if(on&&sw) G.fromTo(sw,{opacity:1,xPercent:-120},
        {xPercent:120,opacity:0,duration:.72,ease:'power2.out'});
    },
    /* ------------------------------------------------------ the mesh
       Two fields, and while the assistant is working they travel sideways
       past each other rather than breathing in place. That lateral pass is
       the whole effect: the warm one crosses right while the cool one
       crosses left, so the blend between them sweeps across the screen
       instead of pulsing.

       x, y and scale still get separate tweens on periods that don't divide
       into each other, so the vertical wander never syncs up with the
       horizontal pass and the loop has no visible beat.

       Drifts only while working — a perpetual loop behind an idle screen is
       a battery cost for something nobody is looking at. */
    mesh(on){
      const G=g(), amb=document.getElementById('amb'), app=document.getElementById('app');
      if(app) app.classList.toggle('busy',!!on);   /* opacity is CSS's job */
      if(!G||!amb) return;
      const blobs=amb.querySelectorAll('i');
      if(!on){
        G.killTweensOf(blobs);
        G.to(blobs,{xPercent:0,yPercent:0,scale:1,duration:.9,ease:'power2.out'});
        return;
      }
      const drift=[
        /* warm field: right, slow vertical drift, slower breath */
        { x:  42, y: -12, s:1.14, dx:4.9, dy:7.3, ds:11.7 },
        /* cool field: left, on periods that share no factor with the above */
        { x: -46, y:  14, s:0.88, dx:6.1, dy:9.7, ds:8.3  },
      ];
      blobs.forEach((b,k)=>{
        const p=drift[k%drift.length];
        G.killTweensOf(b);
        G.to(b,{xPercent:p.x,duration:p.dx,repeat:-1,yoyo:true,ease:'sine.inOut'});
        G.to(b,{yPercent:p.y,duration:p.dy,repeat:-1,yoyo:true,ease:'sine.inOut'});
        G.to(b,{scale:p.s,  duration:p.ds,repeat:-1,yoyo:true,ease:'sine.inOut'});
      });
    },
    tap(el,to){const G=g();if(!G||!el)return;
      G.timeline().to(el,{scale:to||.96,duration:.08}).to(el,{scale:1,duration:.22,ease:'power3.out'});},
    pop(el){const G=g();if(!G||!el)return;
      G.fromTo(el,{scale:.7},{scale:1,duration:.4,ease:'back.out(2.6)'});},
    /* The bubble already holds the right text; this only slides it in from
       where the chip was. If it no-ops the message is still correct. */
    fromChip(bub,r){const G=g();if(!G||!bub||!r||!r.width)return;
      const n=bub.getBoundingClientRect();
      G.fromTo(bub,{x:r.left-n.left,y:r.top-n.top,opacity:.7},
        {x:0,y:0,opacity:1,duration:.46,ease:'power3.out',clearProps:'transform'});},
    fly(from,to,src){const G=g();if(!G||!from||!to)return;
      const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
      if(!a.width||!b.width)return;
      const i=document.createElement('img');
      i.src=src;i.className='fly';i.alt='';document.body.appendChild(i);
      const x0=a.left+a.width/2-26,y0=a.top+a.height/2-26;
      const x1=b.left+b.width/2-26,y1=b.top+b.height/2-26;
      G.set(i,{x:x0,y:y0,scale:Math.min(1.4,a.width/52),opacity:0});
      G.timeline({onComplete(){i.remove();}})
        .to(i,{opacity:1,duration:.1})
        .to(i,{x:x1,y:y1,scale:.42,rotation:10,duration:.55,ease:'power2.inOut'},0)
        .to(i,{opacity:0,duration:.12},'-=.12')
        .to(to,{scale:1.05,duration:.13},'-=.1')
        .to(to,{scale:1,duration:.3,ease:'back.out(2.2)'});},
    /* ---------------------------------------------------- added to cart
       The count is written directly and is correct before any of this runs.
       What this adds is the moment: the button takes the hit, a ring leaves
       it, and the number swaps on a short rise so you see it tick rather
       than discovering it later. */
    added(btn,badge){
      const G=g(); if(!G||!btn) return;
      const ring=btn.querySelector('.ring');
      G.timeline()
        .to(btn,{scale:.88,duration:.1,ease:'power2.in'})
        .to(btn,{scale:1,duration:.5,ease:'elastic.out(1,0.45)'});
      if(ring) G.fromTo(ring,{scale:.7,opacity:.85},
        {scale:1.9,opacity:0,duration:.62,ease:'power2.out'});
      if(badge) G.timeline()
        .fromTo(badge,{y:-9,opacity:0,scale:.6},
          {y:0,opacity:1,scale:1,duration:.34,ease:'back.out(2.4)'});
    },
    grow(card){const G=g();if(!G)return;
      const h0=card.offsetHeight;
      requestAnimationFrame(()=>{const h1=card.offsetHeight;
        G.fromTo(card,{height:h0},{height:h1,duration:.38,ease:'power3.out',clearProps:'height'});});},
    kill(el,done){const G=g();
      if(!G){el.remove();done&&done();return;}
      G.to(el,{opacity:0,height:0,paddingTop:0,paddingBottom:0,duration:.26,
        ease:'power2.in',onComplete(){el.remove();done&&done();}});},
    idle(m){const G=g();if(!G||!m)return;
      if(m._t)m._t.kill();
      m._t=G.to(m,{scale:1.04,duration:2.2,repeat:-1,yoyo:true,ease:'sine.inOut'});},
    busy(m){const G=g();if(!G||!m)return;
      if(m._t)m._t.kill();
      m._t=G.to(m,{scale:1.1,duration:.6,repeat:-1,yoyo:true,ease:'sine.inOut'});},
    hit(m){const G=g();if(!G||!m)return;
      G.timeline().to(m,{scale:1.15,duration:.14})
        .to(m,{scale:1,duration:.4,ease:'back.out(2.4)'}).add(()=>M.idle(m));},
    dots(el){const G=g();if(!G||!el)return;
      G.to(el.querySelectorAll('i'),{y:-4,duration:.42,
        stagger:{each:.12,repeat:-1,yoyo:true},ease:'sine.inOut'});},
    toast(el){const G=g();
      if(!G){el.style.opacity=1;setTimeout(()=>{el.style.opacity=0;},1600);return;}
      G.killTweensOf(el);
      G.timeline().fromTo(el,{opacity:0,y:12},{opacity:1,y:0,duration:.28,ease:'power3.out'})
        .to(el,{opacity:0,y:8,duration:.26,delay:1.5});},
    spin(el){const G=g();if(!G)return;
      G.fromTo(el,{rotate:-90,scale:.75},{rotate:0,scale:1,duration:.45,ease:'back.out(1.8)'});},
  };
})();

/* ========================================================================== */
/* HELPERS                                                                     */
/* ========================================================================== */

/* 9974596174 -> "99745 96174". Grouped so a wrong digit is findable. */
function fmtTel(d){
  d=String(d||'').replace(/\D/g,'').slice(0,10);
  return d.length>5 ? d.slice(0,5)+' '+d.slice(5) : d;
}

/* exported for the other modules */
window.M=M;
