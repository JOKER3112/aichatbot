/* Petpooja AI — menu data
   Loaded as a plain <script>; each module hangs one global off window so
   the whole thing runs on a static host with no bundler. */
'use strict';

const R = { name:'Petpooja Kitchen', tax:0.05, pack:15, delivery:29, freeAbove:399,
  modes:[
    { id:'dinein',   label:'Dine-in',  desc:'Table at the restaurant', needs:['name','phone'] },
    { id:'pickup',   label:'Pickup',   desc:'Collect from the counter', needs:['name','phone'] },
    { id:'delivery', label:'Delivery', desc:'To your address',          needs:['name','phone','address'] },
  ]};

const G = {
  'idli-size':   { n:'Portion', t:'v', req:1, max:1, o:[{id:'half',n:'Half',d:0,m:'2 pcs'},{id:'full',n:'Full',d:30,m:'4 pcs'}] },
  'vada-size':   { n:'Portion', t:'v', req:1, max:1, o:[{id:'half',n:'Half',d:0,m:'1 pc'},{id:'full',n:'Full',d:25,m:'2 pcs'}] },
  'sweet-size':  { n:'Portion', t:'v', req:1, max:1, o:[{id:'reg',n:'Regular',d:0,m:'2 pcs'},{id:'big',n:'Large',d:40,m:'4 pcs'}] },
  'bir-size':    { n:'Portion', t:'v', req:1, max:1, o:[{id:'half',n:'Half',d:0,m:'Serves 1'},{id:'full',n:'Full',d:90,m:'Serves 2'},{id:'fam',n:'Family',d:240,m:'Serves 4'}] },
  spice:         { n:'Spice level', t:'s', req:1, max:1, o:[{id:'mild',n:'Mild',d:0},{id:'medium',n:'Medium',d:0},{id:'spicy',n:'Spicy',d:0}] },
  'spice-hot':   { n:'Spice level', t:'s', req:1, max:1, o:[{id:'medium',n:'Medium',d:0},{id:'spicy',n:'Spicy',d:0},{id:'extrahot',n:'Chettinad hot',d:0}] },
  'dosa-extra':  { n:'Make it better', t:'m', req:0, max:4, o:[{id:'ghee',n:'Ghee roast',d:30},{id:'cheese',n:'Cheese',d:40},{id:'podi',n:'Milagai podi',d:15},{id:'xchut',n:'Extra chutney',d:15}] },
  'side-extra':  { n:'Add a side', t:'m', req:0, max:3, o:[{id:'xsam',n:'Extra sambar',d:20},{id:'xchut',n:'Extra chutney',d:15},{id:'xras',n:'Extra rasam',d:20}] },
  'rice-extra':  { n:'Add a side', t:'m', req:0, max:3, o:[{id:'raita',n:'Onion raita',d:30},{id:'brinjal',n:'Brinjal curry',d:35},{id:'egg',n:'Boiled egg',d:25}] },
  coffee:        { n:'How do you take it', t:'s', req:1, max:1, o:[{id:'strong',n:'Strong',d:0},{id:'light',n:'Light',d:0},{id:'by2',n:'By 2 sugar',d:0}] },
  sugar:         { n:'Sweetness', t:'s', req:0, max:1, o:[{id:'normal',n:'Normal',d:0},{id:'less',n:'Less sweet',d:0},{id:'none',n:'No sugar',d:0}] },
};

const RM = {
  dosa:['Onion','Green chilli','Coriander','Curry leaf'],
  curry:['Onion','Garlic','Coriander','Coconut'],
  rice:['Onion','Mint','Fried onion','Cashew'],
  tiffin:['Coriander','Curry leaf','Green chilli'],
  none:[],
};

