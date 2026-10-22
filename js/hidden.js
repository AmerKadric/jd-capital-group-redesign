// JD Capital Group — /hidden homepage preview only.
// Draws the custom "Skyline" line figure (made with hairline-create) into the
// What We Do card: towers rise toward the cursor. The figure's script
// (js/vendor/hairline-skyline.js) is loaded on demand, so no other page pays
// for it. This page loads without the client-side router (its React effects,
// js/fx/, need full page loads), so it starts itself and runs the homepage's
// own content init (the contact form) too.
let skylineFigure = null;
let skylineScript = null;

function loadSkyline() {
  if (!skylineScript) {
    skylineScript = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'js/vendor/hairline-skyline.js';
      s.onload = resolve;
      s.onerror = () => { skylineScript = null; reject(new Error('Failed to load the skyline figure')); };
      document.body.appendChild(s);
    });
  }
  return skylineScript;
}

function initHiddenPreview() {
  if (skylineFigure) { skylineFigure.destroy(); skylineFigure = null; }

  const el = document.getElementById('skylineFigure');
  if (!el) return;

  loadSkyline().then(() => {
    if (!el.isConnected) return; // navigated away before it loaded
    skylineFigure = window.mountSkyline(el, {
      // Walks the skyline on its own until the cursor arrives, so touch
      // screens see it too. Skipped for reduced-motion visitors.
      play: true,
      label: 'A line drawing of a riverfront city skyline whose towers rise toward the cursor',
    });
  }).catch(err => console.error('[hidden]', err));
}

function initHiddenPage() {
  if (typeof window.initHomeContent === 'function') window.initHomeContent();
  initHiddenPreview();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHiddenPage);
} else {
  initHiddenPage();
}
