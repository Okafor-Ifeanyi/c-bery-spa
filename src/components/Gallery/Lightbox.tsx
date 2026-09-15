import { useEffect, useRef } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { ImageAsset } from '../../data/images';

interface LightboxProps {
  items: ImageAsset[];
  /** Index of the open photo, or null when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Built on the native modal <dialog>: the rest of the page becomes inert,
 * Esc closes it, and focus returns to the photo that opened it.
 */
export function Lightbox({ items, index, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const isOpen = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      closeRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Fires for Esc, the Close button and backdrop clicks alike.
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
    if (event.target === dialogRef.current) dialogRef.current?.close();
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
          <img
            className="lightbox__image"
            src={item.src}
            srcSet={item.srcSet}
            sizes="92vw"
            width={item.width}
            height={item.height}
            alt={item.alt}
          />
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
        <button ref={closeRef} type="button" className="btn btn--primary" onClick={() => dialogRef.current?.close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}
