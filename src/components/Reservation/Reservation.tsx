import { BookingForm } from './BookingForm';
import { VisitInfo } from './VisitInfo';
import { useReveal } from '../../lib/motion';
import './Reservation.css';

interface ReservationProps {
  service: string;
  onServiceChange: (id: string) => void;
}

export function Reservation({ service, onServiceChange }: ReservationProps) {
  /*
   * This section's gesture: the whole panel arrives as one unit from 64px away
   * (§6b), with no internal stagger. Staggering eight form fields would be
   * fussy and would delay the first one; the detail here goes into the
   * micro-interactions instead (design-plan-motion.md §3.1).
   */
  const revealRef = useReveal<HTMLElement>();

  return (
    <section
      id="visit"
      className="section visit"
      aria-labelledby="visit-title"
      ref={revealRef}
    >
      <div className="container">
        <div className="section-head" data-reveal="out" data-reveal-kind="head">
          {/* tabIndex lets "Book" buttons hand focus here after scrolling. */}
          <h2 id="visit-title" tabIndex={-1}>
            Book a session
          </h2>
          <p>Send a request at any hour. We'll confirm on the number you give us.</p>
        </div>

        <div className="visit__grid reveal-unit" data-reveal="out">
          <BookingForm service={service} onServiceChange={onServiceChange} />
          <VisitInfo />
        </div>
      </div>
    </section>
  );
}
