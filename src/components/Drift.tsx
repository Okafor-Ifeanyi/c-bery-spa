import type { CSSProperties, ReactNode } from 'react';
import { useDrift } from '../lib/motion';

interface DriftProps {
  /** Headroom above and below the frame, as a percentage of its height. */
  amount?: number;
  className?: string;
  children: ReactNode;
}

/**
 * The layer between an overflow-hidden frame and its photograph. As the frame
 * crosses the viewport the photo drifts inside it, the hero's parallax applied
 * to every image. The same number sizes the layer (CSS) and bounds the travel
 * (script), so an edge can never show.
 */
export function Drift({ amount = 15, className = '', children }: DriftProps) {
  const ref = useDrift<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`m-drift ${className}`.trim()}
      data-drift={amount}
      style={{ '--drift': amount } as CSSProperties}
    >
      {children}
    </div>
  );
}
