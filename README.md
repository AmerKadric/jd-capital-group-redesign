# JD Capital Group — Website Redesign

A complete rebuild of jdcapitalgrp.com as a premium consulting/advisory site. Static site — no
build step, no framework, no dependencies. Five pages: a short, high-signal homepage, a dedicated
About page, a Projects showcase (four location carousels), a Clients brand showcase, and shared
styling/scripts. As of the latest revision, the entire site uses a light, white-based palette —
navy/charcoal text and gold accents on white and soft-gray backgrounds — with the exception of the
footer and the Projects lightbox, both kept intentionally dark (see "What changed" below for why).

## Files

```
JD-Capital-Group-Redesign/
├── index.html          Homepage — Hero, About/What We Do teaser, Work teaser, Why Us, Contact
├── about.html            About page — company mission + founder profile (Jesse Dhillon)
├── projects.html         Projects showcase — 4 location carousels (Lady Jane's + 3 Roast locations) + lightbox
├── clients.html          Clients page — featured client, hospitality brand family, filtering, testimonial
├── css/style.css         Shared base styles, header/footer, homepage sections, ambient depth layers
├── css/about.css         About-page-only styles (mission panel, founder profile card)
├── css/projects.css      Projects-page-only styles (case studies, carousel, dark lightbox)
├── css/clients.css       Clients-page-only styles (featured client, brand cards, filter tabs)
├── js/main.js            Persistent header/nav/back-to-top setup + homepage <main> content (hero, contact form)
├── js/router.js          Client-side content router — see "What changed" below
├── js/projects.js        Carousel controller + lightbox gallery logic for the Projects page
├── js/clients.js         Category filter tabs + clickable client cards
└── assets/
    ├── team/jesse.avif          Founder portrait (transparent background)
    ├── lady-janes/               Lady Jane's project photography
    ├── birmingham-roast/         Birmingham Roast photography (broast folder, unedited)
    ├── royal-oak-roast/          Royal Oak Roast photography (roroast folder, unedited)
    ├── plymouth-roast/           Plymouth Roast photography (proast folder, unedited)
    ├── clients/                  Client logos (used exactly as provided, untouched)
    └── graphics/                 Custom vector skyline + Detroit skyline photo
```

## How to preview it yourself

Open `index.html` directly in a browser, or run a local server from this folder:

```
python -m http.server 5500
```

then visit `http://localhost:5500`.

## How to replace the current site

Your current site is live at jdcapitalgrp.com, so how you deploy depends on where it's hosted:

1. **Find your current host** — check the confirmation email from whoever set up jdcapitalgrp.com
   (common ones: GoDaddy, Squarespace, Wix, Shopify, or a plain hosting provider like Bluehost/Namecheap
   with cPanel).
2. **If it's a website builder (Squarespace/Wix/GoDaddy Website Builder):** those platforms don't accept
   raw HTML/CSS/JS files as a drop-in replacement. You'd either rebuild these designs inside their editor,
   or move the domain to a plain host that serves static files (recommended: Netlify, Vercel, or
   Cloudflare Pages — all free for a site like this, and much faster than a builder).
3. **If it's traditional hosting (cPanel/FTP):** connect via FTP or the File Manager, back up the existing
   files, then upload `index.html`, `projects.html`, `css/`, `js/`, and `assets/` to the `public_html` (or
   `www`) root, replacing what's there.
4. **Recommended path if you want the easiest, fastest, most reliable option:** create a free account on
   Netlify or Vercel, drag this folder into their deploy dashboard, get a live URL in under a minute, test
   it, then point your `jdcapitalgrp.com` domain's DNS at it.

Before replacing anything live, back up your current site's files.

## Things to plug in before launch

- **Contact form:** the form currently opens the visitor's email client pre-filled with their message
  (via `mailto:`). That works with zero setup, but for a more seamless experience, connect it to a form
  service like Formspree, Basin, or a simple backend endpoint — swap the `submit` handler in `js/main.js`.
- **More projects:** if there are additional past projects to feature, each one is a self-contained
  `.project-feature` block in `projects.html` plus a 4-image entry in the `galleries` object in
  `js/projects.js` — straightforward to duplicate.
- **Google Business Profile / map:** add a Google Maps embed or link in the Contact section once you
  have an embed code, to reinforce local SEO for "Birmingham Michigan business consulting."
- **Analytics:** add Google Analytics / Search Console verification tags in `<head>` once you're ready
  to track traffic.

## What changed in this revision (client-side router — header never reloads)

**The problem:** this is a plain multi-page site — every nav click was a full browser navigation, which
tears down and rebuilds the entire document, header included. That produced a visible flash/flicker on
every click, which read as unpolished for a firm positioning itself as premium and serious.

**The fix — `js/router.js`, a small "pjax"-style content router.** It intercepts clicks on internal links,
fetches the destination page's HTML in the background, and swaps out only `<main>` (plus that page's
lightbox or booking modal, if it has one) for the new content. The header, footer, and back-to-top button
are never touched — verified in testing by tagging the live header DOM node and confirming it's the exact
same node, not a visually-identical replacement, after five separate client-side navigations.

**What it handles correctly, all verified in-browser:**
- Browser back/forward buttons (via `popstate`) restore the right page and scroll position.
- The URL bar and page `<title>`/meta description update on every navigation, exactly as a real page load would.
- The active nav-link underline updates to match the current page.
- Each page's specific CSS/JS (e.g. `clients.css` + `clients.js`) lazy-loads on first visit and is
  reused after that — confirmed via network trace that navigating to a page you haven't visited yet fetches
  only that page's HTML + its own CSS/JS, nothing already loaded.
- Every page's own interactive JS — the Projects carousel/lightbox, the Clients filter tabs, the
  homepage hero carousel — re-initializes correctly every time you navigate back to that page, not
  just on first load.
- Mobile nav still opens/closes and auto-closes on a link click.
- If anything goes wrong (an unknown page, a network failure, a browser too old for `fetch`/`DOMParser`),
  it falls back to a completely normal full-page navigation — this can never leave the site stuck in a
  broken state; worst case is today's plain-MPA behavior.

