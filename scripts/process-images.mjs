/**
 * Resizes, colour-grades and compresses every site image into public/images,
 * builds public/og-image.jpg, and writes src/data/imageManifest.json.
 *
 * Run `npm run images` after adding or swapping a photo. To replace a
 * borrowed stock photo before launch, change its `file` below and re-run.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = 'public/images';
const MANIFEST = 'src/data/imageManifest.json';
const OG_IMAGE = 'public/og-image.jpg';
const WIDTHS = [480, 800, 1200, 1600];
const QUALITY = 74;

/*
 * One grade for the whole page. Cooler photos get a candle-coloured multiply
 * layer so stock and in-house photos read as one set. Photos that are
 * already candlelit keep grade 'none'.
 */
const CANDLE = { r: 230, g: 174, b: 110 };
const GRADES = {
  none: null,
  warm: { brightness: 0.97, saturation: 0.92, overlay: 0.22 },
  strong: { brightness: 0.86, saturation: 0.9, overlay: 0.4 },
};

/** Every image on the page. `slot` is the key components use. */
const SOURCES = [
  // C-berry's own photos
  { slot: 'hero', file: 'assets/Aromatherapy.jpg', grade: 'none',
    alt: 'Candlelit spa treatment room with amber massage-oil bottles, rolled white towels and dried grasses beside the bed' },
  { slot: 'massage', file: 'assets/Massage1.jpg', grade: 'strong',
    alt: 'Smiling woman resting her head on her hands during a massage, with smooth stones placed along her back' },
  { slot: 'facial', file: 'assets/Facial_Treatment.jpg', grade: 'none',
    alt: "Therapist's hands smoothing a cleansing facial mask across a relaxed woman's forehead and cheeks" },
  { slot: 'bodyScrub', file: 'assets/Body_Scrub.jpg', grade: 'warm',
    alt: 'Four open jars of exfoliating body scrub in pink, grey, brown and cream' },
  { slot: 'gallery4', file: 'assets/Massage3.jpg', grade: 'warm',
    alt: "Therapist's hands kneading a woman's upper back during a hot stone massage, with black basalt stones along her spine" },

  // Unsplash stock (see README image table): replace with C-berry photos before launch
  { slot: 'aromatherapy', file: 'assets/images/unsplash-amber-jars.jpg', grade: 'warm',
    alt: 'Two lit aromatherapy candles in labelled amber glass jars, with dried leaves scattered on the table' },
  { slot: 'gallery1', file: 'assets/images/unsplash-pillar-candles.jpg', grade: 'none',
    alt: 'White pillar candles burning beside a sprig of dried autumn leaves on a wooden table' },
  { slot: 'gallery2', file: 'assets/images/unsplash-stones-on-skin.jpg', grade: 'warm',
    alt: 'A line of smooth grey massage stones resting on bare skin' },
  { slot: 'gallery3', file: 'assets/images/unsplash-candles-eucalyptus.jpg', grade: 'warm',
    alt: 'Cluster of lit pillar candles among eucalyptus sprigs in a dim room' },
  { slot: 'gallery5', file: 'assets/images/unsplash-steam-room-candle.jpg', grade: 'warm',
    alt: 'Stone steam room with a heated bench and a row of candles glowing along the back wall' },
  { slot: 'gallery6', file: 'assets/images/unsplash-amber-oil-bottle.jpg', grade: 'warm',
    alt: 'Hands tipping a few drops of essential oil from a small amber dropper bottle' },

  // Artwork beside the featured review: a gold figure supplied on near-white.
  // Only the white is removed (see cutOut) so it floats on the dark page; the
  // artwork itself is shown as supplied. Decorative: empty alt.
  { slot: 'reviewsArt', file: 'assets/testimonials-no-bg.png', grade: 'none', cutout: {}, alt: '' },
];

/*
 * Keying a white background. Only white that is actually background is
 * removed: white reachable from the image border (through pixels closer to
 * white than `reach`), plus enclosed pools of near-pure white (closer than
 * `holeNear`) of at least `holeArea` px, such as the gaps between arms and
 * body. Pale marbling inside the artwork is left solid; its specks are far
 * smaller than `holeArea`. Within the background, opacity ramps from fully
 * clear to fully solid between the `clear` and `solid` distances from white.
 */
const KEY = { clear: 8, solid: 48, reach: 24, holeNear: 12, holeArea: 50 };