const P = 'https://images.unsplash.com/photo-';
const ITEMS = [
  { id:'t1', n:'Idli', c:'Tiffin', p:40, veg:1, sp:0, best:1, out:0, r:4.7, rc:'5.4K', min:10,
    rm:'tiffin', g:['idli-size','side-extra'], df:{'idli-size':'half'}, ad:['b1','t2','s1'],
    d:'Steamed rice and urad dal cakes, with sambar and chutney.',
    tg:['veg','best','tiffin','light','budget','mild'],
    ph:P+'1589301760014-d929f3979dbc?w=600&q=80&auto=format&fit=crop', a:['#F2EBDD','#8D8267'] },
  { id:'t2', n:'Medu Vada', c:'Tiffin', p:35, veg:1, sp:1, best:0, out:0, r:4.5, rc:'2.8K', min:12,
    rm:'tiffin', g:['vada-size','side-extra'], df:{'vada-size':'half'}, ad:['b1','t1'],
    d:'Crisp urad dal doughnuts, fluffy inside, coconut chutney.',
    tg:['veg','tiffin','light','budget','mild'],
    ph:P+'1666190092159-3171cf0fbb12?w=600&q=80&auto=format&fit=crop', a:['#C89A5B','#6B4A1E'] },
  { id:'t3', n:'Masala Dosa', c:'Dosa', p:80, veg:1, sp:1, best:1, out:0, r:4.8, rc:'7.1K', min:14,
    rm:'dosa', g:['spice','dosa-extra'], df:{spice:'medium'}, ad:['b1','t1','s1'],
    d:'Crispy dosa filled with spiced potato masala.',
    tg:['veg','best','dosa','filling','mild'],
    ph:P+'1668236543090-82eba5ee5976?w=600&q=80&auto=format&fit=crop', a:['#E0B268','#8A5A18'] },
  { id:'t4', n:'Egg Dosa', c:'Dosa', p:100, veg:0, sp:2, best:0, out:0, r:4.6, rc:'1.9K', min:15,
    rm:'dosa', g:['spice','dosa-extra'], df:{spice:'medium'}, ad:['b1','b3'],
    d:'Dosa with an egg spread across the batter, pepper and onion.',
    tg:['nonveg','dosa','filling','spicy'],
    ph:P+'1630383249896-424e482df921?w=600&q=80&auto=format&fit=crop', a:['#E3B457','#7E5416'] },
  { id:'t5', n:'Rava Dosa', c:'Dosa', p:90, veg:1, sp:1, best:0, out:0, r:4.4, rc:'1.2K', min:16,
    rm:'dosa', g:['spice','dosa-extra'], df:{spice:'medium'}, ad:['b1'],
    d:'Lacy semolina dosa with cumin, ginger and green chilli.',
    tg:['veg','dosa','light','mild'],
    ph:P+'1694849789325-914b71ce1e7a?w=600&q=80&auto=format&fit=crop', a:['#DCC07E','#7E6224'] },
  { id:'t6', n:'Ven Pongal', c:'Tiffin', p:70, veg:1, sp:1, best:0, out:0, r:4.6, rc:'2.1K', min:12,
    rm:'tiffin', g:['side-extra'], df:{}, ad:['t2','b1'],
    d:'Rice and moong dal cooked soft with pepper, cumin, cashew and ghee.',
    tg:['veg','tiffin','filling','mild'],
    ph:P+'1666190092159-3171cf0fbb12?w=600&q=80&auto=format&fit=crop', a:['#EDD9A6','#8A7534'] },
  { id:'t7', n:'Parotta', c:'Tiffin', p:30, veg:1, sp:0, best:0, out:0, r:4.5, rc:'3.3K', min:10,
    rm:'none', g:[], df:{}, ad:['c1','c2'],
    d:'Flaky layered flatbread, slapped and folded to order.',
    tg:['veg','tiffin','budget','mild'],
    ph:P+'1697155406014-04dc649b0ec0?w=600&q=80&auto=format&fit=crop', a:['#DDBC7C','#7C5A22'] },

  { id:'m1', n:'South Indian Thali', c:'Meals', p:180, veg:1, sp:2, best:1, out:0, r:4.8, rc:'4.6K', min:15,
    rm:'curry', g:['spice'], df:{spice:'medium'}, ad:['b2','s1'],
    d:'Rice, sambar, rasam, two poriyal, kootu, appalam, curd and a sweet.',
    tg:['veg','best','meals','filling'],
    ph:P+'1610192244261-3f33de3f55e4?w=600&q=80&auto=format&fit=crop', a:['#D9A441','#7C5310'] },
  { id:'m2', n:'Chicken Biryani', c:'Meals', p:160, veg:0, sp:2, best:1, out:0, r:4.8, rc:'8.9K', min:22,
    rm:'rice', g:['bir-size','spice','rice-extra'], df:{'bir-size':'half',spice:'medium'}, ad:['b2','s1'],
    d:'Seeraga samba rice, slow-cooked chicken, fried onion and mint.',
    tg:['nonveg','best','meals','filling','spicy'],
    ph:P+'1563379091339-03b21ab4a4f8?w=600&q=80&auto=format&fit=crop', a:['#D89B3C','#7A4A12'] },
  { id:'m3', n:'Mutton Biryani', c:'Meals', p:220, veg:0, sp:2, best:0, out:0, r:4.7, rc:'3.1K', min:26,
    rm:'rice', g:['bir-size','spice','rice-extra'], df:{'bir-size':'half',spice:'medium'}, ad:['b2','s1'],
    d:'Dum-cooked mutton on the bone, layered with saffron rice.',
    tg:['nonveg','meals','filling','spicy'],
    ph:P+'1701579231378-3726490a407b?w=600&q=80&auto=format&fit=crop', a:['#C58A34','#6A3E0E'] },
  { id:'m4', n:'Curd Rice', c:'Meals', p:60, veg:1, sp:0, best:0, out:0, r:4.4, rc:'1.1K', min:8,
    rm:'rice', g:[], df:{}, ad:['b4'],
    d:'Cooled rice folded through curd, tempered with mustard and curry leaf.',
    tg:['veg','meals','light','budget','mild'],
    ph:P+'1596797038530-2c107229654b?w=600&q=80&auto=format&fit=crop', a:['#EFEAD9','#8B8672'] },

  { id:'c1', n:'Chicken Chettinad', c:'Curries', p:190, veg:0, sp:3, best:0, out:0, r:4.7, rc:'2.4K', min:24,
    rm:'curry', g:['spice-hot','rice-extra'], df:{'spice-hot':'spicy'}, ad:['t7','b4'],
    d:'Chicken in a dark roasted Chettinad masala — pepper forward.',
    tg:['nonveg','curry','spicy','filling'],
    ph:P+'1603894584373-5ac82b2ae398?w=600&q=80&auto=format&fit=crop', a:['#B33A22','#5C160B'] },
  { id:'c2', n:'Chicken 65', c:'Curries', p:160, veg:0, sp:3, best:1, out:0, r:4.8, rc:'6.2K', min:18,
    rm:'curry', g:['spice-hot'], df:{'spice-hot':'spicy'}, ad:['b4','t7'],
    d:'Fried chicken tossed with curry leaf, yoghurt and dried red chilli.',
    tg:['nonveg','best','curry','spicy','light'],
    ph:P+'1567620832903-9fc6debc209f?w=600&q=80&auto=format&fit=crop', a:['#C6452A','#661B0F'] },
  { id:'c3', n:'Egg Curry', c:'Curries', p:110, veg:0, sp:2, best:0, out:0, r:4.4, rc:'1.3K', min:18,
    rm:'curry', g:['spice','rice-extra'], df:{spice:'medium'}, ad:['t7','b4'],
    d:'Boiled eggs simmered in an onion-tomato masala with coconut.',
    tg:['nonveg','curry','filling'],
    ph:P+'1631452180519-c014fe946bc7?w=600&q=80&auto=format&fit=crop', a:['#D2662C','#72290E'] },
  { id:'c4', n:'Fish Fry', c:'Curries', p:180, veg:0, sp:3, best:0, out:0, r:4.6, rc:'1.7K', min:20,
    rm:'curry', g:['spice-hot'], df:{'spice-hot':'spicy'}, ad:['b4','m4'],
    d:'Seer fish in chilli and turmeric, shallow fried till the edges crisp.',
    tg:['nonveg','curry','spicy','light'],
    ph:P+'1717838664619-cb37ee5e56a0?w=600&q=80&auto=format&fit=crop', a:['#C55B26','#67240B'] },
  { id:'c5', n:'Mutton Kola Urundai', c:'Curries', p:170, veg:0, sp:3, best:0, out:1, r:4.7, rc:'760', min:22,
    rm:'curry', g:['spice-hot'], df:{'spice-hot':'spicy'}, ad:['t7'],
    d:'Minced mutton kofta, fennel and chilli, fried dark. Four to a plate.',
    tg:['nonveg','curry','spicy'],
    ph:P+'1626500155537-8a4b1e1a1e4e?w=600&q=80&auto=format&fit=crop', a:['#8E3A1E','#4A150A'] },
  { id:'c6', n:'Chicken Kothu Parotta', c:'Curries', p:170, veg:0, sp:3, best:0, out:0, r:4.7, rc:'3.8K', min:20,
    rm:'curry', g:['spice-hot'], df:{'spice-hot':'spicy'}, ad:['b4','b1'],
    d:'Parotta shredded on the griddle with chicken, egg and salna.',
    tg:['nonveg','curry','spicy','filling'],
    ph:P+'1697155406014-04dc649b0ec0?w=600&q=80&auto=format&fit=crop', a:['#C97A32','#6A3C0E'] },

  { id:'k1', n:'Samosa', c:'Snacks', p:40, veg:1, sp:1, best:1, out:0, r:4.5, rc:'4.9K', min:8,
    rm:'none', g:[], df:{}, ad:['b1','b4'],
    d:'Two crisp pastries with spiced potato and pea, mint chutney.',
    tg:['veg','best','snack','light','budget'],
    ph:P+'1601050690597-df0568f70950?w=600&q=80&auto=format&fit=crop', a:['#D69B4A','#77501A'] },
  { id:'k2', n:'Sambar Vada', c:'Snacks', p:50, veg:1, sp:1, best:0, out:0, r:4.6, rc:'2.2K', min:10,
    rm:'tiffin', g:[], df:{}, ad:['b1'],
    d:'Vada soaked in hot sambar until it gives. Eat it fast.',
    tg:['veg','snack','light','budget'],
    ph:P+'1666190092159-3171cf0fbb12?w=600&q=80&auto=format&fit=crop', a:['#CE7A34','#6E3C10'] },

  { id:'b1', n:'Filter Coffee', c:'Drinks', p:25, veg:1, sp:0, best:1, out:0, r:4.9, rc:'9.7K', min:5,
    rm:'none', g:['coffee'], df:{coffee:'strong'}, ad:[],
    d:'Decoction and boiled milk, pulled between tumbler and davara.',
    tg:['veg','best','drink','budget'],
    ph:P+'1509042239860-f550ce710b93?w=600&q=80&auto=format&fit=crop', a:['#A8703E','#4E2C10'] },
  { id:'b2', n:'Masala Chai', c:'Drinks', p:20, veg:1, sp:0, best:0, out:0, r:4.5, rc:'5.1K', min:5,
    rm:'none', g:['sugar'], df:{sugar:'normal'}, ad:[],
    d:'Ginger, cardamom, plenty of milk.',
    tg:['veg','drink','budget'],
    ph:P+'1571934811356-5cc061b6821f?w=600&q=80&auto=format&fit=crop', a:['#B98B54','#5E3C16'] },
  { id:'b3', n:'Rose Milk', c:'Drinks', p:45, veg:1, sp:0, best:0, out:0, r:4.3, rc:'920', min:4,
    rm:'none', g:['sugar'], df:{sugar:'normal'}, ad:[],
    d:'Chilled milk, rose syrup, a spoon of basil seed.',
    tg:['veg','drink'],
    ph:P+'1626200419199-391ae4be7a41?w=600&q=80&auto=format&fit=crop', a:['#E9C3CE','#8E5F6C'] },
  { id:'b4', n:'Neer Mor', c:'Drinks', p:25, veg:1, sp:0, best:0, out:0, r:4.6, rc:'1.8K', min:3,
    rm:'none', g:[], df:{}, ad:[],
    d:'Spiced buttermilk with ginger and curry leaf. Cools the chilli.',
    tg:['veg','drink','budget'],
    ph:P+'1621263764928-df1444c5e859?w=600&q=80&auto=format&fit=crop', a:['#EDEFE2','#8A8D77'] },

  { id:'s1', n:'Gulab Jamun', c:'Sweets', p:50, veg:1, sp:0, best:1, out:0, r:4.7, rc:'6.4K', min:5,
    rm:'none', g:['sweet-size'], df:{'sweet-size':'reg'}, ad:[],
    d:'Warm milk dumplings in cardamom syrup.',
    tg:['veg','best','sweet','budget'],
    ph:P+'1601303516534-bf0b1eb70744?w=600&q=80&auto=format&fit=crop', a:['#8A5228','#48260F'] },
  { id:'s2', n:'Payasam', c:'Sweets', p:60, veg:1, sp:0, best:0, out:0, r:4.6, rc:'2.0K', min:6,
    rm:'none', g:['sugar'], df:{sugar:'normal'}, ad:[],
    d:'Semiya payasam with cashew, raisin and a thread of saffron.',
    tg:['veg','sweet'],
    ph:P+'1626074353765-517a681e40be?w=600&q=80&auto=format&fit=crop', a:['#EDDCB6','#8B7846'] },
];

