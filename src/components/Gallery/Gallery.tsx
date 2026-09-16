import { useCallback, useRef, useState } from 'react';
import { images, type ImageSlot } from '../../data/images';
import { useCentreFocus, useColumnDrift, useImageFadeIn, useReveal } from '../../lib/motion';
import { Drift } from '../Drift';
import { ResponsiveImage } from '../ResponsiveImage';
import { Lightbox } from './Lightbox';
import './Gallery.css';

/** Order matters: position n takes the grid area .gallery__item--n. */
const GALLERY: ImageSlot[] = ['gallery1', 'gallery2', 'gallery3', 'gallery4', 'gallery5', 'gallery6'];

const SIZES = [
  '(min-width: 768px) 46vw, 100vw',
  '(min-width: 768px) 23vw, 50vw',
  '(min-width: 768px) 23vw, 50vw',
  '(min-width: 768px) 23vw, 50vw',
  '(min-width: 768px) 46vw, 50vw',
  '(min-width: 768px) 46vw, 100vw',
];

/*
 * Motion (§6b). Each tile is uncovered along its own long edge while its photo
 * settles from 1.10 inside it, and the tiles arrive in diagonal waves rather
 * than row by row. The wave is each tile's row + column in the grid, which
 * differs between the phone and desktop layouts (see Gallery.css):
 *
 *   768px+   [1 1 2 3]    waves: 1 | 2,5 | 3,4 | 6
 *            [1 1 4 3]
 *            [5 5 6 6]
 *   phones   [1 1] [1 1] [2 3] [4 5] [6 6]    waves: 1 | 2 | 3,4 | 5,6
 *
 * The two wide tiles open from the left. On desktop the left half of the grid
 * (tiles 1 and 5) drifts against the right half as you pass, so it breathes.
 */
const WAVE = [0, 1, 2, 2, 1, 3];
const WAVE_SM = [0, 1, 2, 2, 3, 3];
const WIDE_TILES = new Set([5, 6]);
const LEFT_HALF = new Set([1, 5]);

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);
  const revealRef = useReveal<HTMLElement>();
  const centreRef = useCentreFocus<HTMLDivElement>();
  const gridRef = useColumnDrift<HTMLUListElement>();
  const fadeIn = useImageFadeIn();

  // Measured live, so the lightbox flies back to whichever photo you're on.
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const originOf = useCallback(
    (index: number) => triggers.current[index]?.getBoundingClientRect() ?? null,
    [],
  );

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title" ref={revealRef}>
      <div className="container" ref={centreRef}>
        <div className="section-head" data-reveal="out" data-reveal-kind="head">
          <h2 id="gallery-title">Soft light, slow hours</h2>
          <p>Warm oils, hot stones and quiet rooms, kept calm day and night.</p>
        </div>

        <ul className="gallery__grid" ref={gridRef}>
          {GALLERY.map((slot, index) => {
            const n = index + 1;
            return (
              <li
                key={slot}
                className={`gallery__item gallery__item--${n} m-frame${
                  WIDE_TILES.has(n) ? ' m-frame--left' : ''
                }`}
                data-reveal="out"
                data-reveal-row=""
                data-order={WAVE[index]}
                data-order-sm={WAVE_SM[index]}
                data-column={LEFT_HALF.has(n) ? 'a' : 'b'}
                data-centre=""
              >
                <button
                  type="button"
                  className="gallery__trigger"
                  ref={(el) => {
                    triggers.current[index] = el;
                  }}
                  onClick={() => setOpenIndex(index)}
                >
                  <span className="visually-hidden">View larger: </span>
                  <Drift>
                    <ResponsiveImage
                      slot={slot}
                      sizes={SIZES[index]}
                      className="gallery__image m-zoom"
                      imgRef={fadeIn}
                    />
                  </Drift>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Lightbox
        items={GALLERY.map((slot) => images[slot])}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={close}
        originOf={originOf}
      />
    </section>
  );
}
