/* Petpooja AI — the app
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

const UI=(function(){
  let th,cp,inp,snd,cartBtn,pill,mark,tst;
  let bottom=true,busy=false,payM='upi',cat='All',sug={},tapped=null,lastSug=null,focused=null;
  const drafts={};                 // widget id -> working config
  const now=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const $=s=>document.querySelector(s);
  let seq=0;
  const uid=p=>p+(++seq)+'x'+Date.now().toString(36);

  /* ------------------------------------------------------------------ boot */
  function init(){
    th=$('#th');cp=$('#cp');inp=$('#inp');snd=$('#send');cartBtn=$('#cartBtn');
    /* The cart badge lives on the composer button now. The header icon,
       the composer button and the review strip were three doors to the
       same room on one screen; the composer one is the only one your
       thumb can reach without moving. */
    pill=$('#cartN');mark=$('#mark');tst=$('#tst');

    theme();
    inp.addEventListener('focus',()=>{cp.classList.add('on');ph.stop();M.composer(cp,true);});
    /* Only fold back up if there's nothing to lose. Collapsing under a
       half-typed message would move the controls out from under the thumb
       mid-sentence. */
    inp.addEventListener('blur',()=>{cp.classList.remove('on');
      if(!inp.value.trim()&&!rec){ ph.start(); M.composer(cp,false); }});
    inp.addEventListener('input',()=>{
      inp.style.height='auto';
      inp.style.height=Math.min(inp.scrollHeight,80)+'px';
      snd.disabled=!inp.value.trim();
      ph.toggle(!inp.value);
    });
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go();}});
    snd.addEventListener('click',()=>{M.tap(snd,.9);go();});
    $('#mic').addEventListener('click',voice);
    th.addEventListener('scroll',()=>{
      bottom=th.scrollHeight-th.scrollTop-th.clientHeight<80;
    },{passive:true});

    bind();
    M.idle(mark);
    Cart.sub(onCart);

    Chats.make();
    document.getElementById('ttl').addEventListener('click',()=>{
      M.tap(document.getElementById('ttl'),.96);
      document.getElementById('isl').classList.contains('on')?islandClose():islandOpen();
    });
    document.getElementById('islScrim').addEventListener('click',islandClose);
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&document.getElementById('isl').classList.contains('on')) islandClose();
    });
    syncTitle();
    welcome();
    ph.start();
  }

  /* The switcher was a title with a chevron, which reads as decoration. It's
     a control now: a bordered pill carrying the count, so the number of chats
     is visible before you tap rather than after. When a second chat appears
     the pill nudges once — the only moment the affordance is worth pointing
     at is the moment it starts being useful. */
  function syncTitle(){
    const c=Chats.cur(), n=Chats.list().length, nOther=n-1;
    document.getElementById('ttlName').textContent=c?c.title:'Petpooja AI';
    const badge=document.getElementById('ttlCount'), ttl=document.getElementById('ttl');
    badge.textContent=n;
    ttl.classList.toggle('ttl--many',n>1);
    ttl.setAttribute('aria-label',n>1?('Switch chat — '+n+' chats'):'Your chats');
    document.getElementById('ttlSub').textContent=
      nOther>0?(nOther+' other chat'+(nOther===1?'':'s')+' · tap to switch'):'Your virtual captain';
    if(n>1&&n!==lastChatN){ M.nudge(ttl); }
    lastChatN=n;
  }
  let lastChatN=0;

  /* Swap the whole conversation: freeze the current one, restore the target
     one's thread HTML and its cart. The scrollback comes back exactly as it
     was rather than being replayed. */
  function switchChat(id){
    if(id===Chats.activeId()){islandClose();return;}
    Chats.save(th);
    const c=Chats.get(id); if(!c) return;
    Chats.setActive(id);

    const G=M.g();
    const paint=()=>{
      th.innerHTML=c.html||'';
      Cart.clear();
      (c.lines||[]).forEach(l=>Cart.add(l,l.q));
      if(c.ful&&c.ful.mode) Cart.setFul(c.ful);
      if(!c.html) welcome(); else setChips(AI.chips());
      AI.reset();
      syncTitle();
      end(true);
    };
    /* The old version fired the panel close and the thread swap at the same
       instant, so two things moved past each other and the whole switch read
       as a stutter. It's one timeline now: the panel gets out of the way
       first, the outgoing thread settles back and dissolves rather than
       sliding, and the incoming one rises into place. Slightly longer overall
       and it feels much faster, because nothing is competing. */
    islandClose();
    if(!G){ paint(); return; }
    G.killTweensOf(th);
    G.timeline()
      .to(th,{opacity:0,y:-6,scale:.985,filter:'blur(3px)',
              duration:.26,ease:'power2.in'},.06)
      .add(paint)
      .fromTo(th,{opacity:0,y:14,scale:.99,filter:'blur(4px)'},
                 {opacity:1,y:0,scale:1,filter:'blur(0px)',
                  duration:.46,ease:'power3.out',clearProps:'filter,transform'});
  }

  function newChat(){
    Chats.save(th);
    Chats.make();
    Cart.clear();AI.reset();sug={};lastSug=null;
    const G=M.g();
    const paint=()=>{th.innerHTML='';welcome();syncTitle();
      if(G) G.fromTo(th,{opacity:0,y:10},{opacity:1,y:0,duration:.36,ease:'power3.out'});};
    islandClose();
    if(G) G.to(th,{opacity:0,y:-8,duration:.2,ease:'power2.in',onComplete:paint});
    else paint();
  }

  function theme(){
    let sv=null;try{sv=localStorage.getItem('pp-theme');}catch(e){}
    set(sv||'dark',0);
    $('#theme').addEventListener('click',()=>set(document.documentElement.dataset.theme==='dark'?'light':'dark',1));
    function set(t,an){
      document.documentElement.dataset.theme=t;
      try{localStorage.setItem('pp-theme',t);}catch(e){}
      const b=$('#theme');
      b.innerHTML=t==='dark'?IC.sun:IC.moon;
      b.setAttribute('aria-label',t==='dark'?'Switch to light':'Switch to dark');
      const m=document.querySelector('meta[name="theme-color"]');
      if(m) m.content=t==='dark'?'#08090B':'#FAF7F3';
      if(an) M.spin(b);
    }
  }

  function go(){
    const v=inp.value.trim();
    if(!v||busy) return;
    inp.value='';inp.style.height='auto';snd.disabled=true;
    inp.blur();
    if(cp.classList.contains('open')) M.composer(cp,false);
    ph.start();
    send(v);
  }
  function end(force){
    if(!bottom&&!force) return;
    requestAnimationFrame(()=>{th.scrollTop=th.scrollHeight;});
  }

  /* ------------------------------------------------- composer prompt ideas
     "Ask anything about menu…" told you the field existed and nothing else.
     Rotating real prompts teaches the grammar the parser understands —
     quantities, dish names, constraints — by showing one at a time.

     It stops the moment you focus or type: an animation under a caret is a
     distraction, not a hint. And because it's a plain DOM element rather
     than the placeholder attribute, it can move. */
  const ph = (()=>{
    const box=document.getElementById('ph'), line=box.querySelector('span');
    let i=0, t=null, on=false;
    line.textContent=PROMPTS[0];
    /* Clearing the interval was never enough. A rotation is a 0.6s timeline,
       so stopping mid-flight left the line parked at y:-16 or opacity:0 —
       and the fade-out then ran on top of a half-finished slide, which is
       the flicker you get on focus. Kill the tween AND reset the line, so
       every stop lands the same way. */
    function reset(){
      const G=M.g();
      if(G){ G.killTweensOf(line); G.set(line,{y:0,opacity:1,clearProps:'transform'}); }
      else { line.style.transform=''; line.style.opacity=''; }
    }
    function step(){
      i=(i+1)%PROMPTS.length;
      const G=M.g();
      if(!G){ line.textContent=PROMPTS[i]; return; }
      G.timeline()
        .to(line,{y:-16,opacity:0,duration:.26,ease:'power2.in'})
        .add(()=>{line.textContent=PROMPTS[i];})
        .fromTo(line,{y:16,opacity:0},{y:0,opacity:1,duration:.36,ease:'power3.out'});
    }
    return {
      start(){ if(on)return; on=true; reset(); box.classList.remove('off'); t=setInterval(step,2600); },
      stop(){ on=false; if(t){clearInterval(t);t=null;} box.classList.add('off'); reset(); },
      /* Never restarts while the caret is in the field — deleting your text
         used to bring the carousel back underneath it. */
      toggle(show){ if(!show){ this.stop(); return; }
        if(document.activeElement!==inp) this.start(); },
      /* Voice mode borrows the same line rather than fighting it. */
      say(txt){ this.stop(); box.classList.remove('off'); line.textContent=txt; reset(); },
    };
  })();

  /* ======================================================================
     THE OPENING SCREEN

     It used to be: greeting, then eight chips. Eight chips is a menu of
     things you may ask, which puts the work back on you before you've even
     said hello — and it makes the assistant look like a search box wearing
     a face.

     The order is now: a short hello, ONE recommendation the captain has
     already made, four ways to describe a mood, and the composer. The
     screen's first claim is "I've found you something", not "here is what
     I can do". Everything below the greeting is still the assistant
     talking; it just gets to the food in one screen instead of two.
     ====================================================================== */

  /* --------------------------------------------------------- hero combo */
  function heroCard(c){
    return '<section class="hero" data-id="'+c.id+'">'+
      '<span class="hero__glow" aria-hidden="true"></span>'+
      '<header class="hero__k">'+IC.spark+'<span>Captain\u2019s combo</span></header>'+
      '<button class="hero__tap" data-a="combodetail" data-id="'+c.id+'" '+
        'aria-label="See what\u2019s in this combo">'+
        '<span class="hero__im"><img '+Menu.img(c.hero)+'></span>'+
        '<span class="hero__b">'+
          '<span class="hero__n">'+esc(c.n)+'</span>'+
          '<span class="hero__l">'+c.lines.map(l=>
            esc(l.it.n)+(l.q>1?' \u00d7'+l.q:'')).join('<i>+</i>')+'</span>'+
          '<span class="hero__m">'+
            '<span class="st">'+IC.star+' '+c.r+'</span>'+
            '<span class="dot"></span><span>'+c.n_items+' items</span>'+
            '<span class="dot"></span><span class="hero__sv">save '+R$(c.off)+'</span>'+
          '</span>'+
          '<span class="hero__w">'+esc(c.why)+'</span>'+
        '</span>'+
      '</button>'+
      '<footer class="hero__f">'+
        '<span class="hero__p"><span class="pr">'+R$(c.now)+'</span><s>'+R$(c.was)+'</s></span>'+
        '<button class="b b--p" data-a="addcombo" data-id="'+c.id+'">'+
          'Add combo \u00b7 '+R$(c.now)+'</button>'+
      '</footer></section>';
  }

  /* ---------------------------------------------------------- mood cards */
  let moodSet='open';
  function moodRow(which){
    moodSet=which||moodSet;
    const list=MOODS[moodSet]||MOODS.open;
    return '<div class="mood" data-set="'+moodSet+'">'+
      '<div class="mood__h">'+(moodSet==='open'?'What are you in the mood for?'
        :moodSet==='mood'?'Want me to push it further?'
        :'Anything else with that?')+'</div>'+
      '<div class="mood__g">'+list.map(m=>
        '<button class="mc mc--'+m[3]+'" data-a="mood" data-say="'+esc(m[2])+'">'+
          '<span class="mc__i" aria-hidden="true">'+m[0]+'</span>'+
          '<span class="mc__t">'+esc(m[1])+'</span></button>').join('')+
      '</div></div>';
  }
  /* Swap the set in place while you're still on the opening screen — after
     an add, "craving spicy" is the wrong question and "add a drink" is the
     right one. */
  function setMood(which){
    const el=th.querySelector('.mood'); if(!el) return;
    const G=M.g();
    const paint=()=>{
      el.outerHTML=moodRow(which);
      const n=th.querySelector('.mood');
      if(G&&n) G.from(n.querySelectorAll('.mc'),
        {y:10,opacity:0,duration:.3,stagger:.04,ease:'power3.out',clearProps:'transform'});
    };
    if(!G){ paint(); return; }
    G.to(el,{opacity:0,y:-6,duration:.18,ease:'power2.in',onComplete:paint});
  }

  function welcome(){
    const c=Menu.captain();
    const el=document.createElement('div');
    el.className='wel';
    el.innerHTML=
      '<div class="m m--ai wel__hi">'+
        '<div class="mark mark--sm">'+IC.spark+'</div>'+
        '<div class="say">'+
          '<em class="hi">Vanakkam!</em> <span class="wel__q">What are you craving?</span>'+
        '</div>'+
      '</div>'+
      (c?heroCard(c):'')+
      moodRow('open');
    th.appendChild(el);

    const G=M.g();
    if(G){
      const hero=el.querySelector('.hero');
      G.from(el.querySelector('.wel__hi'),{y:10,opacity:0,duration:.4,ease:'power3.out'});
      if(hero) G.from(hero,{y:18,opacity:0,scale:.985,duration:.52,
        ease:'power3.out',delay:.1,clearProps:'transform'});
      G.from(el.querySelectorAll('.mc'),
        {y:14,opacity:0,duration:.38,stagger:.05,ease:'power3.out',delay:.26,clearProps:'transform'});
      M.aiEdge(hero);
    }
    /* No chip shelf here — the combo and the moods ARE the suggestions. */
    setChips([]);
  }

  function userBub(text){
    const w=th.querySelector('.wel'); if(w) w.remove();
    const el=document.createElement('div');
    el.className='m m--u';
    el.innerHTML='<div class="bub bub--u">'+esc(text)+'<div class="t">'+now()+'</div></div>';
    th.appendChild(el);bottom=true;return el;
  }
  /* The assistant doesn't speak in a bubble any more. A bubble is a container
     for one side of a two-sided exchange — it earns its keep on the message
     YOU sent, which is short and needs to be visually claimed. The reply is
     often a paragraph, a list, or the label on a widget, and boxing all of
     that just adds an edge inside an edge.

     Mark on its own line, answer underneath, full width. It also dissolves
     the alignment problem: the reply now starts at the same left edge as
     every card and widget, so there's one column instead of two. */
  function aiBub(h){
    const el=document.createElement('div');
    el.className='m m--ai';
    el.innerHTML='<div class="mark mark--sm">'+IC.spark+'</div><div class="say">'+h+'</div>';
    th.appendChild(el);return el;
  }
  let thinkStop=null;
  function thinking(on){
    const ex=document.getElementById('thk');
    if(!on){
      M.mesh(false);
      if(thinkStop){thinkStop();thinkStop=null;}
      if(ex){
        const G=M.g();
        if(G) G.to(ex,{opacity:0,y:-8,duration:.22,ease:'power2.in',onComplete:()=>ex.remove()});
        else ex.remove();
      }
      M.idle(mark);return;
    }
    if(ex) return;
    M.busy(mark);
    M.mesh(true);
    const el=thinkPanel();
    /* Fill the screen from the last thing said down to the composer, rather
       than sitting in a fixed 172px slot. Measured, not guessed: the thread's
       own client height minus whatever the previous message occupies, so the
       line you just typed stays visible at the top and the mesh owns
       everything under it. Capped at 45% so a long AI answer can't squeeze
       the panel to nothing. */
    const prev=th.lastElementChild;
    const prevH=prev?prev.getBoundingClientRect().height:0;
    const h=Math.max(220, th.clientHeight - Math.min(prevH, th.clientHeight*.45) - 22);
    el.style.setProperty('--thk-h', h+'px');
    th.appendChild(el);
    thinkStop=thinkPlay(el);
    end(true);
  }

  /* ---------------------------------------------------------------- cards */
  function card(it,pick){
    const tg=[];
    if(pick) tg.push('<span class="tag tag--ai">'+IC.spark+' AI pick</span>');
    else if(it.best) tg.push('<span class="tag">Bestseller</span>');
    if(it.sp>=3) tg.push('<span class="tag tag--sp">Spicy</span>');
    const serves = it.p>=150?'Serves 2':'Serves 1';
    /* Customize is gone from the card. Two buttons of near-equal weight made
       you pick a route before you'd picked a dish, and the second one did
       nothing Add couldn't — adding a customisable item already opens the
       options widget. One action now, with a line under it saying what the
       tap will actually do, so nothing is hidden by removing the button. */
    const nOpt = (it.g||[]).length + (Menu.rmFor(it).length?1:0);
    const hint = nOpt ? (nOpt===1?'1 choice to make':nOpt+' choices to make') : '';
    return '<article class="fc" data-id="'+it.id+'">'+
      '<div class="fc__im"><img '+Menu.img(it)+'><div class="fc__tag">'+tg.join('')+'</div></div>'+
      '<div class="fc__b">'+
        '<h3 class="fc__n">'+esc(it.n)+'</h3>'+
        '<div class="fc__m">'+
          '<span class="st">'+IC.star+' '+it.r+'</span>'+
          '<span>('+it.rc+')</span><span class="dot"></span>'+
          '<span class="dt"><span class="veg'+(it.veg?'':' veg--n')+'" role="img" aria-label="'+
            (it.veg?'Vegetarian':'Non-vegetarian')+'"></span>'+(it.veg?'Veg':'Non-veg')+'</span>'+
        '</div>'+
        '<p class="fc__d">'+esc(it.d)+'</p>'+
        '<div class="fc__f">'+
          '<span class="fc__p"><span class="pr">'+R$(it.p)+'</span><small>'+serves+'</small></span>'+
          (it.out
            ? '<span class="off" style="margin-left:auto">Off today</span>'
            : '<span class="fc__cta">'+
                '<button class="b b--p" data-a="add" data-id="'+it.id+'"'+
                  (nOpt?' data-opts="1"':'')+'>Add '+R$(it.p)+'</button>'+
                (hint?'<small>'+hint+'</small>':'')+
              '</span>')+
        '</div>'+
      '</div></article>';
  }

  function rail(items){
    const w=document.createElement('div');
    w.className='rail';
    w.innerHTML=items.map((it,i)=>card(it,i===0)).join('');
    th.appendChild(w);
    M.cards([].slice.call(w.querySelectorAll('.fc')));
    return w;
  }
  /* ------------------------------------------------------------ combo card
     Bundles are the one place a card should show its working. You're being
     asked to accept somebody else's choice of four dishes, so the card lists
     every one of them with its quantity, shows the sum it's discounting
     against, and puts the saving where you'd look for the catch. One tap
     adds the lot. */
  function comboCard(c){
    return '<article class="cb" data-id="'+c.id+'">'+
      '<div class="cb__h">'+
        '<span class="cb__k">'+esc(c.k)+'</span>'+
        '<span class="cb__sv">Save '+R$(c.off)+'</span>'+
      '</div>'+
      '<h3 class="cb__n">'+esc(c.n)+'</h3>'+
      '<p class="cb__d">'+esc(c.d)+'</p>'+
      '<div class="cb__l">'+c.lines.map(l=>
        '<div class="cb__i">'+
          '<img '+Menu.img(l.it)+'>'+
          '<span class="cb__in"><span class="veg'+(l.it.veg?'':' veg--n')+'"></span>'+
            esc(l.it.n)+'</span>'+
          '<span class="cb__iq">'+(l.q>1?'\u00d7'+l.q:'')+'</span>'+
        '</div>').join('')+
      '</div>'+
      '<div class="cb__f">'+
        '<span class="cb__p"><span class="pr">'+R$(c.now)+'</span>'+
          '<s>'+R$(c.was)+'</s></span>'+
        '<button class="b b--p" data-a="addcombo" data-id="'+c.id+'">'+
          'Add all '+c.n_items+'</button>'+
      '</div></article>';
  }
  function comboSet(ids){
    const cs=ids.map(Menu.combo).filter(Boolean);
    if(!cs.length) return null;
    const w=document.createElement('div');
    w.className='cbs';
    w.innerHTML=cs.map(comboCard).join('');
    th.appendChild(w);
    M.cards([].slice.call(w.querySelectorAll('.cb')));
    return w;
  }

  function addonRail(items){
    /* Replace the previous suggestion instead of stacking another
       "Goes well with that." every time something is added. */
    if(lastSug){
      if(lastSug.el&&lastSug.el.parentNode) lastSug.el.remove();
      if(lastSug.msg&&lastSug.msg.parentNode) lastSug.msg.remove();
    }
    const msg=aiBub('Goes well with that.');M.in(msg,1);
    /* One contained widget of rows rather than a rail of loose mini-cards:
       a two-item list doesn't need a swipe gesture, and three bordered
       surfaces side by side is three times the chrome for the same content. */
    const w=document.createElement('div');
    w.className='w w--sug';
    w.innerHTML=
      '<div class="w__h"><h4>Goes well with this</h4>'+
        '<span class="n">'+items.length+'</span></div>'+
      '<div class="w__b">'+items.map(it=>
        '<button class="sg" data-a="add" data-id="'+it.id+'" '+
          'aria-label="Add '+esc(it.n)+', '+R$(it.p)+'">'+
          '<img '+Menu.img(it)+'>'+
          '<span class="sg__b">'+
            '<span class="sg__n">'+esc(it.n)+'</span>'+
            '<span class="sg__d">'+esc(it.d)+'</span></span>'+
          '<span class="sg__p">'+R$(it.p)+'</span>'+
          '<span class="sg__x">'+IC.plus+'</span></button>').join('')+
      '</div>';
    th.appendChild(w);
    M.cards([].slice.call(w.querySelectorAll('.sg')));
    lastSug={el:w,msg};
    return w;
  }

  /* ------------------------------------------------------ widget scaffold */
  function widget(id,opts){
    const el=document.createElement('div');
    el.className='w'+(opts.hot?' w--hot':'');
    el.id=id;
    el.innerHTML=
      '<div class="w__h"><h4>'+esc(opts.label)+'</h4>'+(opts.count?'<span class="n">'+esc(opts.count)+'</span>':'')+'</div>'+
      '<div class="w__b">'+opts.body+'</div>'+
      (opts.foot?'<div class="w__f">'+opts.foot+'</div>':'')+
      '<div class="w__d">'+IC.ok+'<span class="k">'+esc(opts.label)+'</span><b data-v></b>'+
      (opts.redo?'<button class="go" data-a="'+opts.redo+'" data-w="'+id+'">Change</button>':'')+'</div>';
    th.appendChild(el);
    M.in(el,1);
    if(opts.focus) setTimeout(()=>focusOn(id),120);
    return el;
  }
  function collapse(id,summary){
    const el=document.getElementById(id);if(!el) return;
    const b=el.querySelector('[data-v]');if(b) b.textContent=summary;
    el.classList.add('done');       // correct state first
    M.grow(el);                     // then the height tween
    if(focused===id) focusOff();
  }

  /* =================================================================== */
  /* WIDGET · dish options                                               */
  /* =================================================================== */
  function wOptions(cfg,sig){
    const id=uid('opt');
    drafts[id]={cfg:JSON.parse(JSON.stringify(cfg)),sig:sig||null};
    const d=drafts[id].cfg, it=Menu.item(d.id);

    const groups=it.g.map(gid=>{
      const g=G[gid];if(!g) return '';
      const hd='<div class="row" style="margin-bottom:8px"><span class="g" style="font-size:11px;'+
        'letter-spacing:.06em;text-transform:uppercase;font-weight:600">'+esc(g.n)+'</span>'+
        (g.req?'<b style="font-size:11px;color:var(--brand)">Required</b>':'<b style="font-size:11px;color:var(--text-3);font-weight:400">Optional</b>')+'</div>';
      if(g.t==='m'){
        const pk=d.sel[gid]||[];
        return '<div style="margin-bottom:16px">'+hd+g.o.map(o=>
          '<button class="cr" aria-pressed="'+(pk.indexOf(o.id)>=0)+'" data-a="wmul" data-w="'+id+'" data-g="'+gid+'" data-o="'+o.id+'">'+
          '<span class="bx">'+IC.ok+'</span><span class="cr__n">'+esc(o.n)+'</span>'+
          '<span class="cr__p">'+(o.d?'+'+R$(o.d):'Free')+'</span></button>').join('')+'</div>';
      }
      return '<div style="margin-bottom:16px">'+hd+'<div class="opts">'+g.o.map(o=>
        '<button class="ob" aria-pressed="'+(d.sel[gid]===o.id)+'" data-a="wone" data-w="'+id+'" data-g="'+gid+'" data-o="'+o.id+'">'+
        '<span>'+esc(o.n)+(o.d?' +'+R$(o.d):'')+'</span>'+(o.m?'<small>'+esc(o.m)+'</small>':'')+
        '</button>').join('')+'</div></div>';
    }).join('');

    const rmList=Menu.rmFor(it);
    const rmBlock=rmList.length?
      '<div class="row" style="margin-bottom:8px"><span class="g" style="font-size:11px;letter-spacing:.06em;'+
      'text-transform:uppercase;font-weight:600">Leave out</span></div>'+
      '<div class="opts">'+rmList.map(r=>
        '<button class="ob" aria-pressed="'+(d.rm.indexOf(r)>=0)+'" data-a="wrm" data-w="'+id+'" data-r="'+esc(r)+'">'+
        '<span>No '+esc(r)+'</span></button>').join('')+'</div>':'';

    widget(id,{
      label:it.n, count:R$(it.p)+' base', hot:1, focus:1,
      body:'<div class="bt__t" style="margin-bottom:14px"><img '+Menu.img(it)+
        '><div style="flex:1;min-width:0"><div class="bt__n">'+esc(it.n)+'</div>'+
        '<p class="fc__d" style="margin-top:4px">'+esc(it.d)+'</p></div></div>'+groups+rmBlock,
      foot:'<span class="pr" data-price>'+R$(Menu.price(d))+'</span>'+
        '<button class="b b--p" data-a="wsave" data-w="'+id+'">'+
        (sig?'Update order':'Add to order')+'</button>',
      redo:'wreopen',
    });
    end();
  }
  function reprice(id){
    const el=document.getElementById(id);if(!el) return;
    const p=el.querySelector('[data-price]');
    if(p) p.textContent=R$(Menu.price(drafts[id].cfg));
  }

  /* =================================================================== */
  /* WIDGET · order review                                               */
  /* =================================================================== */
  function wOrder(){
    const s=Cart.snap();
    if(!s.lines.length){
      M.in(aiBub('Your order is empty.<span class="sub">Tell me what you fancy.</span>'),1);
      setChips(AI.chips());end();return;
    }
    const id=uid('ord');
    const lines=s.lines.map(l=>
      '<div class="ln" data-sig="'+esc(l.sig)+'"><img '+Menu.img(l.it)+'>'+
      '<div class="ln__b"><div class="ln__n">'+esc(l.it.n)+'</div>'+
      (l.spec.length?'<div class="ln__c">'+esc(l.spec.join(' · '))+'</div>':'')+
      (l.cfg.rm.length?'<div class="ln__x">No '+esc(l.cfg.rm.join(', '))+'</div>':'')+
      '<div class="ln__f"><div class="stp">'+
      '<button data-a="wq" data-w="'+id+'" data-sig="'+esc(l.sig)+'" data-d="-1" aria-label="One fewer">'+IC.minus+'</button>'+
      '<span>'+l.q+'</span>'+
      '<button data-a="wq" data-w="'+id+'" data-sig="'+esc(l.sig)+'" data-d="1" aria-label="One more">'+IC.plus+'</button></div>'+
      '<button class="lk" data-a="wed" data-sig="'+esc(l.sig)+'">Edit</button>'+
      '<button class="lk lk--x" data-a="wdel" data-w="'+id+'" data-sig="'+esc(l.sig)+'">Remove</button>'+
      '<span class="ln__p">'+R$(l.total)+'</span></div></div></div>').join('');

    widget(id,{
      label:'Your order', count:s.t.n+' item'+(s.t.n===1?'':'s'),
      /* Notes live here as well as on the details form. This is the screen
         where you're actually looking at the food, which is when "no onion"
         occurs to you — not three steps later next to your phone number. */
      body:lines+notesTrigger()+'<div class="rule"></div>'+billRows(s.t),
      foot:'<span class="pr">'+R$(s.t.total)+'</span>'+
        '<button class="b b--p" data-a="wnext" data-w="'+id+'">'+(s.ready?'Confirm':'Continue')+'</button>',
    });
    end();
  }
  function billRows(t){
    let h='<div class="row"><span class="g">Item total</span><b>'+R$(t.sub)+'</b></div>';
    if(t.pack) h+='<div class="row"><span class="g">Packaging</span><b>'+R$(t.pack)+'</b></div>';
    if(t.mode==='delivery') h+='<div class="row"><span class="g">Delivery</span><b>'+(t.free?'FREE':R$(t.ship))+'</b></div>';
    h+='<div class="row"><span class="g">Taxes (5%)</span><b>'+R$(t.tax)+'</b></div>';
    h+='<div class="rule"></div><div class="tot"><span>Total</span><b>'+R$(t.total)+'</b></div>';
    if(t.mode==='dinein') h+='<div class="note">No packaging charge on dine-in.</div>';
    if(t.mode==='delivery'&&!t.free&&t.toFree>0) h+='<div class="note">'+R$(t.toFree)+' more for free delivery.</div>';
    return h;
  }

  /* =================================================================== */
  /* WIDGET · your details                                               */
  /* =================================================================== */
  /* Pantheon Text Input. The <fieldset>/<legend> is not decoration: the
     legend is what physically breaks the top border, so the notch is laid
     out by the browser and stays correct over any fill behind it. It's
     aria-hidden so the wrapping <label> is the single accessible name. */
  const field=(cls,attr,control,lab,extra)=>
    '<div class="fl '+cls+'"'+attr+'>'+
      '<label class="fl__box">'+control+
        '<span class="fl__lab">'+lab+'</span>'+
        '<fieldset class="fl__ol" aria-hidden="true"><legend><span>'+lab+'</span></legend></fieldset>'+
        (extra||'')+
      '</label></div>';

  /* ------------------------------------------------------- special notes
     An empty textarea labelled "anything for the kitchen?" gets left empty,
     because writing a note is work and you don't know what's allowed. The
     eight things people actually ask for are one tap each; the field below
     is still there for the ninth.

     Both halves write to one string, so the kitchen gets one instruction
     and the order card and the details form can't disagree about it. */
  const NOTES=['Less spicy','Extra spicy','No onion','No garlic',
               'Jain — no root veg','Pack separately','Cutlery, please','Extra napkins'];
  const SEP=' \u00b7 ';

  function splitNotes(){
    const parts=String(Cart.getFul().notes||'').split(SEP).map(x=>x.trim()).filter(Boolean);
    return { picked:parts.filter(x=>NOTES.indexOf(x)>=0),
             free:parts.filter(x=>NOTES.indexOf(x)<0).join(SEP) };
  }
  /* In the order card the note is behind a button, not sitting open. The
     block is eight chips plus a field — a lot of chrome to leave standing
     for something most orders never use — and the card's job is the food and
     the total. Collapsed it's one line that also reads back what you set. */
  function notesTrigger(){
    const n=String(Cart.getFul().notes||'').trim();
    return '<button class="ntt'+(n?' ntt--on':'')+'" data-a="ntopen" '+
      'aria-haspopup="dialog" aria-expanded="false">'+
      IC.spark+'<span class="ntt__t">'+(n?esc(n):'Add a note for the kitchen')+'</span>'+
      '<span class="ntt__a">'+(n?'Edit':'Add')+'</span></button>';
  }
  function notesBlock(){
    const {picked,free}=splitNotes();
    return '<div class="nt" data-nt>'+
      '<div class="nt__h">Anything for the kitchen?</div>'+
      '<div class="nt__c">'+NOTES.map(n=>
        '<button class="nb" aria-pressed="'+(picked.indexOf(n)>=0)+'" '+
        'data-a="note" data-v="'+esc(n)+'">'+esc(n)+'</button>').join('')+'</div>'+
      field('','','<textarea rows="2" data-ff="ntfree" placeholder=" ">'+esc(free)+'</textarea>',
        'Something else? (optional)')+
    '</div>';
  }
  /* Every collapsed trigger on screen shows the current note. */
  function syncTriggers(){
    const n=String(Cart.getFul().notes||'').trim();
    document.querySelectorAll('.ntt').forEach(b=>{
      b.classList.toggle('ntt--on',!!n);
      b.querySelector('.ntt__t').textContent=n||'Add a note for the kitchen';
      b.querySelector('.ntt__a').textContent=n?'Edit':'Add';
    });
  }

  /* The native popover API puts this in the top layer, so the order widget's
     own overflow:hidden can't clip it, and Esc plus click-outside come free.
     Where it isn't supported we fall back to a class and a scrim. */
  /* A look inside the combo without leaving the screen. Deliberately the
     same top-layer popover the kitchen note uses, not a bottom sheet — the
     rule that everything happens in the chat still holds, and a sheet that
     covers the conversation is the thing that rule exists to prevent. */
  function comboPeek(c){
    const pop=document.getElementById('ntpop');
    document.getElementById('ntpopBody').innerHTML=
      '<div class="peek">'+
        '<div class="peek__h">'+IC.spark+'<span>'+esc(c.k)+'</span></div>'+
        '<h3 class="peek__n">'+esc(c.n)+'</h3>'+
        '<div class="peek__l">'+c.lines.map(l=>
          '<div class="peek__i"><img '+Menu.img(l.it)+'>'+
          '<span class="peek__in"><span class="veg'+(l.it.veg?'':' veg--n')+'"></span>'+
          esc(l.it.n)+'</span>'+
          '<span class="peek__q">'+(l.q>1?'\u00d7'+l.q:'')+'</span>'+
          '<span class="peek__p">'+R$(l.sub)+'</span></div>').join('')+
        '</div>'+
        '<div class="peek__f"><span>Set price</span>'+
          '<b>'+R$(c.now)+'</b><s>'+R$(c.was)+'</s></div>'+
      '</div>';
    document.querySelector('.ntp__f').innerHTML=
      '<button class="b b--p b--bl" data-a="addcombo" data-id="'+c.id+'">'+
        'Add combo \u00b7 '+R$(c.now)+'</button>';
    noteFrom=null;
    if(typeof pop.showPopover==='function'){ try{ pop.showPopover(); }catch(e){ pop.classList.add('on'); } }
    else pop.classList.add('on');
    const G=M.g();
    if(G){
      G.fromTo(pop,{y:14,opacity:0},{y:0,opacity:1,duration:.3,ease:'power3.out'});
      G.from(pop.querySelectorAll('.peek__i'),{y:8,opacity:0,duration:.26,stagger:.04});
    }
  }

  let noteFrom=null;
  function noteOpen(btn){
    const pop=document.getElementById('ntpop');
    document.getElementById('ntpopBody').innerHTML=notesBlock();
    /* The combo peek borrows this popover and swaps the footer for its own
       Add button, so put Done back rather than inheriting whatever the last
       caller left behind. */
    document.querySelector('.ntp__f').innerHTML=
      '<button class="b b--p b--bl" data-a="ntdone">Done</button>';
    noteFrom=btn||null;
    if(btn) btn.setAttribute('aria-expanded','true');
    if(typeof pop.showPopover==='function'){ try{ pop.showPopover(); }catch(e){ pop.classList.add('on'); } }
    else pop.classList.add('on');
    const G=M.g();
    if(G){
      G.fromTo(pop,{y:14,opacity:0},{y:0,opacity:1,duration:.3,ease:'power3.out'});
      G.from(pop.querySelectorAll('.nb'),{y:8,opacity:0,duration:.26,stagger:.022,ease:'power2.out'});
    }
  }
  function noteClose(){
    const pop=document.getElementById('ntpop');
    if(typeof pop.hidePopover==='function'){ try{ pop.hidePopover(); }catch(e){} }
    pop.classList.remove('on');
    if(noteFrom){ noteFrom.setAttribute('aria-expanded','false'); noteFrom=null; }
    syncTriggers();
  }

  /* Read whichever block the user touched, write the single string. */
  function syncNotes(box){
    if(!box) return;
    const picks=[].slice.call(box.querySelectorAll('.nb[aria-pressed="true"]')).map(b=>b.dataset.v);
    const ta=box.querySelector('[data-ff="ntfree"]');
    const free=ta?ta.value.trim():'';
    Cart.setFul({notes:picks.concat(free?[free]:[]).join(SEP)});
    document.querySelectorAll('[data-nt]').forEach(o=>{if(o!==box) paintNotes(o);});
    syncTriggers();
  }
  /* Repaint a block from the stored string — used for the other open block,
     and after the order widget re-renders its body on a quantity change. */
  function paintNotes(box){
    if(!box) return;
    const {picked,free}=splitNotes();
    box.querySelectorAll('.nb').forEach(b=>
      b.setAttribute('aria-pressed',String(picked.indexOf(b.dataset.v)>=0)));
    const ta=box.querySelector('[data-ff="ntfree"]');
    if(ta&&document.activeElement!==ta) ta.value=free;
  }

  function wDetails(fields){
    const id=uid('det'), f=Cart.getFul();
    const SPEC={name:['Your name','text',''],phone:['Phone number','tel','10'],
                address:['Delivery address','text','']};

    const body=fields.map(k=>{
      if(k==='phone'){
        const d=String(f.phone||'').replace(/\D/g,'');
        return field('fl--tel'+(d.length===10?' done':''),' data-f="phone"',
          '<input type="tel" data-ff="phone" inputmode="numeric" autocomplete="tel-national" '+
            'maxlength="11" value="'+esc(fmtTel(d))+'" placeholder=" ">',
          'Phone number',
          '<span class="pre">+91</span>'+
          '<span class="cnt" data-cnt>'+d.length+'/10</span>'+
          '<span class="tick">'+IC.ok+'</span>');
      }
      return field('',' data-f="'+k+'"',
        '<input type="'+SPEC[k][1]+'" data-ff="'+k+'" value="'+esc(f[k]||'')+'" placeholder=" ">',
        SPEC[k][0]);
    }).join('')+notesBlock();

    widget(id,{
      label:'Your details', hot:1, focus:1,
      body:body+
        '<div class="w__hint">'+IC.lock+'Kept on this device for the prototype.</div>',
      foot:'<div class="w__save">'+
        '<button class="b b--p" data-a="wdet" data-w="'+id+'">Save and continue</button>'+
        '<button class="w__skip" data-a="wlater" data-w="'+id+'">Later</button></div>',
      redo:'wreopen',
    });
    end();
  }

  /* =================================================================== */
  /* WIDGET · payment                                                    */
  /* =================================================================== */
  /* A note you can't see on the confirm screen may as well not exist — you
     have no way to know it made it. This is where it gets read back. */
  function notesLine(){
    const n=String(Cart.getFul().notes||'').trim();
    return n?'<div class="ntl">'+IC.spark+'<span><b>For the kitchen</b>'+esc(n)+'</span></div>':'';
  }

  function wPay(){
    const s=Cart.snap(), f=s.ful, id=uid('pay');
    const m=R.modes.find(x=>x.id===f.mode);
    const who=[f.name,f.phone,f.address].filter(Boolean).join(' · ');

    const items=s.lines.map(l=>
      '<div class="row"><span class="g">'+esc(l.it.n)+(l.q>1?' ×'+l.q:'')+'</span><b>'+R$(l.total)+'</b></div>').join('');

    const methods=[['upi','UPI','GPay · PhonePe · Paytm'],
                   ['card','Card','Visa ending 4218'],
                   ['cod',f.mode==='dinein'?'Pay at the table':'Cash','Settle in person']]
      .map(p=>'<button class="cr" aria-pressed="'+(payM===p[0])+'" data-a="wpm" data-w="'+id+'" data-m="'+p[0]+'">'+
        '<span class="cr__b"><span class="cr__n">'+esc(p[1])+'</span><span class="cr__d">'+esc(p[2])+'</span></span>'+
        '<span class="rd"></span></button>').join('');

    widget(id,{
      label:'Confirm and pay', count:s.t.n+' item'+(s.t.n===1?'':'s'), hot:1,
      body:
        (m?'<button class="cr" data-a="wmode" data-w="'+id+'" style="margin-bottom:14px">'+
          '<span class="cr__i">'+MI[m.id]+'</span><span class="cr__b">'+
          '<span class="cr__n">'+esc(m.label)+'</span><span class="cr__d">'+esc(who||m.desc)+'</span></span>'+
          '<span class="lk">Change</span></button>':'')+
        items+notesLine()+'<div class="rule"></div>'+billRows(s.t)+
        '<div class="rule"></div>'+
        '<div class="row" style="margin-bottom:9px"><span class="g" style="font-size:11px;letter-spacing:.06em;'+
        'text-transform:uppercase;font-weight:600">Pay with</span></div>'+methods,
      foot:'<button class="b b--p b--bl" data-a="wgo" data-w="'+id+'"'+(s.ready?'':' disabled')+'>'+
        (s.ready?'Pay '+R$(s.t.total):'Add your details first')+'</button>',
    });
    end();
  }

  /* =================================================================== */
  /* WIDGET · paying → confirmation                                      */
  /* =================================================================== */
  function wPaying(wid){
    const el=document.getElementById(wid);if(!el) return;
    el.querySelector('.w__h h4').textContent='Processing';
    el.querySelector('.w__b').innerHTML=
      '<div class="ok" style="padding:18px 2px"><div class="mark mark--lg" id="po" style="margin:0 auto 14px">'+
      IC.spark+'</div><h3 id="pt" style="font-size:16px">Sending to the kitchen…</h3>'+
      '<p id="ps">Confirming payment</p></div>';
    el.querySelector('.w__f').remove();

    const G=M.g(),po=document.getElementById('po');
    if(G) G.to(po,{rotate:360,duration:1.4,repeat:-1,ease:'none'});
    end();

    setTimeout(()=>{
      const t=document.getElementById('pt'),s2=document.getElementById('ps');
      if(t) t.textContent='Payment received';
      if(s2) s2.textContent='The kitchen has your order';
      if(G) G.killTweensOf(po);
      setTimeout(()=>{
        const o=Cart.place(payM);
        window.order=o;
        collapse(wid,'Paid '+R$(o.t.total));
        wDone(o);
        Cart.clear();AI.reset();sug={};lastSug=null;
        setChips(['How long?','Track my order','Order again']);
      },650);
    },1250);
  }

  function wDone(o){
    const id=uid('done'), m=R.modes.find(x=>x.id===o.ful.mode);
    widget(id,{
      label:'Order placed',
      body:'<div class="ok"><div class="ok__r"><div>'+IC.ok+'</div></div>'+
        '<h3>You\'re all set</h3><p>'+esc(o.rest)+' is on it'+(m?' — '+esc(m.label.toLowerCase()):'')+'.</p>'+
        '<div class="ok__g">'+
        '<div><small>Order</small><b>#'+esc(o.id)+'</b></div>'+
        '<div><small>Ready in</small><b>'+o.eta.lo+'–'+o.eta.hi+' min</b></div>'+
        '<div><small>Paid</small><b>'+R$(o.t.total)+'</b></div></div>'+
        (o.ful&&o.ful.notes?'<div class="ntl ntl--ok">'+IC.spark+
          '<span><b>Kitchen has</b>'+esc(o.ful.notes)+'</span></div>':'')+'</div>',
      foot:'<button class="b b--p b--bl" data-a="wtrack">Track it</button>',
    });
    const G=M.g(),el=document.getElementById(id);
    if(G){
      G.from(el.querySelector('.ok__r'),{scale:.5,opacity:0,duration:.5,ease:'back.out(1.7)'});
      G.from(el.querySelectorAll('h3,p,.ok__g div'),{y:12,opacity:0,duration:.36,stagger:.06,delay:.14});
    }
    end();
  }

  /* =================================================================== */
  /* WIDGET · tracking                                                   */
  /* =================================================================== */
  function wTrack(o){
    o=o||window.order;if(!o) return;
    const id=uid('trk');
    widget(id,{
      label:'Order #'+o.id, count:o.eta.lo+'–'+o.eta.hi+' min',
      body:o.stages.map((s,i)=>
        '<div class="ts '+(s.d?'ts--d':s.a?'ts--a':'ts--p')+'"><div class="ts__r"><div class="td">'+IC.ok+'</div>'+
        (i<o.stages.length-1?'<div class="tl"></div>':'')+'</div>'+
        '<div class="ts__b"><div class="ts__n">'+esc(s.l)+'</div>'+
        '<div class="ts__d">'+(s.a?'Happening now':s.d?'Done':'Pending')+'</div></div></div>').join(''),
    });
    const G=M.g(),el=document.getElementById(id);
    if(G) G.from(el.querySelectorAll('.td'),{scale:0,duration:.36,stagger:.08,ease:'back.out(1.7)'});
    end();
  }

  /* =================================================================== */
  /* WIDGET · browse the menu                                            */
  /* =================================================================== */
  function wMenu(){
    const id=uid('menu');
    widget(id,{label:'Full menu',count:ITEMS.length+' dishes',body:menuBody(id)});
    end();
  }
  function menuBody(id){
    const cats=['All'];ITEMS.forEach(i=>{if(cats.indexOf(i.c)<0)cats.push(i.c);});
    return '<div class="cats">'+cats.map(c=>
      '<button class="chip" aria-pressed="'+(cat===c)+'" data-a="wcat" data-w="'+id+'" data-c="'+esc(c)+'">'+
      esc(c)+'</button>').join('')+'</div>'+
      ITEMS.filter(i=>cat==='All'||i.c===cat).map(it=>
      '<div class="mr"><img '+Menu.img(it)+'><div class="mr__b">'+
      '<div class="mr__n"><span class="veg'+(it.veg?'':' veg--n')+'"></span><span>'+esc(it.n)+'</span></div>'+
      '<div class="mr__p">'+R$(it.p)+'</div></div>'+
      (it.out?'<span class="off">Off today</span>'
             :'<button class="b b--p" data-a="add" data-id="'+it.id+'">Add</button>')+'</div>').join('');
  }

  /* ---------------------------------------------------------------- chips */
  /* Focus mode: while a widget is waiting on input, the chips are a second,
     conflicting way forward. Park them and dim everything else. */
  function focusOn(id){
    const el=document.getElementById(id); if(!el) return;
    th.querySelectorAll('.w--live').forEach(x=>x.classList.remove('w--live'));
    el.classList.add('w--live');
    th.classList.add('focusing');
    const cr=chipEl(); if(cr) cr.classList.add('hid');
    focused=id;
  }
  function focusOff(){
    th.classList.remove('focusing');
    th.querySelectorAll('.w--live').forEach(x=>x.classList.remove('w--live'));
    const cr=chipEl(); if(cr) cr.classList.remove('hid');
    focused=null;
  }

  /* Suggestions belong to the message that offered them, not to the
     composer. Parked above the field they were a permanent shelf that had
     nothing to do with whatever was on screen; in the thread they read as
     the assistant's own follow-up, they scroll away with the reply that
     produced them, and the composer gets its height back.

     Only ever one row: a new set replaces the old one rather than leaving
     a trail of stale offers up the thread. */
  function chipEl(){ return th.querySelector('.sug'); }
  function setChips(l){
    const old=chipEl();
    /* Never re-show chips over a widget that still wants an answer. */
    if(focused&&document.getElementById(focused)&&
       !document.getElementById(focused).classList.contains('done')){
      if(old) old.remove(); return;
    }
    if(tapped&&l&&l.length){
      l=l.filter(c=>c!==tapped); tapped=null;
    }
    if(!l||!l.length){ if(old) old.remove(); return; }

    const row=document.createElement('div');
    row.className='sug';
    row.setAttribute('role','group');
    row.setAttribute('aria-label','Suggestions');
    row.innerHTML=l.map(c=>'<button class="chip" data-say="'+esc(c)+'">'+esc(c)+'</button>').join('');
    if(old) old.remove();
    th.appendChild(row);
    const G=M.g();
    if(G) G.from(row.children,{opacity:0,y:7,duration:.28,stagger:.04,clearProps:'transform'});
    end();                       /* scroll them into view, they are the point */
  }


  /* --------------------------------------------------------- conversation */
  function send(text,chip){
    if(busy) return;
    busy=true;
    let r=null;
    if(chip){r=chip.getBoundingClientRect();tapped=text;chip.remove();}
    const el=userBub(text);
    if(r) M.fromChip(el.querySelector('.bub'),r);else M.in(el,0);
    Chats.autoTitle(text); syncTitle();
    setChips([]);end(true);

    thinking(true);
    setTimeout(()=>{
      thinking(false);M.hit(mark);
      let acts;
      try{acts=AI.respond(AI.parse(text));}
      catch(e){console.error(e);M.in(aiBub('Something broke on my side — try again?'),1);busy=false;return;}
      play(acts,0);
      /* A panel this large needs dwell or it just flashes. 1.4s is long
         enough for one phrase change and still feels responsive. */
    },M.red?50:1350+Math.random()*260);
  }

  function play(A,i){
    if(i>=A.length){busy=false;end();return;}
    const a=A[i], nx=d=>setTimeout(()=>play(A,i+1),M.red?0:(d||0));
    switch(a.t){
      case 'say':   M.in(aiBub(a.h),1);end();nx(180);break;
      case 'chips': setChips(a.v);end();nx(0);break;
      case 'rail':  rail(a.v);AI.setRecs(a.v);end();nx(180);break;
      case 'combo': comboSet(a.v);end();nx(180);break;
      case 'built': wBuilt(a.v,{inCart:a.inCart});AI.setCfg(a.v);end();nx(180);break;
      case 'ask':   wAsk(a.v);end();nx(140);break;
      case 'resolve':collapse(a.id,a.v);end();nx(220);break;
      case 'form':  wDetails(a.v);end();nx(0);break;
      /* Every former sheet is now an inline widget. */
      case 'sheet': setTimeout(()=>{
                      if(a.v==='cart') wOrder();
                      if(a.v==='pay')  wPay();
                      nx(0);},180);break;
      case 'track': setTimeout(()=>{wTrack(a.v);nx(0);},150);break;
      default: nx(0);
    }
  }

  /* ------------------------------------------------- configured dish card */
  function wBuilt(cfg,o){
    o=o||{};
    const id=uid('bt'), it=Menu.item(cfg.id);
    drafts[id]={cfg:JSON.parse(JSON.stringify(cfg)),sig:null};
    const sp=Menu.spec(cfg).map(s=>'<span>'+esc(s)+'</span>').join('')+
      cfg.rm.map(r=>'<span class="x">'+IC.x+' No '+esc(r)+'</span>').join('');
    widget(id,{
      label:'Built for you', hot:1,
      body:'<div class="bt__t"><img '+Menu.img(it)+'><div style="flex:1;min-width:0">'+
        '<div class="bt__n">'+esc(it.n)+'</div><div class="sp">'+sp+'</div></div></div>',
      foot:'<span class="pr">'+R$(Menu.price(cfg))+'</span>'+
        '<button class="b b--g" data-a="wopen" data-w="'+id+'">Options</button>'+
        (o.inCart?'<button class="b b--ok" disabled>'+IC.ok+' In order</button>'
                 :'<button class="b b--p" data-a="wadd" data-w="'+id+'">+ Add</button>'),
    });
    const el=document.getElementById(id),G=M.g();
    if(G) G.from(el.querySelectorAll('.sp span'),{opacity:0,y:5,duration:.28,stagger:.04,delay:.12});
    return el;
  }

  /* ------------------------------------------------------------ ask card */
  function wAsk(a){
    widget(a.id,{
      label:a.label, hot:1, focus:1,
      body:'<div style="font-size:15px;margin-bottom:11px">'+esc(a.q)+'</div>'+
        '<div class="opts">'+a.opts.map(o=>
          '<button class="chip chip--b" data-a="wans" data-ask="'+a.id+'" data-o="'+o.id+'">'+
          esc(o.label)+'</button>').join('')+'</div>',
      redo:'wredo',
    });
  }

  /* ---------------------------------------------------------- cart badge */
  let prevN=0;
  function onCart(s){
    const t=s.t;
    /* Written first, animated after. The badge is correct with GSAP absent,
       with the tween mid-flight, or if the tween never runs at all. */
    pill.textContent=t.n;
    cartBtn.classList.toggle('has',t.n>0);
    if(t.n>prevN) M.added(cartBtn,pill);
    prevN=t.n;
  }


  /* -------------------------------------------------------------- adding */
  function addIt(cfg,btn,keep){
    AI.setSig(Cart.add(cfg));AI.setCfg(cfg);
    const host=btn.closest('.fc,.sg,.w,.mr'), img=host&&host.querySelector('img');
    if(img) M.fly(img,cartBtn,img.currentSrc||img.src);
    M.tap(btn,.9);
    if(btn.classList.contains('sg')){
      /* A suggestion row is the whole button, so confirming can't overwrite
         its contents the way it can on a plain Add — only the affordance
         at the end changes, and the row stays readable while it does. */
      const x=btn.querySelector('.sg__x');
      btn.classList.add('on');btn.disabled=true;
      if(x) x.innerHTML=IC.ok;
    }else{
      const label=btn.innerHTML;
      btn.innerHTML=IC.ok+' Added';
      btn.classList.add('b--ok');btn.disabled=true;
      if(!keep) setTimeout(()=>{btn.innerHTML=label;btn.classList.remove('b--ok');btn.disabled=false;},1500);
    }
    toast(Menu.item(cfg.id).n+' added');
    suggest(cfg);
  }
  function suggest(cfg){
    const it=Menu.item(cfg.id);
    if(!it.ad.length||sug[it.id]){setChips(AI.chips());return;}
    sug[it.id]=1;
    setTimeout(()=>{
      const have={};Cart.raw().forEach(l=>{have[l.id]=1;});
      const p=it.ad.map(Menu.item).filter(a=>a&&!a.out&&!have[a.id]);
      if(!p.length){setChips(AI.chips());return;}
      M.hit(mark);addonRail(p);setChips(AI.chips());end();
    },620);
  }

  function toast(m){tst.innerHTML=IC.ok+'<span>'+esc(m)+'</span>';M.toast(tst);}

  let rec=false;
  function voice(){
    const b=document.getElementById('mic');
    rec=!rec;
    b.classList.toggle('rec',rec);
    if(rec) ph.say('Listening\u2026'); else if(!inp.value.trim()) ph.start(); else ph.stop();
    inp.disabled=rec;
    const G=M.g();
    if(rec){
      M.busy(mark);
      if(G) G.to(b,{scale:1.1,duration:.6,repeat:-1,yoyo:true,ease:'sine.inOut'});
      setTimeout(()=>{if(!rec)return;voice();send('full chicken biryani, spicy, no onion');},1900);
    }else{
      M.idle(mark);
      if(G){G.killTweensOf(b);G.to(b,{scale:1,duration:.2});}
    }
  }

  /* -------------------------------------------- one delegated click handler */
  function bind(){
    document.body.addEventListener('click',e=>{
      const say=e.target.closest('[data-say]');
      if(say&&!busy){send(say.dataset.say,say.classList.contains('chip')?say:null);return;}
      const b=e.target.closest('[data-a]');
      if(!b) return;
      const a=b.dataset.a, wid=b.dataset.w, curId=Chats.activeId();

      switch(a){
        case 'order': wOrder(); break;
        case 'newchat':   newChat(); break;
        case 'openchat':  if(!e.target.closest('[data-a="closechat"]')) switchChat(b.dataset.id); break;
        case 'closechat': e.stopPropagation(); closeChatRow(b.dataset.id);
                          setTimeout(()=>{ if(Chats.activeId()!==curId){ } syncTitle(); },420); break;

        case 'opt': wOptions(Menu.def(b.dataset.id),null); break;
        case 'mood':{
          M.tap(b,.97);
          /* It goes into the conversation as something you SAID — the whole
             point is that the assistant stays the interface. */
          /* No setMood here: sending removes the whole opening screen, moods
             included, and the conversation's own follow-ups take over. The
             'mood' set is for the case where the screen survives. */
          setTimeout(()=>send(b.dataset.say,b),120);
          break;
        }
        case 'combodetail':{
          const c=Menu.combo(b.dataset.id); if(!c) break;
          M.tap(b,.985);
          comboPeek(c);
          break;
        }

        case 'ntopen': noteOpen(b); break;
        case 'ntdone': noteClose(); break;

        case 'note':{
          const on=b.getAttribute('aria-pressed')!=='true';
          b.setAttribute('aria-pressed',String(on));
          M.tap(b,.94);
          syncNotes(b.closest('[data-nt]'));
          break;
        }

        case 'addcombo':{
          const c=Menu.combo(b.dataset.id);
          if(!c) break;
          /* Added as its own lines so the order screen stays editable — a
             combo you can't take one coffee out of is a trap, not a saving. */
          c.lines.forEach(l=>{
            const cfg=Menu.def(l.it.id);
            for(let k=0;k<l.q;k++) Cart.add(cfg);
          });
          M.tap(b,.94);
          if(b.closest('.ntp')) noteClose();
          b.textContent='Added';b.classList.add('b--ok');b.disabled=true;
          const im=b.closest('.cb').querySelector('img');
          if(im) M.fly(im,cartBtn,im.currentSrc||im.src);
          toast(c.n+' added \u00b7 saved '+R$(c.off));
          /* Still on the opening screen: swap the moods for follow-ups and
             let the captain say something, rather than dumping a chip row. */
          if(th.querySelector('.mood')){
            setMood('added');
            setTimeout(()=>{ M.in(aiBub('Good pick. Added to your order.'),1); end(); },420);
          }else setChips(AI.chips());
          break;
        }

        case 'add':{
          const cfg=Menu.def(b.dataset.id);
          /* Add on a customisable dish IS the customise button now — it opens
             the options widget rather than silently committing defaults. The
             card's Add carries data-opts; a quick add-on row doesn't, so
             those still go straight in unless something is actually required. */
          if(b.dataset.opts||Menu.needs(cfg).length){wOptions(cfg,null);return;}
          addIt(cfg,b,false); break;
        }

        /* ---- options widget ---- */
        case 'wone':
          drafts[wid].cfg.sel[b.dataset.g]=b.dataset.o;
          b.parentElement.querySelectorAll('.ob').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
          reprice(wid); break;
        case 'wmul':{
          const d=drafts[wid].cfg,g=b.dataset.g,o=b.dataset.o;
          const cur=(d.sel[g]||[]).slice(),i=cur.indexOf(o);
          if(i>=0) cur.splice(i,1); else if(cur.length<G[g].max) cur.push(o);
          d.sel[g]=cur;
          b.setAttribute('aria-pressed',String(cur.indexOf(o)>=0));
          reprice(wid); break;
        }
        case 'wrm':{
          const d=drafts[wid].cfg,r=b.dataset.r,i=d.rm.indexOf(r);
          if(i>=0) d.rm.splice(i,1); else d.rm.push(r);
          b.setAttribute('aria-pressed',String(i<0)); break;
        }
        case 'wsave':{
          const d=drafts[wid];
          const need=Menu.needs(d.cfg);
          if(need.length){toast('Pick a '+G[need[0]].n.toLowerCase());return;}
          const cfg=JSON.parse(JSON.stringify(d.cfg));
          if(d.sig){
            Cart.swap(d.sig,cfg);
            collapse(wid,Menu.item(cfg.id).n+' · updated');
            toast('Order updated');
          }else{
            AI.setSig(Cart.add(cfg));AI.setCfg(cfg);
            collapse(wid,Menu.item(cfg.id).n+' · '+R$(Menu.price(cfg)));
            toast(Menu.item(cfg.id).n+' added');
            const img=document.getElementById(wid).querySelector('img');
            if(img) M.fly(img,cartBtn,img.currentSrc||img.src);
            suggest(cfg);
          }
          setChips(AI.chips());end(); break;
        }
        case 'wreopen': {const el=document.getElementById(wid);if(el) el.classList.remove('done');break;}

        /* ---- built card ---- */
        case 'wopen': wOptions(drafts[wid].cfg,null); break;
        case 'wadd':  addIt(drafts[wid].cfg,b,true); break;

        /* ---- order widget ---- */
        case 'wq': Cart.bump(b.dataset.sig,+b.dataset.d); refreshOrder(wid); break;
        case 'wdel':{
          const sig=b.dataset.sig, row=b.closest('.ln');
          if(row) M.kill(row,()=>{Cart.del(sig);refreshOrder(wid);});
          else {Cart.del(sig);refreshOrder(wid);}
          break;
        }
        case 'wed':{
          const l=Cart.get(b.dataset.sig);
          if(l) wOptions(l,b.dataset.sig);
          break;
        }
        case 'wnext':{
          collapse(wid,Cart.totals().n+' items · '+R$(Cart.totals().total));
          setTimeout(()=>play(AI.next([]),0),260); break;
        }

        /* ---- details widget ---- */
        case 'wdet': detailsDone(wid,b); break;
        case 'wlater': focusOff(); setChips(AI.chips()); toast('Come back when you\'re ready'); break;

        /* ---- payment widget ---- */
        case 'wpm':
          payM=b.dataset.m;
          b.parentElement.querySelectorAll('[data-a="wpm"]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
          break;
        case 'wmode':
          Cart.setFul({mode:null});AI.clearAsk();
          collapse(wid,'Changing order type');
          setTimeout(()=>play(AI.next([]),0),260); break;
        case 'wgo': b.disabled=true; wPaying(wid); break;
        case 'wtrack': wTrack(window.order); break;

        /* ---- menu widget ---- */
        case 'wcat':{
          cat=b.dataset.c;
          const el=document.getElementById(wid);
          if(el) el.querySelector('.w__b').innerHTML=menuBody(wid);
          break;
        }

        /* ---- ask widget ---- */
        case 'wans':{
          const ask=AI.S.ask;
          if(!ask||ask.id!==b.dataset.ask) return;
          const o=ask.opts.find(x=>x.id===b.dataset.o);
          if(!o) return;
          AI.clearAsk();collapse(ask.id,o.label);
          if(ask.kind==='mode'){
            Cart.setFul({mode:o.id});
            setTimeout(()=>play(AI.next([]),0),300);
          }
          break;
        }
        case 'wredo':{
          const el=document.getElementById(wid);
          if(el) el.classList.remove('done');
          Cart.setFul({mode:null}); break;
        }
      }
    });

    document.body.addEventListener('input',e=>{
      const k=e.target.dataset.ff;
      if(!k) return;
      let v=e.target.value;
      /* The free-text half isn't a fulfilment field of its own — it's one
         input into the single notes string, so it goes through syncNotes. */
      if(k==='ntfree'){ syncNotes(e.target.closest('[data-nt]')); return; }
      if(k==='phone'){
        /* Keep the caret where the user left it. Reformatting rewrites the
           whole value, which otherwise throws the caret to the end on every
           keystroke — the classic formatted-input bug. */
        const el=e.target, before=el.selectionStart;
        const digitsBefore=el.value.slice(0,before).replace(/\D/g,'').length;
        const d=v.replace(/\D/g,'').slice(0,10);
        const shown=fmtTel(d);
        el.value=shown;
        let seen=0,pos=shown.length;
        for(let i=0;i<shown.length;i++){
          if(/\d/.test(shown[i])) seen++;
          if(seen===digitsBefore){pos=i+1;break;}
        }
        if(digitsBefore===0) pos=0;
        try{el.setSelectionRange(pos,pos);}catch(_){}

        const wrap=el.closest('.fl');
        const cnt=wrap&&wrap.querySelector('[data-cnt]');
        if(cnt){cnt.textContent=d.length+'/10';cnt.classList.toggle('ok',d.length===10);}
        if(wrap){
          const was=wrap.classList.contains('done');
          wrap.classList.toggle('done',d.length===10);
          if(!was&&d.length===10){
            const G=M.g(), tk=wrap.querySelector('.tick');
            if(G&&tk) G.fromTo(tk,{scale:.4},{scale:1,duration:.42,ease:'back.out(3)'});
          }
        }
        v=d;                       /* state always holds bare digits */
      }else if(e.target.value!==v){ e.target.value=v; }
      Cart.setFul({[k]:v});
      const fl=e.target.closest('.fl');
      if(fl&&fl.classList.contains('bad')){
        fl.classList.remove('bad');
        const em=fl.querySelector('em');if(em) em.remove();
      }
      /* Keep any open payment widget's button honest as you type. */
      document.querySelectorAll('[data-a="wgo"]').forEach(btn=>{
        const s=Cart.snap();
        btn.disabled=!s.ready;
        btn.textContent=s.ready?'Pay '+R$(s.t.total):'Add your details first';
      });
    });

    th.addEventListener('pointerdown',e=>{
      const c=e.target.closest('.fc');
      if(c&&!e.target.closest('button')) M.tap(c,.985);
    });
  }

  function refreshOrder(wid){
    const el=document.getElementById(wid);
    if(!el){wOrder();return;}
    const s=Cart.snap();
    if(!s.lines.length){collapse(wid,'Order emptied');return;}
    el.querySelector('.w__h .n').textContent=s.t.n+' item'+(s.t.n===1?'':'s');
    el.querySelectorAll('.ln').forEach(row=>{
      const l=s.lines.find(x=>x.sig===row.dataset.sig);
      if(!l){row.remove();return;}
      row.querySelector('.stp span').textContent=l.q;
      row.querySelector('.ln__p').textContent=R$(l.total);
    });
    const bill=el.querySelector('.w__b');
    const idx=bill.innerHTML.indexOf('<div class="rule">');
    if(idx>=0) bill.innerHTML=bill.innerHTML.slice(0,idx)+'<div class="rule"></div>'+billRows(s.t);
    /* Reassigning innerHTML recreates whatever the notes UI is — repaint it
       from the stored string rather than losing what someone just wrote. */
    paintNotes(bill.querySelector('[data-nt]'));
    syncTriggers();
    el.querySelector('.w__f .pr').textContent=R$(s.t.total);
  }

  function detailsDone(wid,btn){
    const card=document.getElementById(wid), miss=Cart.missing();
    if(miss.length){
      card.querySelectorAll('.fl[data-f]').forEach(f=>{
        const bad=miss.indexOf(f.dataset.f)>=0;
        f.classList.toggle('bad',bad);
        let em=f.querySelector('em');
        if(bad){
          if(!em){em=document.createElement('em');f.appendChild(em);}
          em.textContent=f.dataset.f==='phone'?'Needs 10 digits':'Required';
        }else if(em) em.remove();
      });
      const first=card.querySelector('.fl.bad input');
      if(first) first.focus();
      const G=M.g();
      if(G) G.fromTo(card,{x:-5},{x:0,duration:.4,ease:'elastic.out(1,0.4)'});
      return;
    }
    const f=Cart.getFul();
    collapse(wid,[f.name,f.phone,f.address].filter(Boolean).join(' · '));
    setTimeout(()=>play(AI.next([]),0),280);
  }

  return { init, send, wOrder, wPay, wMenu };
})();


if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',UI.init);
else UI.init();

/* exported for the other modules */
window.UI=UI;
