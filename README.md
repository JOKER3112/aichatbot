# Petpooja AI

A mobile-web ordering prototype where the whole order happens in the
conversation — recommend, customise, review, pay, track. No bottom sheets;
every step is a widget in the thread.

## Deploy

No build step. Netlify serves this folder as-is.

**Netlify UI** — drag the folder onto the deploy area, or connect the repo and
leave *Build command* empty with *Publish directory* set to `/`.

**CLI**

```bash
npx netlify deploy --prod --dir .
```

## Run locally

```bash
python3 -m http.server 8000     # or: npx serve .
```

Then open `http://localhost:8000` and use the device toolbar at **390 × 844**.

`file://` won't work — the browser blocks module loading over that scheme.

## Structure

```
index.html            markup only; every behaviour is in js/
css/app.css           tokens, both themes, all components
js/
  data.js             25 dishes, modifier groups, fulfilment modes
  art.js              drawn fallback art, one per dish family
  menu.js             menu access + all price calculation
  cart.js             order state, grouping, fulfilment, totals
  ai.js               parse() -> intent, respond() -> actions
  motion.js           every GSAP tween in the app
  ui-parts.js         icons, helpers, thinking state, chats, island
  app.js              thread, widgets, composer, theme
images/dishes/        one SVG per dish, used as the image fallback
netlify.toml          headers + publish config
```

Scripts load in dependency order as plain `<script>` tags. Each module hangs
one global off `window`, so there is no bundler and nothing to install.

## Images

Cards use the photo URLs in `js/data.js` first, and fall back to
`images/dishes/<id>.svg` if one fails — so a card is never blank, online or
off. To use your own photography, drop `<id>.jpg` into `images/dishes/` and
point the `ph` field at it.

Set `USE_ART = true` in `js/art.js` to skip photos entirely and always use the
drawn art.

## Try it

```
full chicken biryani, spicy, no onion
```

One sentence, one configured card. Then `dine-in` → fill the details →
`checkout`.

Also works: `show bestsellers` · `give me the first one` · `make it full` ·
`add extra sambar` · `Datt 9974596174` · `how long?`

Tap the header title to switch chats. Each conversation keeps its own thread
and its own cart.

## Two rules the code holds to

**The menu is the only source of truth.** No price, ingredient, availability
or prep time is ever invented — every figure derives from `data.js` through
`Menu.unitPrice()`.

**The DOM is correct before any animation runs.** Motion is decoration on top
of an already-correct state. The whole flow completes with GSAP absent, which
the test suite asserts.

## Known deviations

White on `#F36A20` is 3.05:1, under the 4.5:1 AA bar for a button label. It
matches the badge in the Figma frame, so it ships as-is. `#C4520F` clears AA
at 4.60 if you'd rather trade the shade.
