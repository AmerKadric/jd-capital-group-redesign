/**
 * Skyline: a riverfront city block of towers, Detroit-style, with a cluster of
 * round towers (one tall, four shorter) near its middle. The pointer's screen x
 * runs along the avenue; each tower rises toward it on its own spring, falling
 * off with distance, so growth gathers wherever the hand is. Picking reads the
 * towers' rest x, which never moves. At rest the tall round tower carries the
 * bright stroke; under the pointer the bright goes to the nearest tower.
 * The slider is the reach, in towers. The first time it is on screen, the
 * city rises from the ground, tower by tower from the left (45ms apart).
 *
 * The pattern: a continuous field (Terrain's), laid out as a skyline.
 */
const {
  Cam, circ, facing, fit, prism, proj, rings, spring, stepS,
  mk, pointer, put, register, disposer, solid,
} = HL;

const LIFT = 30, TIER = 0.62, PB = 5, RISE = 45; // RISE: ms between towers as the city first rises
// [cx, cy, w, d, h, kind]: "b" a block, "s" a block with a setback, "c" a round tower (w is its radius).
const CITY = [
  [10, 10, 12, 12, 22, "b"], [30, 10, 14, 12, 46, "s"],
  [61.5, 11.5, 4.5, 0, 56, "c"], [78.5, 11.5, 4.5, 0, 60, "c"], [70, 20, 7, 0, 96, "c"], [61.5, 28.5, 4.5, 0, 52, "c"], [78.5, 28.5, 4.5, 0, 54, "c"],
  [106, 10, 12, 14, 62, "s"], [129, 10, 16, 12, 38, "b"], [153, 10, 12, 12, 52, "s"],
  [178, 10, 14, 12, 30, "b"], [198, 10, 10, 10, 18, "b"],
  [16, 32, 12, 10, 14, "b"], [38, 33, 10, 10, 26, "b"], [112, 33, 12, 10, 22, "b"],
  [138, 33, 10, 10, 34, "s"], [163, 32, 14, 10, 20, "b"], [188, 33, 10, 8, 12, "b"],
];

/** The share of the lift at u reaches from the pointer: 1 → .31 at 42% → .09 at the edge and beyond. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094;

const at = (ring, cx, cy) => ring.map((s) => ({ u: s.u + cx, v: s.v + cy, nu: s.nu, nv: s.nv }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.5);
  const box = [[-8, -8, -PB], [208, -8, -PB], [-8, 48, -PB], [208, 48, -PB]];
  CITY.forEach(([cx, cy, , , h]) => box.push([cx, cy, h + LIFT]));
  fit(C, box, 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-8, -8, 208, 48, 10, 2.2);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));

  // Back to front by x + y, so a nearer tower covers a farther one.
  const towers = CITY.map(([cx, cy, w, d, h0, kind]) => {
    const parts = [];
    if (kind === "c") {
      parts.push({ ring: at(circ(w, 24), cx, cy), inner: at(circ(w - 0.9, 24), cx, cy), f0: 0, f1: 1 });
    } else {
      const x0 = cx - w / 2, y0 = cy - d / 2, x1 = cx + w / 2, y1 = cy + d / 2;
      const [r, i] = rings(x0, y0, x1, y1, 2.4, 0.9);
      parts.push({ ring: r, inner: i, f0: 0, f1: kind === "s" ? TIER : 1 });
      if (kind === "s") {
        const [r2, i2] = rings(x0 + 3, y0 + 3, x1 - 3, y1 - 3, 2, 0.9);
        parts.push({ ring: r2, inner: i2, f0: TIER, f1: 1 });
      }
    }
    // Every tower starts flat; the intro sends each one up in turn.
    return { cx, cy, h0, sx: P(cx, cy, 0)[0], parts, sp: spring(0.6, { eps: 0.04 }), drawn: NaN, lit: null };
  }).sort((a, b) => a.cx + a.cy - (b.cx + b.cy));
  towers.forEach((t) => t.parts.forEach((p) => { p.el = solid(g); }));

  // The read-out numbers towers left to right as they appear.
  const byX = towers.slice().sort((a, b) => a.sx - b.sx);
  byX.forEach((t, k) => { t.n = String(k + 1).padStart(2, "0"); t.at = k * RISE; });
  const SP = (byX[byX.length - 1].sx - byX[0].sx) / (byX.length - 1);
  const crown = towers.reduce((a, b) => (b.h0 > a.h0 ? b : a));
  let R = value * SP, over = null, lit = crown, clock = 0, rising = true;

  function draw(t) {
    const h = Math.max(0.6, t.sp.x), on = t === lit;
    if (h === t.drawn && on === t.lit) return;
    t.drawn = h; t.lit = on;
    for (const p of t.parts) {
      put(p.el, prism(P, front, p.ring, p.inner, h * p.f0, h * p.f1));
      p.el.sil.classList.toggle("hi", on);
    }
  }

  // The loop sleeps offscreen, so the intro's clock only runs once the
  // figure is seen: the city rises the first time it comes into view.
  const B = register(stage, (dt) => {
    let m = false;
    if (rising) {
      clock += Math.min(dt, 0.05) * 1000;
      rising = false;
      for (const t of byX) {
        if (t.sp.t === 0.6 && clock >= t.at) t.sp.t = t.h0;
        if (t.sp.t === 0.6) rising = true;
      }
      if (rising) m = true;
    }
    for (const t of towers) { if (stepS(t.sp, dt)) m = true; draw(t); }
    return m;
  });
  bag.add(B.unregister);
  B.wake();

  function retarget() {
    rising = false; // a hand arriving ends the intro: every tower answers it
    if (over === null) {
      for (const t of towers) t.sp.t = t.h0;
      lit = crown; read.textContent = "rest";
    } else {
      for (const t of towers) t.sp.t = t.h0 + LIFT * falloff(Math.abs(t.sx - over) / R);
      lit = byX.reduce((a, b) => (Math.abs(b.sx - over) < Math.abs(a.sx - over) ? b : a));
      read.textContent = `tower ${lit.n}`;
    }
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = p[0]; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v * SP; if (over !== null) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "skyline",
  means: "A riverfront skyline; towers rise toward the pointer, so growth gathers where the hand is.",
  rules: [1, 3, 5, 9],
  range: [1.5, 3, 5],
  tour: [[120, 160], [200, 150], [290, 170], null],
  mount,
});
