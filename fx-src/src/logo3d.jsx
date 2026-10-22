// 3D gold JD monogram for the /hidden contact section (React Three Fiber +
// Drei). The site's mark, built as a solid: the J and D in Source Serif 4
// (OFL, converted to typeface JSON) inside a square frame, in brushed gold.
// It floats and turns toward the cursor. Lit by Drei Lightformers only, so it
// fetches nothing. Renders only while on screen; holds still for reduced motion.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
// Drei's components imported one by one: the package index would pull in
// lazy chunks for video and face tracking that this page never uses.
import { Center } from '@react-three/drei/core/Center.js';
import { Environment } from '@react-three/drei/core/Environment.js';
import { Float } from '@react-three/drei/core/Float.js';
import { Lightformer } from '@react-three/drei/core/Lightformer.js';
import { Text3D } from '@react-three/drei/core/Text3D.js';
import { ExtrudeGeometry, MathUtils, Path, Shape } from 'three';
import font from '../out/jd-serif.typeface.json';

const GOLD = '#b6903f';

// Window-wide pointer, -1..1, so the mark turns toward the cursor anywhere on the page.
const pointer = { x: 0, y: 0 };
function trackPointer() {
  const move = e => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', move, { passive: true });
  return () => window.removeEventListener('pointermove', move);
}

// The square border of the brand mark, as a thin extruded frame.
function Frame() {
  const geometry = useMemo(() => {
    const s = 1.55, t = 0.07;
    const outer = new Shape();
    outer.moveTo(-s, -s); outer.lineTo(s, -s); outer.lineTo(s, s); outer.lineTo(-s, s); outer.lineTo(-s, -s);
    const hole = new Path();
    hole.moveTo(-s + t, -s + t); hole.lineTo(-s + t, s - t); hole.lineTo(s - t, s - t); hole.lineTo(s - t, -s + t); hole.lineTo(-s + t, -s + t);
    outer.holes.push(hole);
    const g = new ExtrudeGeometry(outer, { depth: 0.12, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
    g.center();
    return g;
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={GOLD} metalness={1} roughness={0.32} />
    </mesh>
  );
}

function Mark({ still }) {
  const group = useRef(null);
  useFrame((_, dt) => {
    if (still || !group.current) return;
    const k = 1 - Math.exp(-dt * 3); // eased follow
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, pointer.x * 0.45, k);
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, pointer.y * 0.25, k);
  });
  const body = (
    <group ref={group}>
      <Frame />
      <Center>
        <Text3D font={font} size={1.45} height={0.28} curveSegments={10} letterSpacing={-0.04}
          bevelEnabled bevelSize={0.018} bevelThickness={0.02} bevelSegments={3}>
          JD
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.26} />
        </Text3D>
      </Center>
    </group>
  );
  return still ? body : <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.5}>{body}</Float>;
}

function Scene({ el, reduced }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    const untrack = reduced ? () => {} : trackPointer();
    return () => { io.disconnect(); untrack(); };
  }, [el, reduced]);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.2], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduced ? 'demand' : visible ? 'always' : 'never'}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Mark still={reduced} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, 0, 6]} scale={3} />
      </Environment>
    </Canvas>
  );
}

export function mountLogo(el, { reduced }) {
  createRoot(el).render(<Scene el={el} reduced={reduced} />);
}
