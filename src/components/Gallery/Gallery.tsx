import { useCallback, useState } from 'react';
import { images, type ImageSlot } from '../../data/images';
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

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-head">
          <h2 id="gallery-title">Soft light, slow hours</h2>
          <p>Warm oils, hot stones and quiet rooms, kept calm day and night.</p>
        </div>

        <ul className="gallery__grid">
          {GALLERY.map((slot, index) => (
            <li key={slot} className={`gallery__item gallery__item--${index + 1}`}>
              <button type="button" className="gallery__trigger" onClick={() => setOpenIndex(index)}>
                <span className="visually-hidden">View larger: </span>
                <ResponsiveImage slot={slot} sizes={SIZES[index]} className="gallery__image" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Lightbox
        items={GALLERY.map((slot) => images[slot])}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={close}
      />
    </section>
  );
}