**Two real bugs this surfaced and fixed along the way, not just the intended change:**
- `js/projects.js` bound a `document`-level `keydown` listener (for closing the lightbox with Escape)
  inside its init function. Since the router now calls that init function again every time you revisit
  the page, a naively-added listener would have silently accumulated forever — a real memory leak over
  a long session. Fixed by binding the `document` listener exactly once and having it always delegate
  to whichever lightbox is currently live.
- The header's own "Why Us" / "Contact" / logo links used to be written relative to whichever page they
  lived on (`#top` on the homepage, `index.html#top` everywhere else). Once the header stops reloading,
  that inconsistency becomes a real bug — the persisted header could get "stuck" using the wrong page's
  version of those links. Fixed by normalizing every page's header/footer to the same explicit
  `index.html#...` form.

**Nothing about how the site is built changed** — no framework, no build step, no bundler. Every page is
still a complete, valid, directly-loadable HTML document (a search engine or a no-JS visitor gets the
exact same content as before); the router is purely a progressive enhancement layered on top for
JS-enabled in-app navigation.

## What changed in this revision (Services page removed)

The dedicated Services page — `services.html`, `css/services.css`, `js/services.js`, and its booking
modal/calendar flow — has been removed from the site entirely, per your request. Everywhere it was
linked from has been rewired:

- **Navigation** — the "Services" link is gone from the header and footer nav on every remaining page
  (index, About, Projects, Clients).
- **"Schedule a Consultation"** — every instance of this button/link (nav, homepage hero, and the nav-cta
  used site-wide) now points to the homepage's Contact section (`index.html#contact`) instead of the
  removed page, so the call-to-action still goes somewhere useful.
- **Homepage** — the "Services Teaser" banner ("Practical advisory support, booked directly online" →
  "View Services & Book") has been removed entirely, since it existed solely to link to the now-gone page.
- **`js/router.js`** — the `services.html` entry was removed from the router's page registry, so it no
  longer tries to lazy-load `services.css`/`services.js` for a page that doesn't exist.

The 7 service offerings, their prices, and the booking-flow design work documented in the entry below
are no longer live, but the entry is kept as a record of what was built and why.

## What changed in this revision (new Services page with booking flow — later removed, see above)

**Researched the original site first.** The live Services page at jdcapitalgrp.com/services lists
7 bookable sessions through Wix Bookings, each a flat 1-hour slot at a fixed price, with no
descriptive copy anywhere (confirmed via two separate fetches — the main services list and two
individual service detail pages) — just a name, "1 hour," and a price. The 7 services, carried
over exactly, with their real prices:

| Service | Price | Duration |
|---|---|---|
| Project Management | $220 | 1 Hour |
| Operational Consulting | $150 | 1 Hour |
| Corporate Strategy | $170 | 1 Hour |
| Accounting Solutions | $150 | 1 Hour |
| Logistics Solutions | $150 | 1 Hour |
| Customer Support Solutions | $250 | 1 Hour |
| Medical Billing Solutions | $150 | 1 Hour |

No service was renamed, dropped, or invented. Since the original had no descriptions to preserve,
each service card and detail view was given original, polished copy (a description, a category
label, an "includes" list, and a "best for" line) that stays true to what the service name says —
this is the "rewrite the wording, keep the offering" latitude you gave explicit permission for.

**One discrepancy worth flagging:** the original site's individual booking pages list the contact
email as `cashman@ljhaircuts.com`, different from `jesse@jdcapitalgrp.com` used consistently
elsewhere on this site (including the homepage contact form). I standardized on
`jesse@jdcapitalgrp.com` everywhere for consistency rather than introducing a second address — let
me know if bookings should actually route to a different inbox.

