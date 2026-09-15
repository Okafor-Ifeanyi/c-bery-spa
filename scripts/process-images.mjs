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
    alt: 'Candlelit treatment room with amber oil bottles, rolled white towels and dried grasses beside the massage bed' },
  { slot: 'massage', file: 'assets/Massage1.jpg', grade: 'strong',
    alt: 'Woman resting face-down on a massage table, eyes closed and smiling, with smooth hot stones along her back' },
  { slot: 'nails', file: 'assets/Nail_Service.jpg', grade: 'warm',
    alt: 'Hands and feet with glossy nude nails and white French tips, resting on grey satin' },
  { slot: 'facial', file: 'assets/Facial_Treatment.jpg', grade: 'none',
    alt: "Therapist's hands smoothing a cleansing mask across a relaxed woman's face" },
  { slot: 'bodyScrub', file: 'assets/Body_Scrub.jpg', grade: 'warm',
    alt: 'Four open jars of body scrub in pink, grey, brown and cream' },
  { slot: 'gallery4', file: 'assets/Massage3.jpg', grade: 'warm',
    alt: "Therapist's hands pressing warm stones into a woman's back during a hot stone massage" },

  // Unsplash stock (see README image table): replace with C-berry photos before launch
  { slot: 'aromatherapy', file: 'assets/images/unsplash-amber-jars.jpg', grade: 'warm',
    alt: 'Two candles glowing in amber glass jars' },
  { slot: 'gallery1', file: 'assets/images/unsplash-pillar-candles.jpg', grade: 'none',
    alt: 'White pillar candles burning on a wooden table' },
  { slot: 'gallery2', file: 'assets/images/unsplash-stones-on-skin.jpg', grade: 'warm',
    alt: 'Smooth black massage stones resting on bare skin' },
  { slot: 'gallery3', file: 'assets/images/unsplash-candles-eucalyptus.jpg', grade: 'warm',
    alt: 'Lit white pillar candles among eucalyptus leaves in a dark room' },
  { slot: 'gallery5', file: 'assets/images/unsplash-steam-room-candle.jpg', grade: 'warm',
    alt: 'A steam room lit by a single candle and soft ambient light' },
  { slot: 'gallery6', file: 'assets/images/unsplash-amber-oil-bottle.jpg', grade: 'warm',
    alt: 'A hand holding a small amber glass bottle of oil' },
];

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

async function processSource({ slot, file, grade, alt }) {
  const { buffer, width } = await loadGraded(file, grade);
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
      <text x="86" y="380" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" letter-spacing="3" fill="#e6ae6e">OPEN 24/7 · G.R.A., ENUGU</text>
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
