// JD Capital Group — Clients page: category filtering + clickable cards
function initClientsPage() {

  // ---- Category filter tabs ----
  const filterTabs = document.querySelectorAll('.filter-tab');
  // Each filter shows one section (or all of them).
  const filterSections = {
    grooming: document.querySelector('.featured-client-section'),
    hospitality: document.querySelector('.hospitality-section'),
    realestate: document.querySelector('.realestate-section')
  };

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      Object.entries(filterSections).forEach(([key, section]) => {
        if (section) section.classList.toggle('filtered-out', filter !== 'all' && filter !== key);
      });
    });
  });

  // ---- Whole-card click opens the brand's website (button remains the labeled action) ----
  document.querySelectorAll('.featured-client').forEach(card => {
    const link = card.querySelector('a[target="_blank"]');
    if (!link) return;

    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // let the real link handle its own click
      window.open(link.href, '_blank', 'noopener');
    });
  });
}
// initClientsPage() is called by router.js — both on a real page load and
// again every time the Clients page's <main> is swapped back in.
