// Builds the favicon and home screen icons from the house emblem in the logo.
//
//   node scripts/make-icons.mjs
//
// Writes src/app/icon.svg, src/app/favicon.ico, src/app/apple-icon.png and
// the web manifest icons in public/icons/. sharp comes with Next.js; pnpm
// doesn't hoist it, so it's resolved from next's own dependencies.

import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(createRequire(import.meta.url).resolve("next"));
const sharp = require("sharp");

const NAVY = "#071a33";
const NAVY2 = "#12294a";
const SKY = "#1fb0f0";
const WHITE = "#ffffff";

// The emblem, drawn on a 512 grid, centred on (256, 256).
const emblem = `
  <g transform="translate(8 4)">
    <!-- blue roof band -->
    <path d="M36 252 L166 150" stroke="${SKY}" stroke-width="24" fill="none"/>
    <!-- chimney -->
    <rect x="300" y="150" width="30" height="70" fill="${SKY}"/>
    <rect x="290" y="132" width="50" height="22" fill="${WHITE}"/>
    <!-- gutter channel -->
    <path d="M362 262 H446 V290 H384 Q366 290 362 274 Z" fill="${SKY}"/>
    <!-- roof and gutter lip -->
    <path d="M40 312 L236 158 L360 250 H452" stroke="${WHITE}" stroke-width="34" fill="none" stroke-linejoin="miter" stroke-miterlimit="10"/>
    <circle cx="236" cy="150" r="7" fill="${NAVY}"/>
    <!-- downpipe end -->
    <rect x="440" y="233" width="20" height="74" fill="${WHITE}"/>
    <!-- water drop -->
    <path d="M450 316 C450 316 430 342 430 356 A20 20 0 0 0 470 356 C470 342 450 316 450 316 Z" fill="${SKY}"/>
    <!-- window -->
    <rect x="207" y="210" width="26" height="26" fill="${WHITE}"/>
    <rect x="239" y="210" width="26" height="26" fill="${WHITE}"/>
    <rect x="207" y="242" width="26" height="26" fill="${WHITE}"/>
    <rect x="239" y="242" width="26" height="26" fill="${WHITE}"/>
  </g>`;

const bg = (rx) => `
  <defs>
    <radialGradient id="g" cx="50%" cy="35%" r="75%">
      <stop offset="0" stop-color="${NAVY2}"/>
      <stop offset="1" stop-color="${NAVY}"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>`;

// scale shrinks the emblem around the centre (maskable icons need a safe zone)
const svg = ({ rx = 0, scale = 1 }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${bg(rx)}<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${emblem}</g></svg>`;

const svgs = {
  tab: svg({ rx: 104, scale: 1.04 }), // browser tab
  apple: svg({ rx: 0, scale: 0.8 }), // iOS rounds the corners itself
  any: svg({ rx: 0, scale: 0.86 }), // Android "any"
  maskable: svg({ rx: 0, scale: 0.68 }), // inside the 80% safe zone
};

const png = (name, size) =>
  sharp(Buffer.from(svgs[name])).resize(size, size).png().toBuffer();

// An .ico holding PNG images, which every current browser reads.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

writeFileSync("src/app/icon.svg", svgs.tab);
writeFileSync(
  "src/app/favicon.ico",
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({ size, data: await png("tab", size) }))
    )
  )
);
writeFileSync("src/app/apple-icon.png", await png("apple", 180));
for (const size of [192, 512]) {
  writeFileSync(`public/icons/icon-${size}.png`, await png("any", size));
  writeFileSync(
    `public/icons/icon-maskable-${size}.png`,
    await png("maskable", size)
  );
}
console.log("Icons written");
