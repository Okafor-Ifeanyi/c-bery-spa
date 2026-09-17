import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { ImageAsset } from '../../data/images';
import { LIGHTBOX, flipImage, prefersReducedMotion } from '../../lib/motion';

interface LightboxProps {
  items: ImageAsset[];
  /** Index of the open photo, or null when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Live rect of the thumbnail for a given photo, for the FLIP transition. */
  originOf?: (index: number) => DOMRect | null;
}

/**
 * Built on the native modal <dialog>: the rest of the page becomes inert,
 * Esc closes it, and focus returns to the photo that opened it.
 *
 * Motion (design-plan-motion.md §3): the photo flies from its thumbnail to full
 * size and back again, and the arrows cross-fade rather than sliding a strip.
 * Both degrade to a plain open under reduced motion.
 */
export function Lightbox({ items, index, onIndexChange, onClose, originOf }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const closing = useRef(false);
  const shownIndex = useRef<number | null>(null);
  /** The photo being faded out by the arrows; held only for the cross-fade. */
  const [outgoing, setOutgoing] = useState<ImageAsset | null>(null);
  const isOpen = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      closeRef.current?.focus();

      // Measured and applied synchronously after showModal, so no frame is
      // ever painted with the photo already at full size.
      const from = index !== null ? (originOf?.(index) ?? null) : null;
      if (from && imageRef.current && index !== null) {
        flipImage(imageRef.current, from, items[index]);
      }
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
    // items and originOf are stable for the life of the gallery.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /** Runs the close FLIP first, then actually closes the dialog. */
  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || closing.current) return;

    const from = index !== null ? (originOf?.(index) ?? null) : null;
    const animation =
      from && imageRef.current && index !== null
        ? flipImage(imageRef.current, from, items[index], true)
        : null;

    if (!animation) {
      dialog.close();
      return;
    }

    closing.current = true;
    dialog.dataset.closing = 'true';
    animation.onfinish = () => {
      closing.current = false;
      delete dialog.dataset.closing;
      dialog.close();
    };
  }, [index, items, originOf]);

  // Esc reaches the dialog as `cancel`; take it over so the photo flies home.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      requestClose();
    };
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [requestClose]);

  // Fires however the dialog ended up closed.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      onClose();
      openerRef.current?.focus();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  // Arrow navigation: hold the old photo underneath and cross-fade to the new.
  useEffect(() => {
    const previous = shownIndex.current;
    shownIndex.current = index;

    if (index === null) {
      setOutgoing(null);
      return;
    }
    if (previous === null || previous === index || prefersReducedMotion()) return;

    setOutgoing(items[previous]);
    imageRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: LIGHTBOX.cross.dur,
      easing: 'linear',
    });
    const timer = window.setTimeout(() => setOutgoing(null), LIGHTBOX.cross.dur);
    return () => window.clearTimeout(timer);
  }, [index, items]);

  const step = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + items.length) % items.length);
  };

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'Tab') {
      // Chromium can land Tab on document.body instead of wrapping; cycle manually.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href]',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  // A click on the dialog element itself (not its content) is a backdrop click.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) requestClose();
  }

  const item = index === null ? null : items[index];

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label="Photo viewer"
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {item && index !== null && (
        <figure className="lightbox__figure">
          <div className="lightbox__stage">
            {outgoing && (
              <img
                className="lightbox__image lightbox__image--out"
                src={outgoing.src}
                srcSet={outgoing.srcSet}
                sizes="92vw"
                width={outgoing.width}
                height={outgoing.height}
                alt=""
                aria-hidden="true"
              />
            )}
            <img
              ref={imageRef}
              className="lightbox__image"
              src={item.src}
              srcSet={item.srcSet}
              sizes="92vw"
              width={item.width}
              height={item.height}
              alt={item.alt}
            />
          </div>
          <figcaption className="lightbox__caption" aria-live="polite">
            <span className="lightbox__count">
              {index + 1} / {items.length}
            </span>
            {item.alt}
          </figcaption>
        </figure>
      )}

      <div className="lightbox__controls">
        <button type="button" className="btn btn--ghost" onClick={() => step(-1)}>
          Previous
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => step(1)}>
          Next
        </button>
        <button ref={closeRef} type="button" className="btn btn--primary" onClick={requestClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
