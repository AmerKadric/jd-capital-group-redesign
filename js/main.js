// JD Capital Group — persistent site chrome (header, mobile nav, back-to-top).
// Runs exactly once per real page load. The header/footer/back-to-top button
// are never removed from the DOM during client-side navigation (see
// router.js), so none of this ever needs to run a second time.
function initChrome() {

  // ---- Header scroll state ----
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', scrollY > 40);
    backToTop.classList.toggle('visible', scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// JD Capital Group — homepage <main> content (hero carousel, contact form).
// Exposed on window so router.js can re-run it every time the homepage's
// <main> is swapped back in via client-side navigation, not just on a real
// page load.
function initHomeContent() {

  // ---- Hero photo carousel (rotates through real project photos) ----
  const heroCarousel = document.getElementById('heroCarousel');

  if (heroCarousel) {
    const slides = [...heroCarousel.querySelectorAll('.hero-carousel-slide')];
    const dots = [...heroCarousel.querySelectorAll('.hero-carousel-dot')];
    const label = document.getElementById('heroCarouselLabel');
    const captions = dots.map(dot => dot.getAttribute('aria-label').replace('Show ', ''));
    const intervalMs = 2000;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, si) => slide.classList.toggle('is-active', si === index));
      dots.forEach((dot, di) => dot.classList.toggle('is-active', di === index));
      if (label) label.textContent = captions[index];
    }

    function start() {
      if (reducedMotion || slides.length < 2) return;
      stop();
      timer = setInterval(() => show(index + 1), intervalMs);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { show(i); start(); });
    });

    heroCarousel.addEventListener('mouseenter', stop);
    heroCarousel.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  // ---- Contact form (static demo — mailto-based, matches the site's
  // no-backend booking flow elsewhere) ----
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const company = document.getElementById('company').value.trim();
      const message = document.getElementById('message').value.trim();

      const subject = encodeURIComponent(`Consultation Request from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`
      );

      window.location.href = `mailto:jesse@jdcapitalgrp.com?subject=${subject}&body=${body}`;
      formNote.textContent = 'Opening your email client to send this inquiry...';
    });
  }
}
window.initHomeContent = initHomeContent;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChrome);
} else {
  initChrome();
}
