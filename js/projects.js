// JD Capital Group — Projects page: image carousels + lightbox viewer
function initProjectsPage() {

  const galleries = {
    'lady-janes': {
      name: "Lady Jane's Haircuts for Men",
      images: [
        { src: 'assets/lady-janes/hero.jpg', label: 'Flagship Floor' },
        { src: 'assets/lady-janes/detail-1.jpg', label: 'Corporate Office' },
        { src: 'assets/lady-janes/detail-2.jpg', label: 'Brand Signage' },
        { src: 'assets/lady-janes/detail-3.jpg', label: 'Conference Room' },
        { src: 'assets/lady-janes/detail-4.webp', label: 'Broadcast Studio' }
      ]
    },
    'birmingham-roast': {
      name: 'Birmingham Roast',
      images: [
        { src: 'assets/birmingham-roast/storefront.webp', label: 'Storefront' },
        { src: 'assets/birmingham-roast/patio.webp', label: 'Patio Seating' },
        { src: 'assets/birmingham-roast/counter.webp', label: 'Counter & Menu' },
        { src: 'assets/birmingham-roast/lounge.webp', label: 'Lounge Seating' },
        { src: 'assets/birmingham-roast/wall.webp', label: 'Brand Wall' }
      ]
    },
    'royal-oak-roast': {
      name: 'Royal Oak Roast',
      images: [
        { src: 'assets/royal-oak-roast/sign.webp', label: 'RO Wordmark' },
        { src: 'assets/royal-oak-roast/storefront.webp', label: 'Storefront' },
        { src: 'assets/royal-oak-roast/interior.webp', label: 'Interior Counter' },
        { src: 'assets/royal-oak-roast/wall.webp', label: 'Brand Wall' },
        { src: 'assets/royal-oak-roast/counter.webp', label: 'Counter Seating' }
      ]
    },
    'plymouth-roast': {
      name: 'Plymouth Roast',
      images: [
        { src: 'assets/plymouth-roast/storefront.webp', label: 'Storefront' },
        { src: 'assets/plymouth-roast/wall.webp', label: 'PR Wordmark' },
        { src: 'assets/plymouth-roast/counter.webp', label: 'Counter' },
        { src: 'assets/plymouth-roast/espresso.webp', label: 'Espresso Bar' },
        { src: 'assets/plymouth-roast/lounge.webp', label: 'Lounge Seating' }
      ]
    }
  };

  // ---------------------------------------------------------
  // Carousels — one per project, native scroll-snap track so
  // touch devices get free swipe support; arrows/dots/thumbs
  // drive the same scroll position.
  // ---------------------------------------------------------
  function initCarousel(carouselEl) {
    const project = carouselEl.getAttribute('data-project');
    const gallery = galleries[project];
    if (!gallery) return;

    const track = carouselEl.querySelector('.carousel-track');
    const slides = [...carouselEl.querySelectorAll('.carousel-slide')];
    const dots = [...carouselEl.querySelectorAll('.carousel-dot')];
    const thumbs = [...carouselEl.querySelectorAll('.carousel-thumb')];
    const prevBtn = carouselEl.querySelector('.carousel-prev');
    const nextBtn = carouselEl.querySelector('.carousel-next');
    const captionEl = carouselEl.querySelector('[data-caption]');

    let index = 0;

    function updateActive(i) {
      index = i;
      dots.forEach((d, di) => d.classList.toggle('active', di === i));
      thumbs.forEach((t, ti) => t.classList.toggle('active', ti === i));
      if (captionEl) captionEl.textContent = gallery.images[i].label;
    }

    function goTo(i) {
      const clamped = (i + slides.length) % slides.length;
      track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => goTo(i)));

    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const newIndex = Math.round(track.scrollLeft / track.clientWidth);
        updateActive(Math.max(0, Math.min(slides.length - 1, newIndex)));
      }, 100);
    });

    window.addEventListener('resize', () => {
      track.scrollTo({ left: index * track.clientWidth });
    });

    updateActive(0);
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  // ---------------------------------------------------------
  // Lightbox — click any slide to view it larger, with its
  // own prev/next that stay within that project's image set.
  // ---------------------------------------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCount = document.getElementById('lightboxCount');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (!lightbox) return;

  let currentProject = null;
  let currentIndex = 0;

  function render() {
    const gallery = galleries[currentProject];
    const item = gallery.images[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = `${gallery.name} — ${item.label}`;
    lightboxCaption.textContent = `${gallery.name} — ${item.label}`;
    lightboxCount.textContent = `${currentIndex + 1} / ${gallery.images.length}`;
    lightboxBackdrop.style.backgroundImage = `url(${item.src})`;
  }

  function open(project, index) {
    currentProject = project;
    currentIndex = index;
    render();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function step(delta) {
    const gallery = galleries[currentProject];
    currentIndex = (currentIndex + delta + gallery.images.length) % gallery.images.length;
    render();
  }

  document.querySelectorAll('.carousel-slide[data-project][data-index]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const project = trigger.getAttribute('data-project');
      const index = parseInt(trigger.getAttribute('data-index'), 10);
      open(project, index);
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // The router calls initProjectsPage() again every time this page's <main>
  // (and its fresh #lightbox) gets swapped back in. A document-level
  // keydown listener bound fresh on every call would pile up forever since
  // document itself never goes away, so it's bound exactly once and always
  // delegates to whichever close()/step() are current via this shared ref.
  window.__jdProjectsLightboxKeys = { close, step };
  if (!window.__jdProjectsKeydownBound) {
    window.__jdProjectsKeydownBound = true;
    document.addEventListener('keydown', (e) => {
      const liveLightbox = document.getElementById('lightbox');
      const handlers = window.__jdProjectsLightboxKeys;
      if (!liveLightbox || !handlers || !liveLightbox.classList.contains('active')) return;
      if (e.key === 'Escape') handlers.close();
      if (e.key === 'ArrowLeft') handlers.step(-1);
      if (e.key === 'ArrowRight') handlers.step(1);
    });
  }
}
// initProjectsPage() is called by router.js — both on a real page load and
// again every time the Projects page's <main> is swapped back in.
