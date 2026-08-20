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
    bar(el,inn){const G=g();if(!G)return;
      if(inn) G.fromTo(el,{y:44,opacity:0},{y:0,opacity:1,duration:.42,ease:'power3.out',clearProps:'transform'});
      else G.to(el,{y:44,opacity:0,duration:.22});},
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