**Page structure (`services.html`):** hero section (headline + intro, your suggested copy, lightly
tightened) → a 3-column responsive grid of all 7 service cards (category tag, name, description,
duration/price, "Book This Service" button) → a dark navy closing CTA band ("Not Sure Where to
Start?" → "Schedule a Consultation," linking to the homepage contact section) — matching the
5-section structure you asked for, condensed to fit "not too long or cluttered."

**Booking/calendar flow.** The original site's real scheduling runs on Wix Bookings — a live,
account-linked calendar with real availability, which cannot be replicated with genuine backend
logic on a static, no-backend site. What's built instead is a complete front-end booking flow that
mirrors the original's steps exactly, clearly labeled as a *request* rather than instant
confirmation:

1. Clicking any "Book This Service" button opens a single shared modal (`services.html`'s
   `#bookingModal`, driven by `js/services.js`) split into the service's full detail (description,
   what's included, best-for) on one side and a 3-step booking flow on the other.
2. **Step 1 — calendar.** A real, custom-built month calendar (no library) with prev/next month
   navigation, past dates and Sundays disabled, current month locked from going further back.
3. **Step 2 — time.** Seven fixed time slots (9am–4pm) appear once a date is picked.
4. **Step 3 — contact info.** Name, email, phone, optional notes, with a summary line recapping the
   selected service/date/time above the form.
5. **Submission → confirmation.** Submitting builds a pre-filled `mailto:jesse@jdcapitalgrp.com`
   link (service, date, time, and all contact fields in the body) and opens the visitor's email
   client — the same pattern already used by the homepage contact form — then shows a clear
   confirmation panel ("Request Received... we'll confirm your appointment by email within one
   business day"), so nothing overstates this as real-time calendar-backed booking.

**How to get real calendar-backed booking, if you want it later** (ranked by fit for a static
site like this):
- **Wix Bookings** — since this is what the original site already used, migrating the domain back
  onto Wix (or embedding a Wix Bookings widget via an iframe) is the most direct path to feature
  parity with zero new setup for you.
- **Calendly** — fastest to add to *this* codebase: drop a Calendly embed/link per service into the
  existing "Book This Service" buttons in `services.html`, no backend needed, free tier available.
- **Acuity Scheduling** — similar embed model to Calendly, with more built-in support for
  per-service pricing/duration if you want the pricing shown here to also drive checkout.
- **Google Calendar (Appointment Schedules)** — free if you're already on Google Workspace,
  embeddable similarly to Calendly.
- **Custom backend** — only worth it if you need booking data flowing into your own systems
  (a CRM, invoicing, etc.); every option above is simpler and faster to stand up first.

Whichever you pick, the front-end already built here — the service cards, the modal, the calendar
UI — can stay largely as-is; only the final submission step (currently `mailto:`) would need to
point at the real integration's API or embed.

**Navigation updated everywhere.** Added a `services.html` link to the header and footer nav on
all four other pages (index, About, Projects, Clients), and replaced the homepage's old abstract
8-card "Services" grid (Business Strategy, Growth Consulting, etc. — generic categories, not real
bookable offerings) with a short teaser banner linking to the new dedicated page, matching the
homepage's existing "short teaser → full page" pattern already used for Projects.

**Verified in the browser:** all 7 service cards render with correct names/prices/durations;
clicking a card's button opens the modal pre-populated with that exact service's data; the
calendar correctly disables past dates and Sundays and blocks navigating before the current month;
selecting a date advances to time selection, selecting a time advances to the contact form with a
correct summary line; submitting the form shows the confirmation panel without leaving the page;
closing and reopening the modal with a different service resets cleanly. Also checked mobile
(375px): cards stack to a single column with no horizontal overflow, the modal's two-column layout
collapses to one column and docks to the bottom of the screen, and the calendar/time-slot grids
remain fully usable at that width.

## What changed in this revision (typography — site-wide font pairing swap)

Switched the type system from Cormorant Garamond + Manrope to **Playfair Display + Inter** — one of
your suggested pairings, and a very established combination for consulting/PE/advisory sites. Cormorant
Garamond's lighter, more delicate letterforms read closer to a boutique/editorial brand; Playfair Display
has more contrast and authority at large sizes (it's the pairing behind a lot of premium publication and
consulting-site headlines), and Inter is the de facto standard for corporate/product body text — neutral,
highly legible, and not "playful" or "startup-generic" the way Manrope can read at a glance.

**How this was applied:** the whole site already routed every heading and every paragraph through two
CSS custom properties, `--font-serif` and `--font-sans`, defined once in `css/style.css` and referenced
everywhere else — no page or component ever hardcoded a font name. That meant this was a two-part change
with no exceptions possible:

1. Updated the Google Fonts `<link>` on all four pages (`index.html`, `about.html`, `projects.html`,
   `clients.html`) to load Playfair Display (weights 500/600/700/800, plus 500/600 italic for pull-quotes)
   and Inter (weights 300–800).
2. Updated the two variable definitions in `css/style.css`.

Because of that structure, this automatically covers everything you listed — homepage, About, Projects,
Clients, navigation, buttons, headings, paragraphs, cards, footer — without touching individual
component styles. Confirmed via grep before making the change: zero hardcoded `font-family` declarations
anywhere in the CSS that could have been missed.

**What I didn't change:** the existing type scale, weights, letter-spacing, and line-height (heading
`clamp()` sizing for responsive scaling, uppercase+letter-spaced nav/button/eyebrow treatment, 1.65 body
line-height) were already doing the job you're asking for — consistent hierarchy, readable paragraphs,
deliberate button/nav typography. Swapping in a stronger font pairing on top of that existing structure
is what actually moves the needle here, rather than also re-tuning sizes that weren't the problem.

**Verified in the browser:** confirmed both fonts load and apply on all four pages (not falling back to
Georgia/system sans), confirmed the italic Playfair Display face specifically loads correctly where it's
used (About page's founder pull-quote, Clients page's testimonial), and checked for layout breakage from
the new fonts' different letter widths — no overflow in the fixed-width header nav, no wrapping issues
in the hero title's manually-broken lines, clean at both 1440px desktop and 375px mobile.

## What changed in this revision (gold carousel border + new Lady Jane's photography)

**Border color.** The hero carousel's frame was navy — a dark, near-monochrome pairing with the white
mat that didn't pull in the site's gold accent. Changed to a 3px solid gold (`var(--gold)`) border,
consistent with every other gold accent line used across the site (section eyebrows, chip borders, the
hero edge-caption lines). Confirmed via computed style: `border-color: rgb(182, 144, 63)`.

**All-new Lady Jane's photography.** You added six new, much higher-resolution photos (1020×681 down to
768×512, versus the previous set's 168–408px thumbnails) to the shared `lj` folder. Used five of them,
replacing the old set entirely:

- **Flagship Floor** — the salon floor with barber chairs and the curved glass storefront (new `hero.jpg`)
- **Corporate Office** — wide interior shot with the neon orange scissors sign (new)
- **Brand Signage** — the large illuminated yellow scissors wall piece (new)
- **Conference Room** — glass-walled office space (updated to a sharper version)
- **Broadcast Studio** — the "ON AIR" desk with the LJ-branded news set, a distinctive shot that wasn't
  in the previous set at all

This is a genuine image-quality upgrade, not just a swap — the new photos are large enough that even the
hero carousel's bigger frame displays them near their native resolution rather than upscaling small
thumbnails. Same rule as always: files copied in as provided, no edits.

Updated both places this project's photos appear: the Projects page carousel (now 5 images instead of 4,
new captions matching the new content) and the homepage hero carousel (which pulls from the same
`hero.jpg`, so it picked up the new flagship-floor shot automatically). Verified in the browser: correct
slide/dot/thumbnail counts (5/5/5) on the Projects page, and the lightbox correctly reports "Broadcast
Studio — 5 / 5" for the new fifth image.

**Note on a caching artifact encountered while verifying:** checking the hero image's dimensions
in-browser initially returned the *old* photo's size (408×272) even though the new file was correctly
in place — the browser had cached the old bytes at that same URL from earlier in this session. A
cache-busted fetch of the identical URL confirmed the real, current file is 1020×681 as expected. This
is specific to this dev session reusing the same file paths repeatedly; a first-time visitor to the
deployed site will simply download the current file with no stale cache to contend with.

## What changed in this revision (hero — bigger framed carousel + side captions restored)

Three changes to the hero, all in `.hero-grid` in `css/style.css`:

**Carousel is substantially bigger.** The right-column photo frame grew from 460px to 620px wide (track
now measures 588×441 at typical desktop width, up from 458×344) — verified directly in the browser.