/** Marks the pixels that are background, per KEY. `dist` is distance from white. */
function findBackground(dist, width, height) {
  const n = width * height;
  const background = new Uint8Array(n);
  const flood = (seeds, mark, limit, accept) => {
    const stack = [...seeds];
    let area = 0;
    const visited = [];
    while (stack.length) {
      const i = stack.pop();
      if (mark[i] || dist[i] >= limit || !accept(i)) continue;
      mark[i] = 1;
      area++;
      visited.push(i);
      const x = i % width;
      if (x > 0) stack.push(i - 1);
      if (x < width - 1) stack.push(i + 1);
      if (i >= width) stack.push(i - width);
      if (i < n - width) stack.push(i + width);
    }
    return { area, visited };
  };

  const border = [];
  for (let x = 0; x < width; x++) border.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) border.push(y * width, y * width + width - 1);
  flood(border, background, KEY.reach, () => true);

  const seen = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (seen[i] || background[i] || dist[i] >= KEY.holeNear) continue;
    const { area, visited } = flood([i], seen, KEY.holeNear, (j) => !background[j]);
    if (area >= KEY.holeArea) for (const j of visited) background[j] = 1;
  }
  return background;
}

/** Social preview card: built from this slot's photo. */
const OG_SOURCE_SLOT = 'gallery1';

async function loadGraded(file, gradeName) {
  const { data, info } = await sharp(file).rotate().toBuffer({ resolveWithObject: true });
  const grade = GRADES[gradeName];
  if (!grade) return { buffer: data, width: info.width };

  const buffer = await sharp(data)
    .modulate({ brightness: grade.brightness, saturation: grade.saturation })
    .composite([
      {
        input: {
          create: {
            width: info.width,
            height: info.height,
            channels: 4,
            background: { ...CANDLE, alpha: grade.overlay },
          },
        },
        blend: 'multiply',
      },
    ])
    .jpeg({ quality: 95 })
    .toBuffer();
  return { buffer, width: info.width };
}

/** Widths to emit: the standard steps below the source, plus the capped source width. */
function targetWidths(sourceWidth) {
  const max = Math.min(sourceWidth, WIDTHS.at(-1));
  return [...new Set([...WIDTHS.filter((w) => w < max), max])];
}

/**
 * Turns an image supplied on plain white into one with a transparent
 * background, per KEY. Pixels on the edge of the background are made
 * translucent and un-blended from the white, so no pale fringe shows against a
 * dark page. Nothing else about the image changes.
 */
async function cutOut(file) {
  const { data, info } = await sharp(file)
    .rotate()
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const n = width * height;
  const dist = new Uint8Array(n);
  for (let i = 0; i < n; i++) dist[i] = 255 - Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
  const background = findBackground(dist, width, height);

  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const a = background[i] ? Math.max(0, Math.min(1, (dist[i] - KEY.clear) / (KEY.solid - KEY.clear))) : 1;
    for (let c = 0; c < 3; c++) {
      out[i * 4 + c] = a > 0 ? Math.max(0, Math.min(255, Math.round((data[i * 3 + c] - (1 - a) * 255) / a))) : 0;
    }
    out[i * 4 + 3] = Math.round(a * 255);
  }
  const buffer = await sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return { buffer, width };
}

async function processSource({ slot, file, grade, alt, cutout }) {
  const { buffer, width } = cutout ? await cutOut(file) : await loadGraded(file, grade);
  const variants = [];

  for (const w of targetWidths(width)) {
    const name = `${slot}-${w}.webp`;
    const info = await sharp(buffer)
      .resize({ width: w })
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT_DIR, name));
    variants.push({ url: `/images/${name}`, width: info.width, height: info.height, bytes: info.size });
  }

  const largest = variants.at(-1);
  const fallback = variants.filter((v) => v.width <= 800).at(-1) ?? variants[0];

  return {
    slot,
    buffer,
    entry: {
      src: fallback.url,
      srcSet: variants.map((v) => `${v.url} ${v.width}w`).join(', '),
      width: largest.width,
      height: largest.height,
      alt,
    },
    bytes: variants.reduce((sum, v) => sum + v.bytes, 0),
  };
}

async function buildOgImage(buffer) {
  const overlay = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" x2="1">
          <stop offset="0" stop-color="#1c1411" stop-opacity="0.95"/>
          <stop offset="0.6" stop-color="#1c1411" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#1c1411" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#fade)"/>
      <text x="80" y="310" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="128" fill="#f4ebe1">C-berry</text>
      <text x="86" y="380" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" letter-spacing="3" fill="#e6ae6e">DAY SPA · OPEN 24/7 · G.R.A., ENUGU</text>
    </svg>`);

  await sharp(buffer)
    .resize(1200, 630, { fit: 'cover' })
    .composite([{ input: overlay }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(OG_IMAGE);
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const results = await Promise.all(SOURCES.map(processSource));
  const manifest = Object.fromEntries(results.map((r) => [r.slot, r.entry]));
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  await buildOgImage(results.find((r) => r.slot === OG_SOURCE_SLOT).buffer);

  for (const r of results) {
    console.log(`${r.slot.padEnd(13)} ${r.entry.width}x${r.entry.height}  ${(r.bytes / 1024).toFixed(0)} KB total`);
  }
  console.log(`\nWrote ${MANIFEST} and ${OG_IMAGE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