/* ==========================================================================
   ART — a drawn stand-in for every dish, matched to what it actually is.

   The old fallback scattered coloured circles from the item's palette, so a
   dosa and a coffee looked identical. These are flat illustrations keyed to
   the dish family: idli gets discs on a banana leaf, dosa gets a folded cone
   with two chutneys, biryani gets a rice mound, filter coffee gets the
   tumbler and davara. Nothing is fetched, so a card is never empty and
   never waits on a network.

   Swap `USE_ART` to false to prefer the real photos in the data.
   ========================================================================== */

/* ==========================================================================
   COMBOS

   "Meal for two" was a starter chip that led nowhere — it parsed to no
   intent, matched no dish, and answered with a shrug and four more chips.
   It's a real thing to order now: a named bundle with a fixed saving, so
   the answer to "feed two of us" is one card and one tap instead of four
   separate searches.

   Quantities are per-item so a combo can carry two coffees without listing
   coffee twice. `off` is the rupee saving against the sum of the parts.
   ========================================================================== */
const COMBOS = [
  { id:'x1', n:'Veg meal for two', k:'Meal for two', veg:true, serves:2, meal:true,
    d:'A full thali to share, a crisp masala dosa, and two filter coffees.',
    l:[['m1',1],['t3',1],['b1',2]], off:40 },
  { id:'x2', n:'Non-veg feast for two', k:'Meal for two', veg:false, serves:2, meal:true,
    d:'Chicken biryani, Chettinad on the side, parotta to mop up, neer mor to cool down.',
    l:[['m2',1],['c1',1],['t7',1],['b4',1]], off:45 },
  { id:'x3', n:'Tiffin breakfast', k:'Breakfast', veg:true, serves:1,
    d:'Two idlis, a medu vada and a filter coffee. The standard morning.',
    l:[['t1',1],['t2',1],['b1',1]], off:15 },
  { id:'x4', n:'Evening snack box', k:'Snacks', veg:true, serves:2,
    d:'Samosa, sambar vada and two masala chais for the 5pm slump.',
    l:[['k1',1],['k2',1],['b2',2]], off:20 },
];

/* exported for the other modules */
window.R=R;
window.COMBOS=COMBOS;
window.G=G;
window.RM=RM;
window.ITEMS=ITEMS;
