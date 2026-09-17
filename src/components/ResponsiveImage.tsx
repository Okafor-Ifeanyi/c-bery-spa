import { images, type ImageSlot } from '../data/images';

interface ResponsiveImageProps {
  slot: ImageSlot;
  /** Rendered width hints for the browser's srcset choice. */
  sizes: string;
  className?: string;
  /** Above-the-fold image: load eagerly with high fetch priority. */
  priority?: boolean;
  /** Optional hook for load-time motion (see useImageFadeIn). */
  imgRef?: (img: HTMLImageElement | null) => void;
}

export function ResponsiveImage({
  slot,
  sizes,
  className,
  priority = false,
  imgRef,
}: ResponsiveImageProps) {
  const image = images[slot];
  return (
    <img
      ref={imgRef}
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  );
}
