// JD Capital Group — /hidden homepage preview only.
// Draws the hairline "Settle" figure into the What We Do card. The figure
// module (js/vendor/hairline-settle.js) is loaded on demand, so no other
// page pays for it. Exposed on window so router.js can re-run it whenever
// this page's <main> is swapped back in.
let settleFigure = null;

function initHiddenPreview() {
  if (settleFigure) { settleFigure.destroy(); settleFigure = null; }

  const el = document.getElementById('settleFigure');
  if (!el) return;

  import('./vendor/hairline-settle.js').then(({ settle }) => {
    if (!el.isConnected) return; // navigated away before it loaded
    settleFigure = settle(el, {
      intensity: 0.6,
      theme: 'light',
      // Walks through its answer on its own until the cursor arrives, so
      // touch screens see it too. Rests for reduced-motion visitors.
      play: true,
      label: 'Twelve scattered tiles sliding into an ordered structure around a central hub',
    });
  }).catch(err => console.error('[hidden] figure failed to load:', err));
}
window.initHiddenPreview = initHiddenPreview;