**Added a proper frame border.** The carousel now sits in a white "mat" with 14px padding and a 2px solid
navy border plus a soft shadow, like a matted photograph rather than an image with a thin outline. The
project-name label and dot indicators were moved to be children of the inner image track (rather than
the outer frame) so they overlay the photo correctly instead of sitting in the white mat padding —
verified their positions land just inside the track's edges, not in the border area.

**Side captions are back, and the whole hero is wider.** Restored the "Private Business Consulting /
Birmingham, Michigan / Founded 2019" (left) and "Strategy / Operations / Growth Advisory / Execution"
(right) columns from two revisions ago. To let them sit close to the true page edges as requested, the
hero now uses its own wider stage (`max-width: 1600px`, scoped to just `.hero .container` — every other
section still uses the standard 1180px container) rather than being squeezed into the same width as the
rest of the page. At 1800px viewport width, the left caption sits 125px from the screen edge and the
right caption's outer edge sits 124px from the other side — confirmed via direct measurement, not
eyeballed.

**Responsive behavior (three tiers, all verified by measurement):**
- **≥1360px:** full 4-column layout — left caption, headline, carousel, right caption.
- **1024–1360px:** captions hidden, clean 2-column split (headline + carousel) — there isn't enough room
  for four columns without everything feeling cramped.
- **≤1024px:** headline first, carousel second (both full width), then the two caption columns reappear
  as a side-by-side row underneath. Below 460px, that row drops to a single column.

**Another instance of the same stale-`main.js`-cache issue from last revision** showed up again while
testing the carousel's dot clicks on this exact browser tab/session (confirmed via the same method: the
footer year wasn't populating, meaning the page's own script tag was running a cached copy). This is a
session-local artifact of this tool repeatedly reloading the same URLs, not a real defect — a fresh
visitor's browser has no such stale cache. Verified the actual current code is correct by fetching
`main.js` fresh and evaluating it directly in the page: dot clicks correctly changed the label to
"Plymouth Roast" and swapped in the right image.

## What changed in this revision (homepage hero — corporate split layout + photo carousel)

Replaced last revision's three-column editorial layout with a two-column corporate split, closer to
how firms like IBM structure a hero: text fully left-aligned on one side, a real visual on the other —
nothing centered.

**Left column:** headline (unchanged), a one-sentence subheadline, two CTA buttons. Nothing else — no
eyebrow line, no stat row, no side captions from the previous revision.

**Right column:** a slow, automatic photo carousel showing real photos from the Projects page — Lady
Jane's flagship salon, then Birmingham Roast, Royal Oak Roast, and Plymouth Roast storefronts, each
labeled with a small pill showing the project name. Specifics:

- **Images are the untouched project photos already on the Projects page** (no sharpening, recoloring,
  or edited files) — displayed in a fixed 4:3 frame using `object-fit: cover`, which crops to fill
  without ever stretching or distorting. Verified the active slide renders close to native resolution
  (e.g., Lady Jane's photo displays at a mild 1.12x scale from its 408×272 source — no blur).
- **Rotation:** every 5 seconds (within your 4–6s range), via a 1.1-second opacity crossfade — no slide/
  GIF-style motion.
- **Dot indicators** in the frame's bottom-right jump directly to any photo; the current project name
  shows as a small label in the bottom-left corner.
- **Pause-on-hover:** hovering the frame stops rotation; moving away resumes it.
- **Respects `prefers-reduced-motion`:** if a visitor's system has reduced-motion enabled, the carousel
  displays the first photo and does not auto-rotate.

**Responsive:** below 1024px, the carousel drops below the text column (content-first, matching how
corporate sites handle this on mobile) rather than staying side-by-side. Verified at 375px width: text
first, carousel second, single column, no horizontal overflow.

**A real bug this surfaced and fixed:** while verifying the carousel's click interactions, I discovered
that `main.js`, `projects.js`, and `clients.js` were all using the pattern
`document.addEventListener('DOMContentLoaded', () => {...})`. In this specific long dev session, the
browser was serving a stale cached copy of `main.js` to the page's actual `<script>` tag (confirmed: a
plain `fetch('js/main.js')` returned old pre-refactor content while a cache-busted fetch of the same URL
returned the current file) — a caching artifact of iterating on the same file at the same URL many times
in one session, not something a real first-time visitor would hit. But while tracking it down, I made all
three scripts more resilient regardless: each now checks `document.readyState` and runs immediately if
the document has already finished loading, rather than only ever waiting for an event that may have
already fired. This is a defensive best practice independent of what caused the issue here, and costs
nothing. Confirmed fixed by fetching the current file fresh and evaluating it directly in the page: the
carousel's dot clicks, label updates, and slide switching all work correctly.

## What changed in this revision (homepage hero — editorial layout)

The homepage hero was a single centered column with a lot of unused space on either side at wide
viewports — you correctly flagged that as feeling template-like. Restructured it into a three-column
editorial layout, inside the same `.container` (no change to overall page width):

- **Center column** — unchanged headline, but the subheadline is now one short sentence ("JD Capital
  Group partners with founders and executives to turn ambition into a durable, growing enterprise.")
  instead of three sentences, and the eyebrow line above the headline and the stat row below the buttons
  are both gone — this column is now just headline, one sentence, two buttons.
- **Lower-left column** — a small uppercase label stack with a thin gold left-border: "Private Business
  Consulting," "Birmingham, Michigan," "Founded 2019" (the info that used to be the eyebrow line + one
  of the stat tiles, now repositioned).
- **Lower-right column** — "Strategy," "Operations," "Growth Advisory," "Execution," mirrored with a
  gold right-border and right-aligned text.

The two side columns are bottom-aligned with the CTA button row via CSS Grid (`align-items: end`) —
verified they sit at the exact same baseline as the buttons (718px from viewport top at 1600px width),
regardless of viewport height, so they always read as quiet captions anchored to the action row rather
than floating at an arbitrary height.

**Responsive behavior:** below 1024px, the grid collapses to full-width headline first, then the two
detail columns drop below as a clean two-up row (confirmed: main content spans full width, edge columns
sit side-by-side beneath it). Below 460px, that row itself stacks to a single column so nothing feels
cramped on narrow phones. Verified all three states directly by measuring element positions in the
browser at 1600px, 1000px, and 375px.

