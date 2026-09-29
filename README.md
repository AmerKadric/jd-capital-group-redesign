# JD Capital Group — Website

The live site for JD Capital Group, a private business consulting and growth advisory firm in
Birmingham, Michigan. A complete static rebuild — plain HTML/CSS/JS, no framework, no build step,
no dependencies to install. Every page is a real, directly-loadable HTML file; a small client-side
router layers smooth in-app navigation on top without changing that.

**Live site:** [jd-capitalgrp.com](https://jd-capitalgrp.com)
**Source:** [github.com/AmerKadric/jd-capital-group-redesign](https://github.com/AmerKadric/jd-capital-group-redesign)
**Hosting:** [Vercel](https://vercel.com) (auto-deploys on every push to `main`)

---

## Pages

| Page | File | What's on it |
|---|---|---|
| Home | `index.html` | Hero photo carousel, About/What We Do teaser, Why Us, Contact form |
| About | `about.html` | Company mission, "Areas of Focus," founder profile (Jesse Dhillon) |
| Projects | `projects.html` | Six featured case studies, each with its own photo carousel or video |
| Clients | `clients.html` | Featured client spotlight, coffee/hospitality brand family, testimonial |

### Projects page — current case studies

1. **Lady Jane's Haircuts for Men** — corporate office & flagship salon build-out
2. **Birmingham Roast** — flagship coffee concept, brand launch
3. **Royal Oak Roast** — second location, brand expansion
4. **Plymouth Roast** — third location, brand expansion
5. **Brickell Drive Waterfront Development** — Fort Lauderdale luxury waterfront land sale
6. **Balmoral Building Penthouse Residence** — Birmingham, MI luxury penthouse build-out (video walkthrough instead of a photo carousel)

## File structure

```
JD-Capital-Group-Redesign/
├── index.html, about.html, projects.html, clients.html   The four pages
├── vercel.json                  Clean-URL config (see "Clean URLs" below)
├── css/
│   ├── style.css                 Shared: fonts, colors, header/footer, homepage sections
│   ├── about.css                 About-page-only styles
│   ├── projects.css              Projects-page-only styles (case studies, carousel, video frame, lightbox)
│   └── clients.css               Clients-page-only styles
├── js/
│   ├── main.js                   Persistent header/nav/back-to-top + homepage hero carousel + contact form
│   ├── router.js                 Client-side content router (see below)
│   ├── projects.js               Carousel + lightbox logic for the Projects page
│   └── clients.js                Filter tabs + clickable client cards
└── assets/
    ├── fonts/                    Self-hosted variable fonts (Public Sans, Source Serif 4) — see "Typography"
    ├── favicon/                  Browser tab icon (gold "JD" mark), multiple sizes
    ├── team/jesse.avif           Founder portrait
    ├── graphics/                 detroit-sunset.webp (site-wide fixed background photo), earlier riverfront photo, vector skyline
    ├── clients/                  Client logos (Lady Jane's, the three Roast brands)
    ├── lady-janes/                Lady Jane's project photography
    ├── birmingham-roast/         Birmingham Roast photography
    ├── royal-oak-roast/          Royal Oak Roast photography
    ├── plymouth-roast/           Plymouth Roast photography
    ├── brickell-drive/            Brickell Drive development renderings
    └── penthouse/                 Balmoral Building penthouse walkthrough video
```

All photos and video are used exactly as provided in every case — no cropping, sharpening,
recoloring, or AI enhancement.

## Design system

- **Background:** a Detroit sunset skyline photo (`assets/graphics/detroit-sunset.webp`) is fixed
  behind every page via `body::before` in `css/style.css`, sharp and full-bleed (no blur). The
  header is transparent over it at the top of the page (white type) and turns solid white once
  scrolled. Page heroes show the photo at full strength with white type and a light dark tint on the
  headline side; every other section sits on a translucent `--wash` / `--wash-gray` fill so it shows
  through softly. Change those two tokens to make the photo stronger or fainter below the heroes.
- **Palette:** white/soft-gray backgrounds, navy/charcoal text, gold (`#b6903f`) and gold-light
  (`#d8b876`) accents. The footer and the Projects lightbox/video are the only intentionally dark
  surfaces on the site — everything else is light.
- **Typography:** two self-hosted variable fonts, loaded once in `css/style.css` and referenced
  everywhere via CSS custom properties (`--font-serif`, `--font-sans`) — no component ever
  hardcodes a font name:
  - **Source Serif 4** (headings, eyebrows, case-index labels)
  - **Public Sans** (body text, nav, buttons)

  Fonts are preloaded and use `font-display: optional`, so there's no visible font-swap flash on
  load.
- **Motion:** deliberately restrained — no scroll-reveal animations, no hover "lift," no
  scroll-progress bar. Hover states only change color/shadow. The header condenses on scroll, the
  mobile nav slides in, and the lightbox fades/scales — that's it.

## The client-side router (`js/router.js`)

Every page is a complete, standalone HTML document — a search engine or a no-JS visitor gets full
content with zero JavaScript required. On top of that, `router.js` intercepts clicks on internal
links and swaps only `<main>` (keeping `<header>`, `<footer>`, and the back-to-top button mounted
the whole time), so navigating the site never causes the header to visibly reload or flicker.

**Clean URLs.** Pages are addressed without `.html` (`/about`, `/projects`, `/clients`, and `/` for
home) rather than `/about.html`. This works two ways at once:
- **On Vercel**, `vercel.json` sets `cleanUrls: true`, which serves `about.html`'s content at
  `/about` and auto-redirects anyone who still hits the old `.html` URL.
- **The router itself** normalizes both forms internally (`keyForPath()` in `router.js`), so
  in-app navigation and any old bookmarked `.html` link both resolve correctly either way.

**Section links stay clean too.** "Why Us," "Contact," and the logo scroll smoothly to their
section on the homepage, but intentionally do **not** write `#why-us` / `#contact` / `#top` into
the address bar — the URL always stays on the plain page path.

**No first-visit flash.** A page's own CSS/JS finish loading *before* its content is swapped in,
and the swap waits briefly (max ~0.6s) for the page's first few images, so nothing ever renders
unstyled or pops in. To make that wait near-zero, the router also prefetches: each page's HTML and
CSS/JS start loading on hover/touch of a link, and all pages are quietly warmed once the current page
finishes loading.

**If anything goes wrong** (an unknown page, a network failure, a browser too old for
`fetch`/`DOMParser`), the router falls back to a completely normal full page load — it can never
leave the site in a broken state.

## Contact form

The homepage "Schedule a Consultation" form (`#contactForm` in `index.html`, handled in
`js/main.js`) sends inquiries straight to Jesse's inbox through [Web3Forms](https://web3forms.com),
a free form-to-email service — no backend, and the visitor's email client never opens. The reply-to
is set to the visitor's address, so hitting Reply answers them directly.

The Web3Forms access key goes in the form's `data-access-key` attribute. It's designed to be public,
so it's safe in the HTML. If the attribute is empty, the form falls back to opening the visitor's
email client via `mailto:jesse@jdcapitalgrp.com`. To change which inbox receives inquiries, create a
new key for that address at web3forms.com and swap it in.

## Adding or updating content

- **A new project (photo gallery):** duplicate an existing `<section class="case-study">` block in
  `projects.html` (case-head + carousel markup), then add a matching entry to the `galleries`
  object in `js/projects.js`. Follow the Brickell Drive section as the template.
- **A new project (video):** duplicate the Balmoral Building section in `projects.html` instead —
  it's just a `<div class="carousel"><div class="carousel-frame"><video>...</video></div></div>`,
  no JS changes needed since native video controls handle everything.
- **A new client / brand:** add a card to the `client-grid` in `clients.html` and drop its logo in
  `assets/clients/`.
- **Founder bio / mission copy:** lives directly in `about.html`.

## Local preview

No install step. Either open `index.html` directly in a browser, or run a local server from this
folder (needed for `fetch`-based router navigation to work, since `file://` blocks it in some
browsers):

```
python -m http.server 5500
```

then visit `http://localhost:5500`. Note that clean URLs (`/about` with no `.html`) only resolve
this way in production on Vercel — a plain local static server has no path-rewriting, so use the
`.html` links or `index.html` directly when previewing locally.

## Deployment

The site auto-deploys via Vercel on every push to the `main` branch of the GitHub repo — no manual
build or upload step. To ship a change:

1. Edit the files.
2. Commit and push to `main` on
   [github.com/AmerKadric/jd-capital-group-redesign](https://github.com/AmerKadric/jd-capital-group-redesign).
3. Vercel picks up the push automatically and redeploys, usually within a minute or two.

The domain `jd-capitalgrp.com` is registered separately and points at Vercel via DNS (an `A` record
at the apex and a `CNAME` for `www`); Vercel issues and renews HTTPS automatically.

## Things to consider next

- **Analytics:** no traffic tracking is wired up yet — add Google Analytics / Search Console
  verification tags to each page's `<head>` when you're ready to track visitors.
- **Real-time booking/scheduling:** the site currently has no booking flow (the earlier dedicated
  Services page and its booking modal were removed at your request). If you want to offer bookable
  consultations again later, a Calendly or Acuity Scheduling embed is the fastest way to add that
  without a backend.
- **More projects/clients:** straightforward to add — see "Adding or updating content" above.
