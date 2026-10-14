// JD Capital Group — Clients page: category filtering + clickable cards
function initClientsPage() {

  // ---- Category filter tabs ----
  const filterTabs = document.querySelectorAll('.filter-tab');
  const featuredSection = document.querySelector('.featured-client-section');
  const hospitalitySection = document.querySelector('.hospitality-section');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      if (!featuredSection || !hospitalitySection) return;

      featuredSection.classList.toggle('filtered-out', filter === 'hospitality');
      hospitalitySection.classList.toggle('filtered-out', filter === 'grooming');
    });
  });

  // ---- Whole-card click opens the brand's website (button remains the labeled action) ----
  document.querySelectorAll('.client-card, .featured-client').forEach(card => {
    const link = card.querySelector('a[target="_blank"]');
    if (!link) return;

    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // let the real link handle its own click
      window.open(link.href, '_blank', 'noopener');
    });
  });

  // ---- Capability explorer ----
  // Desktop (>=1025px): list + panel; exactly one capability is always
  // shown, and hovering a name (with a mouse) shows it too.
  // Narrower screens: tap-to-open cards, one open at a time, all may close.
  const capItems = [...document.querySelectorAll('.support-item')];
  const desktop = window.matchMedia('(min-width: 1025px)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function setOpen(item, open) {
    item.classList.toggle('is-open', open);
    item.querySelector('.support-toggle').setAttribute('aria-expanded', String(open));
    item.querySelector('.support-detail').hidden = !open;
  }
  function show(item) {
    capItems.forEach(other => setOpen(other, other === item));
  }

  capItems.forEach(item => {
    const toggle = item.querySelector('.support-toggle');
    toggle.addEventListener('click', () => {
      if (desktop.matches) { show(item); return; }
      const opening = !item.classList.contains('is-open');
      capItems.forEach(other => setOpen(other, false));
      setOpen(item, opening);
    });
    toggle.addEventListener('mouseenter', () => {
      if (desktop.matches && canHover.matches && !item.classList.contains('is-open')) show(item);
    });
  });

  // Desktop always shows one panel; if none is open when switching up to
  // desktop width, show the first.
  function ensureOne() {
    if (desktop.matches && capItems.length && !capItems.some(i => i.classList.contains('is-open'))) {
      show(capItems[0]);
    }
  }
  ensureOne();
  desktop.addEventListener('change', ensureOne);
}
// initClientsPage() is called by router.js — both on a real page load and
// again every time the Clients page's <main> is swapped back in.