## What changed in this revision (removed scroll animations and hover motion)

You noticed that established consulting/investment/advisory firm sites tend not to use fade-ins,
slide-ups, or staggered scroll reveals — content is just there, immediately readable. Removed
site-wide:

- **The scroll-reveal system entirely.** Every section, card, and heading across all four pages had a
  `reveal` class tied to an `opacity: 0` + `translateY(24px)` starting state, animated in via an
  `IntersectionObserver` in `main.js` as it entered the viewport (with a staggered delay per element).
  All of that — the CSS rule, the JS observer, and the `reveal` class itself — is gone. Content now
  renders at full opacity immediately; there's nothing to "load in" as you scroll.
- **The scroll-progress bar** (the thin gold line across the top of the page that filled in as you
  scrolled) — removed along with its JS. It's the kind of detail more at home on a blog or marketing
  template than a consulting firm's site.
- **The drifting background grid texture** — it used to slowly animate (`gridDrift`, a 50-second loop).
  It's now a static texture; same subtle visual, no motion.
- **Hover "lift" on cards and buttons** — service cards, "why us" cards, client cards, and all three
  button variants used to rise a few pixels (`translateY`) on hover. That's removed everywhere; hover
  now only changes border color and shadow depth, which reads as far more restrained.
- **The client-card logo zoom and slide-up reveal** (Clients page) — hovering a hospitality card used to
  scale the logo up 8% and slide the dark detail overlay up from below. Both motions are gone; the
  overlay now does a plain, quick opacity fade, which still reveals the same information but without the
  "movement."
- **The back-to-top button's slide-in entrance** — it used to rise into place as it appeared; it now
  simply fades in.
- **The homepage "Selected Work" thumbnails' staggered lift-on-hover** — removed; hovering now only
  removes the grayscale filter.

**Kept as-is, deliberately:** the sticky header's condensing-on-scroll (a functional, near-universal
pattern, not a decorative reveal), the mobile menu's slide-in panel (necessary for it to be usable at
all), the nav link underline animation (a standard, restrained corporate-site convention), the Projects
lightbox's open/close fade-and-scale (expected modal behavior), and smooth anchor scrolling. None of
these are scroll-triggered content reveals or hover "movement" — they're small functional transitions
that most professional sites still use.

**Testing note:** this preview tool's automation had two separate reliability issues while verifying
this change. First, plain page navigation was intermittently serving a stale cached copy of the HTML
itself (not just CSS/JS as seen in earlier revisions) — confirmed by finding a leftover `reveal` class
in the live DOM that didn't exist in the file on disk. Cache-busting the navigation URL directly
(`?v=<timestamp>`) resolved it, and I re-ran the verification that way. Second, a `requestAnimationFrame`
based check of the Clients page's hover-reveal transition caused the tool to hang and time out entirely
— the same category of issue as the `scrollTo` and screenshot problems noted in earlier revisions. I
verified the CSS itself is correct at the source level instead (confirmed via `element.matches()` that
the hover selector matches, and confirmed the cascade order via direct stylesheet inspection), which is
about as far as this tool would let me go — this is ordinary, well-supported CSS that will behave
correctly in a real browser regardless.

## What changed in this revision (light theme site-wide + 3 new Roast locations)

Two changes landed together this round: the Projects page grew to cover all three Roast locations,
and the entire site's color direction flipped from dark navy to light/white.

### Projects page — Royal Oak Roast and Plymouth Roast added

Each Roast location now has its own full case-study section with its own carousel, matching the
Birmingham Roast pattern from the previous revision:

- **Birmingham Roast** — unchanged photos from last revision (storefront, patio, counter, lounge, wall)
- **Royal Oak Roast** (new) — 5 photos from the `roroast` folder: the illuminated "RO" wordmark, storefront,
  interior counter with the copper ductwork, the "Wake Up. Drink Coffee." brand wall, and marble counter
  seating
- **Plymouth Roast** (new) — 5 photos from the `proast` folder: storefront signage, the "PR" wordmark wall
  with slatted wood lighting, the counter beneath the string-light canopy, an espresso machine detail, and
  the lounge seating area

All photos are unedited originals — no sharpening, recoloring, or cropping — copied directly from your
folders. Birmingham Roast's own copy was trimmed to describe itself as the flagship location (rather
than describing all three brands at once, since each now has its own section), and Royal Oak's and
Plymouth's copy describes them accurately as the second and third locations, built on the flagship's
brand standard. The page now reads "04 Featured Case Studies" in the hero, and there are four case-study
blocks total, alternating white/soft-gray backgrounds for rhythm.

### Site-wide light theme

Every page moved from a dark navy base to white/soft-gray, per your direction that consulting, PE, and
advisory firms tend to favor light, bright sites. Specifics:

- **Backgrounds:** white and soft-gray (`#f4f5f7`) now do the section-separation work that dark navy
  panels used to do — alternating white/gray sections instead of alternating shades of navy.
- **Text:** navy (`#0a1a2e`) for headings, gray-mid (`#6b7280`) for body copy — the same navy that was
  previously an accent-on-dark is now the primary text color everywhere.
- **Gold/bronze:** used the same way as before — eyebrows, stat values, accent lines, chip borders — just
  calibrated to read correctly against light backgrounds instead of dark ones (e.g., filter tabs, focus
  chips, and scope tags all got new border/text values tuned for white/gray, not navy).
- **Header:** was a transparent bar that turned solid dark navy on scroll (a pattern that only makes sense
  over a dark hero). It's now always a light, blurred-white bar that becomes fully opaque with a subtle
  shadow on scroll — navy text, gold hover states. The mobile off-canvas nav panel flipped from dark navy
  to white with navy links for the same reason.
- **Hero sections** (all four pages): dropped the dark radial navy gradient for a soft warm-white/gray
  gradient. The Detroit skyline photo is still there behind the homepage hero, just dialed down to 16%
  opacity under a near-white scrim — a whisper of atmosphere rather than a moody dark backdrop.
- **Carousel "matting":** the Projects page carousel's letterbox background changed from navy to soft-gray
  — this actually reads as more premium in a light theme, like a museum mat around a photograph.

