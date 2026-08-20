/* Petpooja AI — intent engine
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

const AI=(function(){
  const S={recs:[],cfg:null,sig:null,ask:null,pref:{veg:null,sp:null},turn:0};

  const W={
    spicy:['spicy','hot','chilli','chili','fiery','kaaram'],
    mild:['mild','not spicy','no spice','less spicy','plain'],
    veg:['veg','vegetarian','no meat','pure veg'],
    nonveg:['non veg','nonveg','non-veg','chicken','mutton','fish','egg','meat'],
    light:['light','small','snack','quick bite','tiffin'],
    fill:['filling','heavy','hungry','full meal','starving','meals'],
    cart:['cart','my order','view order','basket','review order','show order','order summary'],
    pay:['checkout','check out','place order','pay','proceed','confirm order','place it'],
    track:['track','where is','how long','eta','status','when will'],
    pop:['bestseller','bestsellers','best seller','most popular','popular','most ordered',
         "what's good",'whats good','special today',"what's special",'whats special'],
    rec:['recommend','suggest','what should','surprise','anything good'],
    /* This list exists because 'meal for two' used to parse to nothing at
       all — it was a starter chip that answered with a shrug. */
    combo:['meal for two','meal for 2','meals for two','food for two','dinner for two',
           'dinner for 2','lunch for two','lunch for 2','for two','for 2','feast',
           'combo','combos','platter','family pack','share','sharing','together'],

    hi:['hi','hey','hello','yo','vanakkam','namaste'],
    no:['no','nope','nah','not now','skip'],
    help:['help','what can you do','how does this work'],
    dinein:['dine in','dine-in','dinein','eat here','table'],
    pickup:['pickup','pick up','takeaway','take away','collect','parcel'],
    delivery:['delivery','deliver','home delivery','to my place'],
  };
  const SZ={'extra large':'full',large:'full',full:'full',family:'fam',big:'full',
            half:'half',small:'half',regular:'reg',medium:'reg'};
  const SP={'extra spicy':'extrahot','chettinad hot':'extrahot','very spicy':'spicy',
            'extra hot':'extrahot',spicy:'spicy',hot:'spicy',medium:'medium',
            mild:'mild','not spicy':'mild'};
  const EX={'ghee roast':'ghee',ghee:'ghee',cheese:'cheese',podi:'podi','milagai podi':'podi',
            'extra chutney':'xchut','extra sambar':'xsam','extra rasam':'xras',
            raita:'raita',brinjal:'brinjal','boiled egg':'egg'};
  const ORD={first:0,'1st':0,second:1,'2nd':1,third:2,'3rd':2,last:-1};

  /* Word boundaries, not substrings — "something" contains "hi". */
  const has=(t,l)=>l.some(w=>w.indexOf(' ')>=0?t.indexOf(w)>=0
    :new RegExp('\\b'+w.replace(/-/g,'\\-')+'\\b').test(t));
  const nm=s=>s.toLowerCase().replace(/[₹,]/g,' ').replace(/\s+/g,' ').trim();

  function parse(text){
    const t=nm(text);
    const o={raw:text,i:'?',id:null,ref:null,vr:null,md:{},ex:[],rm:[],q:null,f:{},ful:{},ans:null};

    if(has(t,W.dinein)) o.ful.mode='dinein';
    else if(has(t,W.pickup)) o.ful.mode='pickup';
    else if(has(t,W.delivery)) o.ful.mode='delivery';

    const ph=t.match(/\b(\d{10})\b/); if(ph) o.ful.phone=ph[1];
    const nn=text.match(/^\s*([A-Za-z][A-Za-z\s.]{1,28}?)\s+\d{10}\s*$/);
    if(nn) o.ful.name=nn[1].trim();

    if(S.ask){
      const hit=S.ask.opts.find(x=>t===nm(x.label)||t.indexOf(nm(x.label))>=0);
      if(hit){o.i='ans';o.ans=hit;return o;}
    }
    if(has(t,W.pay))  {o.i='pay';   return o;}
    if(has(t,W.cart)) {o.i='cart';  return o;}
    if(has(t,W.track)){o.i='track'; return o;}
    if(has(t,W.help)) {o.i='help';  return o;}
    if(o.ful.mode&&t.split(' ').length<=3){o.i='ful';return o;}
    if(o.ful.phone){o.i='ful';return o;}
    if(t.split(' ').length<=3&&has(t,W.hi)){o.i='hi';return o;}
    if(has(t,W.combo)){
      o.i='combo';
      if(has(t,W.veg)) o.f.veg=true; else if(has(t,W.nonveg)) o.f.veg=false;
      /* "meal for two" should not answer with the breakfast box. */
      if(/\b(two|2|couple|both)\b/.test(t)) o.f.serves=2;
      return o;
    }

    const q=t.match(/\b(\d{1,2})\s*(x|pcs?|pieces?|plates?)?\b/);
    if(q&&+q[1]>0&&+q[1]<=20&&!ph) o.q=+q[1];
    if(/\b(one more|another|add one)\b/.test(t)){o.q=1;o.i='more';}

    if(has(t,W.veg)) o.f.veg=true; else if(has(t,W.nonveg)) o.f.veg=false;
    if(has(t,W.spicy)) o.f.sp='spicy'; else if(has(t,W.mild)) o.f.sp='mild';
    if(has(t,W.light)) o.f.w='light';
    if(has(t,W.fill))  o.f.w='filling';
    if(has(t,W.pop))   o.f.best=true;
    const b=t.match(/under\s*(\d{2,4})|below\s*(\d{2,4})|less than\s*(\d{2,4})|within\s*(\d{2,4})/);
    if(b) o.f.max=+(b[1]||b[2]||b[3]||b[4]);

    /* Score every dish, take the best. First-match-wins picks the wrong one
       when a name is a subset of another ("Egg Dosa" vs "Masala Dosa"). */
    let best=null,bs=0;
    ITEMS.forEach(it=>{
      const ws=it.n.toLowerCase().replace(/[()0-9]/g,'').split(' ').map(w=>w.trim()).filter(w=>w.length>2);
      if(!ws.length||bs===99) return;
      if(t.indexOf(it.n.toLowerCase())>=0){best=it;bs=99;return;}
      const h=ws.filter(w=>new RegExp('\\b'+w).test(t)).length, ratio=h/ws.length;
      const ok=ws.length===1?h===1:(h>=2&&ratio>=0.6);
      if(ok&&h+ratio>bs){best=it;bs=h+ratio;}
    });
    if(best) o.id=best.id;

    if(!o.id){
      const cats={dosa:'Dosa',idli:'Tiffin',vada:'Tiffin',tiffin:'Tiffin',
        biryani:'Meals',meals:'Meals',thali:'Meals',rice:'Meals',
        curry:'Curries',gravy:'Curries',snack:'Snacks',
        coffee:'Drinks',tea:'Drinks',chai:'Drinks',drink:'Drinks',
        sweet:'Sweets',dessert:'Sweets'};
      for(const k in cats) if(new RegExp('\\b'+k).test(t)){o.f.cat=cats[k];o.f.kw=k;break;}
    }

    for(const w in ORD){
      if(new RegExp('\\b(the\\s+)?'+w+'\\s+(one|option)\\b').test(t)||
         new RegExp('\\bgive me (the\\s+)?'+w+'\\b').test(t)){o.ref={i:ORD[w]};break;}
    }
    if(!o.ref&&/\b(that|this|it|the same|same as before)\b/.test(t)) o.ref={focus:1};

    for(const k in SZ) if(new RegExp('\\b'+k+'\\b').test(t)){o.vr=SZ[k];break;}
    for(const k in SP) if(t.indexOf(k)>=0){o.md.sp=SP[k];break;}
    for(const k in EX){
      if(t.indexOf(k)>=0&&!new RegExp('(no|without|remove|hold the)\\s+(the\\s+)?'+k).test(t)) o.ex.push(EX[k]);
    }
    (t.match(/\b(?:no|without|remove|hold the|skip the)\s+([a-z]{3,14})\b/g)||[]).forEach(fr=>{
      const w=fr.replace(/^.*?\s/,'').replace(/s$/,'');
      if(!w||W.no.indexOf(w)>=0||w==='thank') return;
      const cap=w.charAt(0).toUpperCase()+w.slice(1);
      if(o.rm.indexOf(cap)<0) o.rm.push(cap);
    });

    if(o.i==='?'){
      const edits=o.vr||Object.keys(o.md).length||o.ex.length||o.rm.length;
      if(o.id&&edits) o.i='order';
      else if(o.id) o.i='item';
      /* A bare reference with nothing to change is a PICK, not an edit.
         Sending it down the edit path made apply() return zero changes and
         the bot answer "that doesn't apply to Filter Coffee". */
      else if(o.ref&&!edits&&(S.recs.length||S.cfg)) o.i='pick';
      else if((o.ref||edits)&&(S.cfg||S.recs.length)) o.i='edit';
      else if(Object.keys(o.ful).length) o.i='ful';
      else if(has(t,W.rec)||Object.keys(o.f).length) o.i='rec';
      else o.i='huh';
    }
    return o;
  }

  function toFind(f){
    const s={};
    if(f.veg!=null) s.veg=f.veg;
    if(f.max) s.max=f.max;
    if(f.cat) s.cat=f.cat;
    if(f.best) s.best=true;
    if(f.sp==='spicy') s.minSp=2;
    if(f.sp==='mild')  s.maxSp=1;
    if(f.w) s.tags=[f.w];
    if(f.kw) s.q=f.kw;
    return s;
  }

  function apply(cfg,p){
    const it=Menu.item(cfg.id), ch=[];
    if(p.vr){
      const gid=it.g.find(g=>(G[g]||{}).t==='v');
      if(gid){
        let w=p.vr;
        if(!Menu.opt(gid,w)){const os=G[gid].o; w=(w==='full'||w==='fam')?os[os.length-1].id:os[0].id;}
        const o=Menu.opt(gid,w); if(o){cfg.sel[gid]=w;ch.push(o.n);}
      }
    }
    if(p.md.sp){
      const gid=it.g.find(g=>g==='spice'||g==='spice-hot');
      if(gid){
        let w=p.md.sp;
        if(gid==='spice-hot'&&w==='mild') w='medium';
        if(gid==='spice'&&w==='extrahot') w='spicy';
        const o=Menu.opt(gid,w); if(o){cfg.sel[gid]=w;ch.push(o.n);}
      }
    }
    if(p.ex.length){
      const gid=it.g.find(g=>(G[g]||{}).t==='m');
      if(gid){
        const cur=(cfg.sel[gid]||[]).slice();
        p.ex.forEach(id=>{
          const o=Menu.opt(gid,id);
          if(o&&cur.length<G[gid].max&&cur.indexOf(id)<0){cur.push(id);ch.push(o.n);}
        });
        cfg.sel[gid]=cur;
      }
    }
    if(p.rm.length){
      const ok=Menu.rmFor(it);
      p.rm.forEach(r=>{
        const m=ok.find(a=>a.toLowerCase().indexOf(r.toLowerCase().slice(0,4))===0);
        if(m&&cfg.rm.indexOf(m)<0){cfg.rm.push(m);ch.push('No '+m);}
      });
    }
    if(p.q) cfg.q=p.q;
    return ch;
  }

  function chips(){
    if(window.order) return ['How long?','Track my order','Order again'];
    if(!Cart.empty()){
      const f=Cart.getFul(), c=[];
      if(!Cart.raw().some(l=>Menu.item(l.id).c==='Drinks')) c.push('Add filter coffee');
      if(!Cart.raw().some(l=>Menu.item(l.id).c==='Sweets')) c.push('Add a sweet');
      if(!f.mode) c.push('Dine-in','Delivery');
      c.push('Review order','Checkout');
      return c.slice(0,5);
    }
    if(S.cfg) return ['Make it full','Extra chutney','Something else'];
    if(S.recs.length) return ['Give me the first one','Anything cheaper?','Show veg only'];
    return ['Bestsellers','Something spicy','Veg only','Under ₹100'];
  }

  function rec(f,A){
    if(f.veg!=null) S.pref.veg=f.veg;
    if(f.sp!=null)  S.pref.sp=f.sp;
    let l=Menu.find(toFind(f));
    if(!l.length){
      const ladder=[['max',v=>'a little over ₹'+v],['w',()=>'a different portion'],
        ['sp',()=>'a different spice level'],['best',()=>'beyond the bestsellers'],
        ['veg',()=>'outside your diet filter']];
      const rx=Object.assign({},f); let gave=null;
      for(let i=0;i<ladder.length;i++){
        const k=ladder[i][0]; if(rx[k]==null) continue;
        const was=rx[k]; delete rx[k];
        const nx=Menu.find(toFind(rx));
        if(nx.length){l=nx;gave=ladder[i][1](was);break;}
      }
      if(l.length&&gave) A.push({t:'say',h:'Nothing matches all of that.<span class="sub">Closest is '+gave+'.</span>'});
    }
    if(!l.length){
      A.push({t:'say',h:"No match for that. Want to see what's popular?"});
      A.push({t:'chips',v:['Bestsellers','Something spicy','Veg only']});
      return A;
    }
    const picks=l.slice(0,6); S.recs=picks;
    const bits=[];
    if(f.best) bits.push('most ordered');
    if(f.sp==='spicy') bits.push('spicy'); if(f.sp==='mild') bits.push('mild');
    if(f.veg===true) bits.push('vegetarian'); if(f.veg===false) bits.push('non-veg');
    if(f.w) bits.push(f.w); if(f.cat) bits.push(f.cat.toLowerCase());
    const head=bits.length?bits.join(', '):'what the kitchen does best';
    A.push({t:'say',h:head.charAt(0).toUpperCase()+head.slice(1)+
      (f.max?' under ₹'+f.max:'')+'.<span class="sub">Trust me on these.</span>'});
    A.push({t:'rail',v:picks});
    A.push({t:'chips',v:chips()});
    return A;
  }

  function next(A){
    const m=Cart.missing();
    if(!m.length){
      A.push({t:'say',h:'All set. Have a look before I send it.'});
      A.push({t:'sheet',v:'pay'});
      return A;
    }
    if(m[0]==='mode'){
      const ask={id:'ask'+Date.now(),kind:'mode',label:'Order type',
        q:'How would you like this?',
        opts:R.modes.map(x=>({id:x.id,label:x.label}))};
      S.ask=ask;
      A.push({t:'ask',v:ask});
      return A;
    }
    /* Deliberately not restating the mode — the resolved card above already
       reads "Order type · Dine-in". Repeating it is the duplication the old
       flow had, just politer. */
    A.push({t:'say',h:'Last bit — '+(m.length===1?'one detail':'a couple of details')+" and I'll send it through."});
    A.push({t:'form',v:m});
    return A;
  }

  function respond(p){
    S.turn++;
    const A=[], say=h=>A.push({t:'say',h});

    switch(p.i){
      case 'hi':
        say("Vanakkam. I'm your virtual captain — tell me what you're after and I'll set it up.");
        A.push({t:'chips',v:['Bestsellers','Something spicy','Veg only','Under ₹100']});
        return A;

      case 'combo':{
        const cs=Menu.combos(p.f);
        if(!cs.length){ say("Nothing bundled for that right now — want me to build one dish at a time?");
          A.push({t:'chips',v:['Bestsellers','Veg only','Something spicy']}); return A; }
        say(cs.length===1
          ? 'This one feeds '+cs[0].serves+'. Everything in it, one price.'
          : "Two ways to do it. Both are priced as a set, so they're cheaper than the parts.");
        A.push({t:'combo',v:cs.slice(0,3).map(c=>c.id)});
        A.push({t:'chips',v:['Veg only','Non-veg options','Show bestsellers']});
        return A;
      }

      case 'help':
        say('Describe a dish and I\'ll build it. Try <b>"full chicken biryani, spicy, no onion"</b> — one line, no back and forth.');
        A.push({t:'chips',v:['Bestsellers','Something spicy','Show me dosas']});
        return A;

      case 'ans':{
        const ask=S.ask; S.ask=null;
        A.push({t:'resolve',id:ask.id,v:p.ans.label});
        if(ask.kind==='mode'){Cart.setFul({mode:p.ans.id});return next(A);}
        return A;
      }

      case 'rec':{
        const f=Object.assign({},p.f);
        const explicit=p.f.cat||p.f.kw;
        if(f.veg==null&&S.pref.veg!=null) f.veg=S.pref.veg;
        if(!explicit&&f.sp==null&&S.pref.sp!=null) f.sp=S.pref.sp;
        return rec(f,A);
      }

      case 'item':{
        const it=Menu.item(p.id); if(!it) return huh(A);
        if(it.out) return gone(it,A);
        const cfg=Menu.def(it.id); if(p.q) cfg.q=p.q;
        S.cfg=cfg;
        say('<b>'+esc(it.n)+'</b> — '+esc(it.d));
        A.push({t:'built',v:cfg});
        A.push({t:'chips',v:chips()});
        return A;
      }

      case 'order':{
        const it=Menu.item(p.id); if(!it) return huh(A);
        if(it.out) return gone(it,A);
        const cfg=Menu.def(it.id); apply(cfg,p); S.cfg=cfg;
        say('Got it — <b>'+esc(it.n)+'</b>, exactly as you said.');
        A.push({t:'built',v:cfg});
        A.push({t:'chips',v:chips()});
        return A;
      }

      case 'pick':{
        let dish=null;
        if(p.ref&&p.ref.i!=null&&S.recs.length){
          const i=p.ref.i<0?S.recs.length-1:p.ref.i;
          dish=S.recs[i]||null;
        }
        let cfg=dish?Menu.def(dish.id):(S.cfg?JSON.parse(JSON.stringify(S.cfg)):null);
        if(!cfg) return huh(A);
        const it=Menu.item(cfg.id);
        if(it.out) return gone(it,A);
        if(p.q) cfg.q=p.q;
        S.cfg=cfg;
        say('<b>'+esc(it.n)+'</b> — '+esc(it.d));
        A.push({t:'built',v:cfg});
        A.push({t:'chips',v:chips()});
        return A;
      }

      case 'edit':{
        let cfg=null,sig=null,inCart=false;
        if(p.ref&&p.ref.i!=null&&S.recs.length){
          const i=p.ref.i<0?S.recs.length-1:p.ref.i;
          if(S.recs[i]) cfg=Menu.def(S.recs[i].id);
        }
        if(!cfg&&S.sig&&Cart.get(S.sig)){cfg=JSON.parse(JSON.stringify(Cart.get(S.sig)));sig=S.sig;inCart=true;}
        if(!cfg&&S.cfg) cfg=JSON.parse(JSON.stringify(S.cfg));
        if(!cfg&&Cart.last()){cfg=JSON.parse(JSON.stringify(Cart.last()));sig=Menu.sig(cfg);inCart=true;}
        if(!cfg){say('Which dish did you mean?');return rec({},A);}

        const ch=apply(cfg,p);
        if(!ch.length){
          say("That doesn't apply to <b>"+esc(Menu.item(cfg.id).n)+"</b> — open Options and I'll show you what it does have.");
          A.push({t:'built',v:cfg});
          return A;
        }
        S.cfg=cfg;
        if(inCart&&sig){
          S.sig=Cart.swap(sig,cfg);
          say('Done — '+ch.join(', ').toLowerCase()+'. Updated in your order.');
          A.push({t:'built',v:cfg,inCart:1});
        }else{
          say('Done — '+ch.join(', ').toLowerCase()+'.');
          A.push({t:'built',v:cfg});
        }
        A.push({t:'chips',v:chips()});
        return A;
      }

      case 'more':{
        const l=Cart.last();
        if(!l){say('Nothing in the order yet.');return rec({},A);}
        Cart.bump(Menu.sig(l),p.q||1);
        say('Another <b>'+esc(Menu.item(l.id).n)+'</b> added.');
        A.push({t:'chips',v:chips()});
        return A;
      }

      case 'ful':
        if(Object.keys(p.ful).length) Cart.setFul(p.ful);
        if(Cart.empty()){
          say("Noted. Let's get some food in the order first.");
          A.push({t:'chips',v:['Bestsellers','Something spicy']});
          return A;
        }
        return next(A);

      case 'cart':
        if(Cart.empty()){
          say('Your order is empty. Want a suggestion?');
          A.push({t:'chips',v:['Bestsellers','Something spicy','Under ₹100']});
          return A;
        }
        say("Here's the order so far.");
        A.push({t:'sheet',v:'cart'});
        return A;

      case 'pay':
        if(Cart.empty()){
          say('Nothing to send yet.');
          A.push({t:'chips',v:['Bestsellers','Something spicy']});
          return A;
        }
        return next(A);

      case 'track':{
        const o=window.order;
        if(!o){say('No live order right now.');return A;}
        say('Being prepared — about <b>'+o.eta.lo+' minutes</b> to go.');
        A.push({t:'track',v:o});
        return A;
      }

      default: return huh(A);
    }
  }

  function gone(it,A){
    A.push({t:'say',h:'<b>'+esc(it.n)+'</b> is off today, sorry.'});
    const alts=Menu.find({cat:it.c}).slice(0,4);
    if(alts.length){
      A.push({t:'say',h:'Closest thing on the pass right now:'});
      A.push({t:'rail',v:alts});
      S.recs=alts;
    }
    return A;
  }
  function huh(A){
    A.push({t:'say',h:"Didn't catch that.<span class=\"sub\">Name a dish, or describe it — \"spicy, filling, under ₹200\" works.</span>"});
    A.push({t:'chips',v:['Bestsellers','Something spicy','Veg only','Under ₹100']});
    return A;
  }

  return { parse, respond, chips, S, next,
    setCfg:c=>{S.cfg=c;}, setSig:s=>{S.sig=s;}, setRecs:l=>{S.recs=l;},
    clearAsk:()=>{S.ask=null;},
    reset(){S.recs=[];S.cfg=null;S.sig=null;S.ask=null;S.turn=0;S.pref={veg:null,sp:null};} };
})();

/* ========================================================================== */
/* MOTION — decoration only, never load-bearing                                */
/* ========================================================================== */

/* exported for the other modules */
window.AI=AI;
