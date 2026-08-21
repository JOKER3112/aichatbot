/* Petpooja AI — menu access + pricing
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

const Menu = {
  all:()=>ITEMS, rest:()=>R, modes:()=>R.modes,
  item:(id)=>ITEMS.find(i=>i.id===id)||null,
  grp:(id)=>G[id]||null,
  opt:(g,o)=>{const gg=G[g];return gg?gg.o.find(x=>x.id===o)||null:null;},
  rmFor:(it)=>(RM[it.rm]||[]).slice(),

  /* ---------------------------------------------------------------- combos
     Resolved live from ITEMS rather than stored with prices baked in, so a
     price change in one place can't leave a combo quoting a stale total. A
     combo whose parts are off the menu today simply doesn't resolve. */
  combo(id){
    const c=COMBOS.find(x=>x.id===id); if(!c) return null;
    const lines=[];
    for(const [iid,q] of c.l){
      const it=Menu.item(iid);
      if(!it||it.out) return null;          /* incomplete combo is no combo */
      lines.push({it,q,sub:it.p*q});
    }
    const was=lines.reduce((t,l)=>t+l.sub,0);
    /* Rating and hero image are DERIVED, never stored — a combo can't quote
       a score its own dishes don't add up to, and it can't show a photo of
       something that left the menu. Weighted by price, so the dish you're
       mostly paying for is the dish being rated. */
    const wsum=lines.reduce((t,l)=>t+l.sub,0)||1;
    const r=lines.reduce((t,l)=>t+l.it.r*l.sub,0)/wsum;
    const hero=lines.slice().sort((a,b)=>b.sub-a.sub)[0].it;
    return Object.assign({},c,{lines,was,now:was-c.off,
      n_items:lines.reduce((t,l)=>t+l.q,0),
      r:Math.round(r*10)/10, hero});
  },
  /* The opening screen's hero. First entry that resolves, so a dish going
     off the menu demotes its combo instead of showing a broken card. */
  captain(){
    for(const c of COMBOS){ const r=Menu.combo(c.id); if(r) return r; }
    return null;
  },
  combos(f){
    f=f||{};
    return COMBOS.map(c=>Menu.combo(c.id)).filter(c=>{
      if(!c) return false;
      if(f.veg===true  && !c.veg) return false;
      if(f.veg===false &&  c.veg) return false;
      /* Asking to feed two people means a meal, not the evening snack box. */
      if(f.serves      && (c.serves<f.serves || !c.meal)) return false;
      return true;
    });
  },

  def(id){
    const it=Menu.item(id); if(!it) return null;
    const sel={};
    it.g.forEach(gid=>{ const g=G[gid]; if(!g) return;
      sel[gid]= g.t==='m' ? [] : (it.df[gid] || (g.req?g.o[0].id:null)); });
    return { id, sel, rm:[], q:1 };
  },
  price(cfg){
    const it=Menu.item(cfg.id); if(!it) return 0;
    let p=it.p;
    Object.keys(cfg.sel||{}).forEach(gid=>{
      const v=cfg.sel[gid]; if(v==null) return;
      (Array.isArray(v)?v:[v]).forEach(oid=>{const o=Menu.opt(gid,oid); if(o) p+=o.d;});
    });
    return p;
  },
  line:(cfg)=>Menu.price(cfg)*Math.max(1,cfg.q||1),
  spec(cfg){
    const it=Menu.item(cfg.id); if(!it) return [];
    const out=[];
    it.g.forEach(gid=>{
      const v=cfg.sel[gid]; if(v==null) return;
      (Array.isArray(v)?v:[v]).forEach(oid=>{const o=Menu.opt(gid,oid); if(o) out.push(o.n);});
    });
    return out;
  },
  sig(cfg){
    const parts=[cfg.id];
    Object.keys(cfg.sel||{}).sort().forEach(gid=>{
      const v=cfg.sel[gid];
      const ids=(Array.isArray(v)?v.slice().sort():[v]).filter(Boolean);
      if(ids.length) parts.push(gid+':'+ids.join('+'));
    });
    if(cfg.rm&&cfg.rm.length) parts.push('rm:'+cfg.rm.slice().sort().join('+'));
    return parts.join('|');
  },
  needs(cfg){
    const it=Menu.item(cfg.id); if(!it) return [];
    return it.g.filter(gid=>{
      const g=G[gid]; if(!g||!g.req) return false;
      const v=cfg.sel[gid];
      return Array.isArray(v)?!v.length:!v;
    });
  },
  find(f){
    f=f||{};
    let l=ITEMS.filter(i=>!i.out);
    if(f.cat)          l=l.filter(i=>i.c.toLowerCase()===f.cat.toLowerCase());
    if(f.veg===true)   l=l.filter(i=>i.veg);
    if(f.veg===false)  l=l.filter(i=>!i.veg);
    if(f.max)          l=l.filter(i=>i.p<=f.max);
    if(f.minSp)        l=l.filter(i=>i.sp>=f.minSp);
    if(f.maxSp!=null)  l=l.filter(i=>i.sp<=f.maxSp);
    if(f.best)         l=l.filter(i=>i.best);
    if(f.tags)         l=l.filter(i=>f.tags.some(t=>i.tg.indexOf(t)>=0));
    if(f.q){const q=f.q.toLowerCase();
      l=l.filter(i=>i.n.toLowerCase().indexOf(q)>=0||i.d.toLowerCase().indexOf(q)>=0||i.tg.some(t=>t.indexOf(q)>=0));}
    return l.sort((a,b)=>(b.best-a.best)||(b.r-a.r));
  },

  /* Generated plate from the dish's own palette, so a failed photo never
     leaves an empty rectangle. */
  art(it){
    const c=it.a||['#C97B3C','#5A3418'];
    const seed=it.id.split('').reduce((a,ch)=>a+ch.charCodeAt(0),0);
    let bits='';
    for(let i=0;i<6;i++){
      const ang=(seed*(i+3))%360;
      const cx=100+Math.cos(ang*Math.PI/180)*(32+(i%3)*9);
      const cy=76+Math.sin(ang*Math.PI/180)*(24+(i%2)*8);
      bits+='<circle cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+(9+(seed*(i+5))%9)+
            '" fill="'+(i%2?c[0]:c[1])+'" opacity="'+(0.5+(i%3)*0.15).toFixed(2)+'"/>';
    }
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">'+
      '<rect width="200" height="150" fill="'+c[1]+'"/>'+
      '<ellipse cx="100" cy="76" rx="60" ry="44" fill="'+c[0]+'" opacity=".9"/>'+bits+'</svg>');
  },
  /* Photos first — they're real, and they're what you want on a live
     prototype. If one fails (offline, hotlink blocked, URL rotted) the card
     falls back to a real file in images/dishes/, so it is never blank and
     never a data-URI blob you can't inspect.

     To use your own photography: drop <id>.jpg into images/dishes/ and set
     PHOTO_DIR below — nothing else changes. */
  img(it){
    const local = 'images/dishes/' + it.id + '.svg';
    const src   = USE_ART ? local : (it.ph || local);
    return 'src="' + src + '" loading="lazy" decoding="async" ' +
           'width="272" height="204" alt="' + esc(it.n) + '" ' +
           'onerror="this.onerror=null;this.src=\'' + local + '\'"';
  },
};

/* ========================================================================== */
/* CART                                                                        */
/* ========================================================================== */

/* exported for the other modules */
window.Menu=Menu;
