// JD Capital Group /hidden preview: small React "islands" mounted into the
// existing static page. Each one enhances markup that already works on its
// own, so if this script fails the page still shows everything.
//
//   Hero headline   Motion Primitives TextEffect (MIT)    word-by-word reveal, once
//   Why Us stats    React Bits CountUp (MIT + Commons Clause, used as part of this site)
//   Selected Work   Motion Primitives Tilt (MIT)          cards tilt toward the cursor
//   Contact         React Three Fiber + Drei (MIT)        3D gold JD monogram, lazy-loaded
import { useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TextEffect } from './vendor/text-effect.tsx';
import { Tilt } from './vendor/tilt.tsx';
import CountUp from './vendor/CountUp.jsx';

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
      <Tilt rotationFactor={6} springOptions={{ stiffness: 260, damping: 26 }} style={{ height: '100%', transformStyle: 'flat' }}>
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

function run(name, fn) {
  try { fn(); } catch (err) { console.error('[fx] ' + name + ' failed:', err); }
}
run('headline', headline);
run('stats', stats);
run('tilt', tiltCards);
run('logo', logo);
document.documentElement.classList.remove('fx-pending');
