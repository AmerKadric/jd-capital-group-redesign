// JD Capital Group — lightweight client-side content router
//
// Keeps the header, footer, and back-to-top button permanently mounted
// across internal navigation — they're identical on every page and are
// never touched. Only <main> (plus a page's lightbox or booking modal, if
// it has one) is fetched and swapped in. Falls back to a normal full page
// navigation for anything unexpected — an unknown page, a network failure,
// a browser too old to support fetch/DOMParser — so this can never leave
// the site stuck in a broken state; worst case is today's behavior.
(function () {

  const ROOT_KEY = 'index.html';

  // What each known page needs loaded before its content works, and which
  // globally-exposed function(s) to call afterward. css/js load in
  // parallel; trailingJs loads after (page scripts that expect their
  // dependencies to already be on the page).
  const PAGES = {
    'index.html': {
      css: [],
      js: [],
      trailingJs: [],
      inits: ['initHomeContent']
    },
    'about.html': {
      css: ['css/about.css'],
      js: [],
      trailingJs: [],
      inits: []
    },
    'projects.html': {
      css: ['css/projects.css'],
      js: [],
      trailingJs: ['js/projects.js'],
      inits: ['initProjectsPage']
    },
    'clients.html': {
      css: ['css/clients.css'],
      js: [],
      trailingJs: ['js/clients.js'],
      inits: ['initClientsPage']
    }
  };

  // Track what's already on the page so we never inject a duplicate
  // <link>/<script> for an asset loaded by the original hard page load.
  const loaded = new Set();
  document.querySelectorAll('link[rel="stylesheet"][href], script[src]').forEach(el => {
    loaded.add(el.getAttribute('href') || el.getAttribute('src'));
  });

  function loadCSS(href) {
    if (loaded.has(href)) return Promise.resolve();
    loaded.add(href);
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load ' + href));
      document.head.appendChild(link);
    });
  }

  function loadJS(src) {
    if (loaded.has(src)) return Promise.resolve();
    loaded.add(src);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(script);
    });
  }

  // Accepts both clean paths ("/about") and the old extensioned form
  // ("/about.html"), so links, bookmarks, and manually-typed URLs of either
  // shape resolve to the same page.
  function keyForPath(pathname) {
    const file = pathname.split('/').pop();
    if (!file) return ROOT_KEY;
    return file.includes('.') ? file : file + '.html';
  }

  async function ensureAssets(key) {
    const conf = PAGES[key];
    if (!conf) return;
    await Promise.all((conf.css || []).map(loadCSS).concat((conf.js || []).map(loadJS)));
    for (const src of (conf.trailingJs || [])) await loadJS(src);
  }

  function runInits(key) {
    const conf = PAGES[key];
    if (!conf) return;
    (conf.inits || []).forEach(name => {
      if (typeof window[name] === 'function') {
        try { window[name](); } catch (err) { console.error('[router] init failed:', name, err); }
      }
    });
  }

  function updateActiveNav(key) {
    document.querySelectorAll('#mainNav a').forEach(a => {
      if (a.classList.contains('nav-cta')) return;
      const rawHref = a.getAttribute('href') || '';
      // Links to a section (anything with a "#") are anchors within a page,
      // not page identifiers — they never mark "current page" themselves,
      // matching the original site where the homepage had no nav item
      // marked active either.
      if (rawHref.includes('#')) { a.classList.remove('active'); return; }
      a.classList.toggle('active', rawHref === key);
    });
  }

  // Swaps <main> and any lightbox/booking-modal overlay for the fetched
  // page's versions. Header, footer, and back-to-top are never touched.
  function swapDom(doc) {
    const liveMain = document.querySelector('main');
    const newMain = doc.querySelector('main');
    if (!liveMain || !newMain) return false;
    liveMain.replaceWith(document.adoptNode(newMain));

    const scriptAnchor = document.body.querySelector('script');
    ['lightbox', 'bookingModal'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      const fresh = doc.getElementById(id);
      if (fresh) document.body.insertBefore(document.adoptNode(fresh), scriptAnchor);
    });

    if (doc.title) document.title = doc.title;
    const newDesc = doc.querySelector('meta[name="description"]');
    const curDesc = document.querySelector('meta[name="description"]');
    if (newDesc && curDesc) curDesc.setAttribute('content', newDesc.getAttribute('content') || '');

    document.body.className = doc.body.className;
    return true;
  }

  async function navigate(url, { push = true, isPopstate = false } = {}) {
    const target = new URL(url, location.href);
    const key = keyForPath(target.pathname);

    if (!PAGES[key]) { window.location.href = url; return; }

    let doc;
    try {
      // Fetch the real file (key always has .html), not target.pathname —
      // that keeps this working on a plain static server that doesn't
      // rewrite clean URLs, in addition to Vercel where it does.
      const res = await fetch(key, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    } catch (err) {
      window.location.href = url; // network/parse failure — fall back to a real navigation
      return;
    }

    if (!swapDom(doc)) { window.location.href = url; return; }

    updateActiveNav(key);
    // Intentionally drop target.hash here — the address bar stays on the
    // clean page path even when the click also scrolls to a section.
    if (push) history.pushState({ key }, '', target.pathname);

    try {
      await ensureAssets(key);
    } catch (err) {
      console.error('[router] asset load failed:', err); // content is already swapped; init with what loaded
    }
    runInits(key);

    if (target.hash) {
      const el = document.querySelector(target.hash);
      if (el) el.scrollIntoView({ behavior: isPopstate ? 'auto' : 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }

    const liveMain = document.querySelector('main');
    if (liveMain) {
      liveMain.setAttribute('tabindex', '-1');
      liveMain.focus({ preventScroll: true });
    }
  }

  function isRoutable(a) {
    if (!a || !a.getAttribute) return false;
    const rawHref = a.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#')) return false; // pure same-page hash — let the browser handle it
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    let url;
    try { url = new URL(a.href, location.href); } catch (err) { return false; }
    if (url.origin !== location.origin) return false;
    return !!PAGES[keyForPath(url.pathname)];
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let modified clicks open a new tab as normal

    const a = e.target.closest('a');
    if (!isRoutable(a)) return;

    const targetURL = new URL(a.href, location.href);
    const targetKey = keyForPath(targetURL.pathname);
    const currentKey = keyForPath(location.pathname);

    if (targetKey === currentKey) {
      if (targetURL.hash) {
        const el = document.querySelector(targetURL.hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
          // No history entry here on purpose — the address bar stays clean
          // instead of picking up the section's hash.
        }
      }
      return; // same page with no hash (or a missing hash target) — nothing to route
    }

    e.preventDefault();
    navigate(a.href, { push: true });
  });

  window.addEventListener('popstate', () => {
    navigate(location.href, { push: false, isPopstate: true });
  });

  // Run the current (hard-loaded) page's own content init exactly once,
  // the same way client-side navigation triggers it for every page after.
  async function boot() {
    const key = keyForPath(location.pathname);
    try { await ensureAssets(key); } catch (err) { console.error('[router] boot asset load failed:', err); }
    runInits(key);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
