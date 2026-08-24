/* Petpooja AI — order state
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

const Cart=(function(){
  let lines=[], ful={mode:null,name:'',phone:'',address:'',notes:''};
  const subs=[];
  const cl=o=>JSON.parse(JSON.stringify(o));
  const emit=()=>subs.forEach(f=>f(snap()));

  function add(cfg,q){
    const c=cl(cfg); c.q=Math.max(1,q||c.q||1);
    const sig=Menu.sig(c), hit=lines.find(l=>Menu.sig(l)===sig);
    if(hit) hit.q=Math.min(20,hit.q+c.q); else lines.push(c);
    emit(); return sig;
  }
  function setQ(sig,q){
    const i=lines.findIndex(l=>Menu.sig(l)===sig); if(i<0) return;
    if(q<=0) lines.splice(i,1); else lines[i].q=Math.min(20,q);
    emit();
  }
  function totals(){
    let sub=0,n=0;
    lines.forEach(l=>{sub+=Menu.line(l);n+=l.q;});
    const dine=ful.mode==='dinein', del=ful.mode==='delivery';
    const pack=(n&&!dine)?R.pack:0;
    const ship=(n&&del&&sub<R.freeAbove)?R.delivery:0;
    const tax=Math.round(sub*R.tax);
    return { n, sub, pack, ship, tax, total:sub+pack+ship+tax, mode:ful.mode,
             free:del&&n>0&&ship===0, toFree:Math.max(0,R.freeAbove-sub) };
  }
  function missing(){
    if(!ful.mode) return ['mode'];
    const m=R.modes.find(x=>x.id===ful.mode); if(!m) return ['mode'];
    return m.needs.filter(k=>{
      const v=String(ful[k]||'').trim();
      if(!v) return true;
      if(k==='phone') return v.replace(/\D/g,'').length!==10;
      return false;
    });
  }
  function snap(){
    return {
      lines:lines.map(l=>({sig:Menu.sig(l),cfg:l,it:Menu.item(l.id),
        spec:Menu.spec(l),unit:Menu.price(l),total:Menu.line(l),q:l.q})),
      t:totals(), ful:Object.assign({},ful), miss:missing(),
      ready:lines.length>0&&missing().length===0,
    };
  }
  return {
    sub(f){subs.push(f);f(snap());},
    add, setQ,
    bump(sig,d){const l=Cart.get(sig); if(l) setQ(sig,l.q+d);},
    del(sig){setQ(sig,0);},
    swap(sig,cfg){
      const i=lines.findIndex(l=>Menu.sig(l)===sig); if(i<0) return null;
      const q=lines[i].q; lines.splice(i,1); return add(cfg,q);
    },
    clear(){lines=[];ful={mode:null,name:'',phone:'',address:'',notes:''};emit();},
    get:(sig)=>lines.find(l=>Menu.sig(l)===sig)||null,
    last:()=>lines.length?lines[lines.length-1]:null,
    raw:()=>lines, empty:()=>!lines.length,
    setFul(p){Object.assign(ful,p);emit();},
    getFul:()=>Object.assign({},ful),
    missing, totals, snap,
    ready:()=>lines.length>0&&missing().length===0,
    /* The app doesn't take payment — the restaurant does. `place` records
       what's owed and where it's settled, and nothing about how. */
    place(){
      const t=totals(); let prep=0;
      lines.forEach(l=>{prep=Math.max(prep,Menu.item(l.id).min||15);});
      const del=ful.mode==='delivery';
      /* The tail of this list is per-mode, and it used to be assembled from
         two independent ternaries — which is how dine-in ended up being told
         its food was "At the counter" and then "Served". You are sitting at
         a table; there is no counter in that story. */
      const tail =
        del                    ? [{l:'Out for delivery'},{l:'Delivered'}] :
        ful.mode==='pickup'    ? [{l:'Ready at the counter'},{l:'Collected'}] :
                                 [{l:'Bringing it to your table'},{l:'Served'}];

      return { id:'PP'+Math.floor(1000+Math.random()*9000),
        due:t.total, t, ful:Object.assign({},ful),
        eta:{lo:prep+6,hi:prep+12}, rest:R.name,
        /* When it was placed, so the tracker can work out where it is now
           instead of being frozen at whatever was true at checkout. */
        at:Date.now(),
        stages:[{l:'Order confirmed'},{l:'Kitchen accepted'},
                {l:'Preparing your food'},{l:'Ready'}].concat(tail) };
    },
  };
})();

/* ========================================================================== */
/* AI                                                                          */
/* ========================================================================== */

/* exported for the other modules */
window.Cart=Cart;
