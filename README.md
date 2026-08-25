# AutoMD static site

The project is a framework-free multi-page site built with semantic HTML, BEM CSS and native ES modules.

## Local verification

```sh
npm run check
python3 -m http.server 8000
```

Open `http://localhost:8000` and verify the desktop and mobile layouts, keyboard navigation, menu, filters, carousels and form validation. Keep DevTools Console and Network open: there should be no project errors or missing local assets.

## CSS architecture

Source styles stay split by responsibility. `scripts/build-css.mjs` defines their dependency order, isolates page-level rules and generates the only browser-facing stylesheet, `app.css`. Fonts are self-hosted in `assets/fonts`, so pages do not depend on an external font stylesheet. Do not edit `app.css` directly; run `npm run build` after changing a source stylesheet.

CSS classes follow `block`, `block__element`, `block--modifier` and `block__element--modifier`. A modifier must always be used together with its base class.

## Forms

Forms use native browser validation. Add `data-endpoint="/api/request"` (and optionally `method="get"`; POST is used by default) when a backend is available. Until then, the interface explicitly reports demo mode and never claims that an unsent request was delivered.
