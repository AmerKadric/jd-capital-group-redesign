// JD Capital Group /hidden preview: small React "islands" mounted into the
// existing static page. Each one enhances markup that already works on its
// own, so if this script fails the page still shows everything.
//
//   Hero headline   Motion Primitives TextEffect (MIT)    word-by-word reveal, once
//   Why Us stats    React Bits CountUp (MIT + Commons Clause, used as part of this site)
//   Selected Work   Motion Primitives Tilt (MIT)          cards tilt toward the cursor
//   Contact         React Three Fiber + Drei (MIT)        3D gold JD monogram, lazy-loaded
//   Why Us points   Motion Primitives InView (MIT)        slide up the first time they're reached
//   Testimonial     React Bits ScrollReveal (+ GSAP)      words darken as you scroll through the quote
//   Buttons         Motion Primitives Magnetic (MIT)      lean toward the cursor (desktop)
//   FAQ             Motion Primitives Accordion (MIT)     answers slide open and closed
import { useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TextEffect } from './vendor/text-effect.tsx';
import { Tilt } from './vendor/tilt.tsx';
import CountUp from './vendor/CountUp.jsx';
import { InView } from './vendor/in-view.tsx';
import { Magnetic } from './vendor/magnetic.tsx';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './vendor/accordion.tsx';
import ScrollReveal from './vendor/ScrollReveal.jsx';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Moves an existing DOM node inside a React-rendered wrapper, so the
// original markup (links, images, the router's behaviour) is kept as is.
function Adopt({ node }) {
  const ref = useRef(null);
  useLayoutEffect(() => { ref.current.appendChild(node); }, [node]);
  return <div ref={ref} className="fx-adopt" />;
}

function headline() {
  const h1 = document.querySelector('.hero-title');
  if (!h1) return;
  if (!reduced) {
    const lines = [...h1.childNodes]
      .filter(n => n.nodeName !== 'BR' && n.textContent.trim())
      .map(n => ({ text: n.textContent.trim(), accent: n.nodeType === 1 && n.classList.contains('accent-text') }));
    h1.setAttribute('aria-label', lines.map(l => l.text).join(' '));
    // Commit synchronously, so the static headline is never seen swapping out.
    const root = createRoot(h1);
    flushSync(() => root.render(
      <>
        {lines.map((l, i) => (
          <TextEffect key={i} as="span" per="word" preset="fade-in-blur" delay={0.15 + i * 0.28}
            speedReveal={0.9} className={'fx-line' + (l.accent ? ' accent-text' : '')}>
            {l.text}
          </TextEffect>
        ))}
      </>
    ));
  }
  document.documentElement.classList.remove('fx-pending');
}

function stats() {
  document.querySelectorAll('.why-stat-value[data-count]').forEach(el => {
    const d = el.dataset;
    const holder = document.createElement('span');
    // Keep any trailing unit (e.g. <small>/sq ft</small>) after the number.
    [...el.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove());
    el.prepend(holder);
    createRoot(holder).render(
      <CountUp to={Number(d.count)} prefix={d.prefix || ''} suffix={d.suffix || ''}
        separator={d.separator || ''} mode="roll" duration={1.6} easing="easeOut" />
    );
  });
}

function tiltCards() {
  if (reduced || !finePointer) return;
  document.querySelectorAll('.work-cards > .work-card').forEach(card => {
    const wrap = document.createElement('div');
    wrap.className = 'fx-tilt';
    card.before(wrap);
    createRoot(wrap).render(
      <Tilt rotationFactor={12} springOptions={{ stiffness: 220, damping: 22 }} style={{ height: '100%', transformStyle: 'flat' }}>
        <Adopt node={card} />
      </Tilt>
    );
  });
}

function logo() {
  const el = document.getElementById('fx-logo');
  if (!el) return;
  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    import('./logo3d.jsx')
      .then(m => m.mountLogo(el, { reduced }))
      .catch(err => { console.error('[fx] 3D logo failed:', err); el.hidden = true; });
  }, { rootMargin: '600px 0px' });
  io.observe(el);
}

function whyRows() {
  if (reduced) return;
  document.querySelectorAll('.why-list > .why-row').forEach((row, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'fx-why';
    row.before(wrap);
    // Rows sit two to a line: the second of each pair follows a beat later.
    createRoot(wrap).render(
      <InView once viewOptions={{ once: true, margin: '0px 0px -12% 0px' }}
        variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (i % 2) * 0.12 }}>
        <Adopt node={row} />
      </InView>
    );
  });
}

function testimonial() {
  const p = document.querySelector('.home-testimonial blockquote p');
  if (!p) return;
  const text = p.textContent.replace(/\s+/g, ' ').trim();
  const holder = document.createElement('div');
  p.replaceWith(holder);
  // Reduced motion is handled inside: the quote is simply shown.
  createRoot(holder).render(
    <ScrollReveal as="p" baseOpacity={0.16} enableBlur blurStrength={3} baseRotation={0}
      wordAnimationEnd="center center">
      {text}
    </ScrollReveal>
  );
}

function magnets() {
  if (reduced || !finePointer) return;
  document.querySelectorAll('main .btn:not([type="submit"])').forEach(btn => {
    const wrap = document.createElement('span');
    wrap.className = 'fx-magnet';
    btn.before(wrap);
    // 'global': it starts leaning as the cursor approaches, not only once it's on the button.
    createRoot(wrap).render(
      <Magnetic actionArea="global" intensity={0.45} range={150} springOptions={{ stiffness: 180, damping: 16, mass: 0.4 }}>
        <Adopt node={btn} />
      </Magnetic>
    );
  });
}

function faq() {
  const list = document.querySelector('.faq-list');
  if (!list) return;
  const items = [...list.querySelectorAll('details.faq-item')].map(d => ({
    q: d.querySelector('summary span').textContent.trim(),
    a: d.querySelector('p').textContent.trim(),
  }));
  if (!items.length) return;
  list.replaceChildren();
  createRoot(list).render(
    <Accordion className="fx-faq"
      transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
      {items.map((it, i) => (
        <AccordionItem key={i} value={i} className="faq-item">
          <AccordionTrigger className="faq-trigger">
            <span>{it.q}</span>
            <span className="faq-icon" aria-hidden="true" />
          </AccordionTrigger>
          <AccordionContent>
            <p>{it.a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function run(name, fn) {
  try { fn(); } catch (err) { console.error('[fx] ' + name + ' failed:', err); }
}
run('headline', headline);
run('stats', stats);
run('tilt', tiltCards);
run('logo', logo);
run('why', whyRows);
run('testimonial', testimonial);
run('magnets', magnets);
run('faq', faq);
document.documentElement.classList.remove('fx-pending');
