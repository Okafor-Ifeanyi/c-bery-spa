/**
 * Builds the favicon set from public/favicon.svg:
 * favicon.ico (16, 32, 48), favicon-32x32.png, icon-192.png, icon-512.png and
 * apple-touch-icon.png (180, full-bleed: iOS rounds the corners itself).
 *
 * Run `npm run icons` after changing favicon.svg.
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SVG = 'public/favicon.svg';
const BERRY = '#a3345a';

const svg = await readFile(SVG, 'utf8');
// iOS masks its own corners, so the touch icon drops the rounded rect.
const squareSvg = svg.replace(/\s*rx="[^"]*"/, '');

const flattened = (source, size) =>
  sharp(Buffer.from(source), { density: 72 * (size / 64) * 2 })
    .resize(size, size)
    .flatten({ background: BERRY })
    .png({ compressionLevel: 9 })
    .toBuffer();

/** An ICO container holding PNG frames, which every current browser reads. */
function ico(frames) {
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...frames.map((f) => f.data)]);
}

// Rounded icons keep their transparent corners; flatten only the square one.
const rounded = (size) =>
  sharp(Buffer.from(svg), { density: 72 * (size / 64) * 2 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

const outputs = {
  'public/favicon-32x32.png': await rounded(32),
  'public/icon-192.png': await rounded(192),
  'public/icon-512.png': await rounded(512),
  'public/apple-touch-icon.png': await flattened(squareSvg, 180),
  'public/favicon.ico': ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await rounded(size) })))),
};

for (const [file, data] of Object.entries(outputs)) {
  await writeFile(file, data);
  console.log(`${file.padEnd(30)} ${(data.length / 1024).toFixed(1)} KB`);
}