**Two places intentionally stayed dark**, both explained where they live in the code:
- **The footer** — a small, grounding dark band at the very bottom of every page. This is standard
  practice even on predominantly light/white sites (most consulting and PE firm sites do this) and gives
  the page a defined edge rather than fading out.
- **The Projects lightbox and the Clients hospitality-card hover overlay** — both are deliberate,
  transient dark accents (a full-screen photo viewer, and a hover-triggered reveal), not static page
  sections. Dark viewing stages are the standard way to present enlarged photography, and the hover-reveal
  gives the Clients cards a small moment of contrast that would be lost if everything on the page were
  uniformly light.

**Verification note:** this preview tool's screenshot capability was non-functional this session (timed
out repeatedly, including after restarting the dev server), so visual confirmation was done via
computed-style contrast checks instead — I queried the actual rendered text color against its effective
background color for every major heading, body paragraph, and label on all four pages, on both desktop
and mobile widths, to rule out the main risk of this kind of change (invisible white-on-white text left
over from the dark theme). All checks passed. I'd still recommend a quick look yourself before calling it
final, since programmatic contrast checks don't catch everything a human eye would.

## What changed in this revision (Projects page — carousel, original images restored)

**The images are now untouched originals — no exceptions.** Earlier revisions ran the Lady Jane's and
Birmingham Roast photos through an unsharp-mask/contrast pass to compensate for their small source
resolution. That was the wrong call given what you actually wanted, so it's been fully reverted:

- **Lady Jane's** — all 4 images restored byte-for-byte from the original `lj` source folder (verified by
  file size matching the originals exactly: 42,627 / 28,197 / 16,500 / 6,723 bytes).
- **Birmingham Roast** — the exact 4 files used previously could no longer be restored, because the
  source folder (`b`) had since been replaced on disk with a new folder (`broast`) containing a
  different, larger set of real, unedited photos of the same location. I flagged this and you chose to
  use the new photos, so Birmingham Roast now shows 5 fresh images — storefront sign, night patio,
  counter/menu, lounge seating, and the brand wall — none of which have been processed in any way.

Nothing about any image file was cropped, stretched, recolored, sharpened, or otherwise altered — they're
displayed exactly as provided, at or below their native resolution (confirmed: Lady Jane's hero renders
at its exact native 408×272; Birmingham Roast's storefront shot renders at 614×345 against a 680×382
source — a slight *downscale*, so zero blur risk).

**New carousel replaces the contact-sheet grid.** Instead of touching the images, the improvement is
entirely in how they're presented:

- A large image stage (460px tall desktop, 320px mobile) with a dark navy letterboxed background and
  `object-fit: contain` — this is what guarantees no image is ever stretched or cropped oddly, regardless
  of whether it's a landscape storefront shot or a portrait interior shot in the same carousel.
- Gold-outlined circular prev/next arrow buttons, dot indicators, and a thumbnail strip underneath —
  clicking any of the three jumps straight to that image.
- A small gold-bordered caption pill in the corner of the stage naming the current photo (e.g. "Patio
  Seating," "Counter & Menu").
- The track itself is a native horizontally-scrolling, scroll-snap element — this is what gives free,
  smooth touch-swipe support on mobile with zero custom touch-event code, and it's why the arrows/dots/
  thumbs all just tell the browser where to scroll rather than manually animating anything.
- Clicking the main image still opens the existing full-screen lightbox (with its blurred backdrop,
  prev/next, and image counter) for an even closer look — the "click-to-expand" option you asked for.

**Testing note:** this preview tool's automation layer can't simulate scroll actions (confirmed: neither
smooth `scrollTo()` nor a direct `scrollLeft` assignment registers when driven programmatically here —
the same limitation seen earlier in this project with `window.scrollTo`). I verified everything I could
directly — the update logic (dots/thumbnails/caption sync), the lightbox integration, image sizing, and
mobile layout — but the actual swipe/scroll motion itself should be checked in your own browser, where
these are completely standard, well-supported browser behaviors.

## What changed in this revision (new Clients page)

**Researched the original site first, as requested.** The original jdcapitalgrp.com Clients page
(headline simply "CLIENTS") described Lady Jane's as "the world's largest corporately owned Men's
Haircut Company... over 100 locations in 23 states" and Birmingham Roast as "an exquisite boutique
coffee shop... a customer oriented third wave coffee experience." It also carried a real testimonial:
*"Jesse is one of the most dynamic individuals I have had the pleasure to work with... JD Capital has
been a tremendous value add to my company."* — Chad Johnson, CEO of Lady Jane's Haircuts for Men. All
of this real content is now on the new Clients page rather than invented from scratch — the testimonial
in particular is a strong, genuine credibility signal that a generic "trust us" section can't match.

**Logos used exactly as provided.** The four files you placed in the shared folder (`Fist Logo -
Wicked Awesomeville - WRH.png`, `BirminghamRoastLogoVector.png`, `Royal Oak Roast - Black Circle
(1).png`, `PLYMOUTH ROAST LOGO (1).png`) were copied byte-for-byte into `assets/clients/` — no
recoloring, cropping, or regeneration. All four are dark logos (black circle marks, or Lady Jane's
black/orange/yellow fist-and-scissors mark) on transparent backgrounds, so they're displayed on light
panels within the dark page — a black-on-transparent logo placed directly on navy would simply
disappear. Every logo renders at a small fraction of its native resolution (confirmed as low as ~85–240px
displayed from 1,500–2,700px source files), so there's no blur or stretching risk at all.

**Page structure:**
- **Hero** — dark navy with the same vector skyline + gold hero-line treatment used elsewhere on the site.
- **Filter tabs** (All / Grooming / Coffee & Hospitality) — clicking a tab shows or hides the featured
  client section and the hospitality section directly (verified working for all three states).
- **Featured client spotlight for Lady Jane's** — a large horizontal card (logo on a light panel, copy
  on dark) sized noticeably larger than the other three, exactly as you asked for — including the
  category, focus-area tags, the real testimonial, and a "Visit Website" button linking to ladyjanes.com.
- **Coffee & Hospitality Portfolio** — Royal Oak Roast, Birmingham Roast, and Plymouth Roast grouped as
  a matching 3-card row, each linking to drinkroast.com.
