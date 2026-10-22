// Converts the glyphs J and D of a TTF into three.js typeface JSON.
const opentype = require('opentype.js');
const fs = require('fs');
const [,, src, out] = process.argv;
const font = opentype.parse(fs.readFileSync(src).buffer);
const r = (n) => Math.round(n);
const glyphs = {};
for (const ch of ['J', 'D']) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(0, 0, font.unitsPerEm);
  const o = [];
  for (const c of p.commands) {
    // getPath flips y (screen space); typeface JSON wants font space, y up.
    if (c.type === 'M') o.push('m', r(c.x), r(-c.y));
    else if (c.type === 'L') o.push('l', r(c.x), r(-c.y));
    else if (c.type === 'Q') o.push('q', r(c.x), r(-c.y), r(c.x1), r(-c.y1));
    else if (c.type === 'C') o.push('b', r(c.x), r(-c.y), r(c.x1), r(-c.y1), r(c.x2), r(-c.y2));
    else if (c.type === 'Z') o.push('z');
  }
  const bb = g.getBoundingBox();
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.join(' ') };
}
const t = font.tables;
fs.writeFileSync(out, JSON.stringify({
  glyphs,
  familyName: 'Source Serif 4 Display',
  ascender: t.hhea.ascender, descender: t.hhea.descender,
  underlinePosition: t.post.underlinePosition, underlineThickness: t.post.underlineThickness,
  boundingBox: { yMin: t.head.yMin, xMin: t.head.xMin, yMax: t.head.yMax, xMax: t.head.xMax },
  resolution: font.unitsPerEm,
  original_font_information: { copyright: 'Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name Source. SIL Open Font License 1.1', subset: 'J, D' },
}));
console.log('wrote', out, fs.statSync(out).size, 'bytes');