- **How We Support Our Clients** — the nine capability areas you listed (business strategy, operational
  improvement, brand development, growth planning, cost reduction, technology & BI, process improvement,
  financial organization, project execution) as a clean chip grid.
- **Closing CTA** back to the homepage contact section.

**Interactivity:**
- Each hospitality card shows its logo by default; hovering (or focusing, for keyboard users) reveals
  an overlay with the description and a "View Brand" button. On touch devices, this overlay is shown
  statically instead of on hover (mobile has no hover state, so the details are just always visible there).
- Clicking anywhere on a card — not just the button — opens the brand's site in a new tab; clicking the
  visible button still works normally without double-firing.
- All external links use `target="_blank" rel="noopener"`.

**Nav updated everywhere.** Added "Clients" to the header and footer navigation on all four other pages
(index, About, Projects, and this page's own nav), positioned between Projects and Why Us.

**One small defensive fix along the way:** testing on mobile surfaced a 16px horizontal-scroll artifact
tied to how this preview tool's mobile emulation measures fixed-position elements against the
pre-scrollbar viewport width. Added `overflow-x: hidden` to the root `<html>` element — the standard,
safe way to guarantee no horizontal scroll can occur site-wide without affecting the sticky founder
card or the scroll-driven header/back-to-top behavior (verified both still work after the change).

## What changed in this revision (content updates, site-wide depth, Projects rebuild)

**Founder bio corrections (about.html):** Jesse is now shown as current Vice President at Lady Jane's
(not "Former"), the locations stat reads "105" instead of "53→105", the $1.5M student-fund stat was
removed from the top callout row and replaced with a "3 — Roast Coffee Shops Founded" stat, and the
Birmingham Roast section was expanded to cover Royal Oak Roast and Plymouth Roast, with more locations
in development. The same expansion is reflected on the Projects page.

**Site-wide visual depth — the "alive, premium" request.** You asked for Detroit skyline imagery, city/
office backgrounds, and more visual depth throughout. I don't have a tool to source real stock
photography, and grabbing images off the internet risks the exact blur/licensing problems you've
already flagged once — so per your choice, I built a custom vector skyline silhouette instead
(`assets/graphics/skyline.svg`): a gold-line building skyline, rendered as an SVG so it's always
perfectly crisp at any size, in your exact navy/gold palette, with zero licensing risk. It's used,
faded into a soft gradient mask, behind: the homepage hero, the homepage contact section (mirrored),
the About page hero (flipped for variety), and the Projects page hero.

Beyond the skyline, three more depth layers were added, applied selectively so no section feels
over-decorated:
- A faint, slowly drifting grid-line texture across the full page background on every page (very low
  opacity — a subtle "alive" texture rather than a visual effect you'd consciously notice).
- Soft blurred gold gradient "glow" blobs positioned behind the About/What We Do, Services, Why Us,
  Mission, and Founder sections — pure CSS, no images, so there's no quality concern.
- These required careful containment: the Founder section has a sticky portrait card, so instead of
  `overflow: hidden` on the whole section (which would have silently broken the sticky behavior), the
  glow sits in its own clipped wrapper layered behind the content.

If you get real photography later (Detroit skyline, your office, team shots), any of these slots can
take a real image in place of the vector graphic — the CSS is set up generically enough to swap.

**Projects page, rebuilt again — closer to the original, upgraded.** The previous version (ghost
numerals behind each case study, animated gold corner-bracket "HUD" frames on hover) was reviewed
against what the original jdcapitalgrp.com Projects page actually was: a plain, text-first, generously
spaced, single-column page with no decorative gimmicks. This revision dials the design back to match
that spirit while keeping the improvements that are genuine upgrades:

- Removed the large ghost-numeral watermarks and the animated corner-bracket hover frames — they read
  as decorative rather than premium once compared to the original's calm, confident restraint.
- Removed the alternating left/right layout between the two case studies. Both projects now use the
  same straightforward flow: title and description first (full width, generous spacing, like the
  original), the photo gallery below it — not a clever 2-column split.
- Kept the compact contact-sheet gallery and the lightbox viewer, since those solve last round's blur
  complaint and are a legitimate upgrade over a plain image — the original apparently had no hover
  states or interactive gallery at all.
- Simplified the tile hover effect to a subtle zoom and caption fade with a gold border highlight,
  instead of the busier bracket animation.
- Added the skyline/glow depth treatment described above to the page hero, tying it visually to the
  rest of the site.

## What changed in an earlier revision (Projects page redesign)

**Root cause of the "blurry" look:** the source photos (from the `New folder/lj` and `New folder/b`
folders you provided) are genuinely small — 408×272px for the landscape shots, 168×253px for the
portrait ones. The previous design displayed the hero image at up to 1400px+ wide (a 62vh-tall
full-bleed banner), which is a 3-4x upscale of a 408px source — that's what was causing the blur, not
a rendering problem. Two things were done about it:

1. **Sharpened the source files.** Applied unsharp masking and a mild contrast/saturation boost to all
   8 images in place (`assets/lady-janes/` and `assets/birmingham-roast/`) — this measurably improves
   perceived crispness and punch, though it can't invent detail that isn't in the original pixels.
2. **Redesigned the layout so images are never displayed larger than roughly their native size.** The
   full-bleed hero banner is gone entirely. Each project's four photos now sit in a "contact-sheet"
   bento grid — one larger tile at ~460×307 (a mild 1.13x scale from the 408×272 source) plus three
   smaller square tiles at ~147×147 (all downscaled from source, so no blur is possible there at all).
   The lightbox viewer caps the enlarged image at 600px wide / 64vh tall instead of the previous
   88vw — for the portrait shots that's actually *smaller* than native resolution.

**New design direction — "case study," not "photo gallery":** each project is now a numbered case
study (Case Study 01 / 02) with a huge, faint ghost numeral watermark behind the copy, alternating
left/right layout between the two projects, and the bento image grid positioned beside the write-up
rather than above it. This shifts the page's visual weight onto typography, spacing, and framing —
things that look sharp regardless of source photo resolution — while the images support the story
instead of carrying the whole page.

**Masking softness deliberately, not accidentally:**
- Every tile has a permanent subtle duotone gradient + film-grain overlay (`mix-blend-mode: overlay`).
  This is a deliberate editorial treatment, not a cover-up — it adds texture that reads as intentional
  and actually helps disguise any residual softness.
- On hover, a gold corner-bracket frame draws in around the tile (a HUD/viewfinder motif) and a small
  caption label slides up — this is built with layered CSS gradients on a single element, no extra
  images.
- The lightbox now shows a heavily blurred, oversized version of the *same* photo as an ambient
  full-screen backdrop behind the sharp, modestly-sized foreground image — a technique used by apps
  like Spotify and Apple Music. It turns the fact that these are small images into an atmospheric
  choice rather than a limitation, and makes the crisp foreground image feel intentionally framed.

**Other additions:** a subtle animated grid-line texture drifts slowly across the page background
(very low opacity, "futuristic" without being distracting), a gold divider between the two case
studies, and an image counter ("2 / 4") in the lightbox.

**Honest caveat:** no redesign can add real detail to a 168px-wide photo. If you have the original
full-resolution photography (from whoever shot these, or the original Wix media library before it
was exported at "small" size), swapping those files into `assets/lady-janes/` and
`assets/birmingham-roast/` (same filenames) would let the hero tile be sized larger with zero quality
tradeoff — everything else about this design would look even better with higher-res source images.

## What changed in this revision (About page)

**About JD Capital Group is now its own page** (`about.html`), reached from the "About" nav link on
every page and from a "Learn More About Us" button on the homepage. Reasons:

- The founder bio is substantial — Jesse's education, ASMSU CFO role, Deloitte background, and the
  full Lady Jane's / Birmingham Roast story — and forcing all of that into a homepage section either
  made the homepage long again or forced the bio down to a thin summary. A dedicated page lets the
  story be told properly without bloating the page visitors land on first.
- The homepage's About section is now a short paragraph plus the "What We Do" mini-grid, unchanged
  in spirit from the prior revision, just lighter — the founder narrative moved out entirely.

**Page structure:** a dark hero ("Built by people who've operated at scale"), a **Mission** section
rewriting the original paragraph into two tighter paragraphs plus a scannable "Areas of Focus" chip
row (the seven focus areas from the original brief), and a **Founder & Principal** section with:

- A sticky portrait card (Jesse's headshot, title, and four quick facts) that stays in view as you
  scroll the bio alongside it on desktop.
- Three stat callouts pulled from the bio ($30M enterprise managed, 53→105 locations, $1.5M student
  fund) so the credibility signals are visible before reading a word of the narrative.
- The bio itself broken into four labeled parts — Foundations, Leading Growth at Lady Jane's Haircuts
  for Men, Birmingham Roast, Beyond the Office — instead of one dense block, so it reads as a
  structured executive profile rather than a raw biography.

**Wording changes from the brief you provided:** grammar and flow were tightened throughout (e.g.
"helped manage $200,000 of a $5 million student investment portfolio" → "helped manage $200,000
within a $5 million student-run investment portfolio" for clarity), but no facts, numbers, employers,
or achievements were altered or embellished — the specific figures ($30M, 53→105 locations, $1.5M)
are exactly as provided.

**Design:** matches the Projects page treatment (dark navy/charcoal, gold-bronze accents, the same
hero pattern) rather than the lighter homepage palette, per your instruction that this should feel
like a distinct, premium page rather than another light content section.

## What changed in the original redesign pass, and why

You asked for the homepage to feel shorter and sharper, and for Projects to feel like the strongest,
most impressive part of the site. Both changes are structural, not cosmetic:

**Homepage cut from ten sections to five.** The previous version had Hero, Trust Strip, About, What We
Do, Services, Projects, Approach, Industries & Engagements, Why Us, Clients & Partners, and Contact —
eleven separate blocks, each with its own heading and padding, making the page feel like it scrolled
forever. The new homepage is: **Hero → About & What We Do (combined) → Services → a slim "Selected Work"
link-out banner → Why Us → Contact.** At 1440px wide, total page height dropped from roughly 10,000px to
under 5,000px — about half.

**About and What We Do are now one section**, not two. The old About section had a two-paragraph bio, a
numbered list of three values with large serif numerals, and a separate quote card — the new version is
one tight paragraph, a row of compact value chips (Integrity First / Built on Respect / Action Over
Analysis), and a single quote line, sitting next to a compact 2×2 "What We Do" grid. Same information,
roughly a third of the vertical space.

**The standalone Approach (4-step process), Industries & Engagements, and Clients & Partners sections
were removed entirely.** None of them were on your required list (who we are, what we do, services, why
trust us, contact), and their content either duplicated ideas already covered elsewhere (the 4-step
process overlapped with What We Do; Clients & Partners overlapped with Why Us) or was generic enough that
cutting it cost nothing. The strongest ideas from Why Us and Clients & Partners were merged into a single
six-item "Why Work With Us" grid.

**Projects moved off the homepage entirely** and into its own dedicated `projects.html`, which is now a
fully dark, gold-accented showcase built specifically to feel like the strongest part of the site:

- **Large featured layout** — each project leads with a full-width, 60vh hero image with a gradient
  overlay carrying the project name, tag, and role, rather than a small card.
- **Hover motion** — the featured image slowly zooms on hover; filmstrip thumbnails zoom and reveal a
  caption label on hover.
- **Horizontal-scrolling filmstrip galleries** — each project's four photos sit in a scroll-snap strip
  with a custom gold scrollbar, more dynamic than a static grid.
- **Lightbox viewer** — clicking any thumbnail (or the "View Gallery" button) opens a full-screen viewer
  with smooth fade/scale transitions, previous/next arrows, keyboard arrow-key and Escape support, and a
  caption per image.
- **Dark navy/charcoal background with gold-bronze accents** throughout, distinct from the homepage's
  lighter palette, so the Projects page reads as a showcase rather than a continuation of the main site.

The homepage now links to this page via a compact "Selected Work" banner (title, two small thumbnails,
one button) rather than embedding the galleries directly — so homepage length stays down while real work
is still one click away and given room to breathe on its own page.

**Everything else — copy tone, color palette, typography, SEO structure, contact section — is unchanged**
from the prior revision; this pass was specifically about length and the Projects experience.
