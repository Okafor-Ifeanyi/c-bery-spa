import { BookingForm } from './BookingForm';
import { VisitInfo } from './VisitInfo';
import './Reservation.css';

interface ReservationProps {
  service: string;
  onServiceChange: (id: string) => void;
}

export function Reservation({ service, onServiceChange }: ReservationProps) {
  return (
    <section id="visit" className="section visit" aria-labelledby="visit-title">
      <div className="container">
        <div className="section-head">
          {/* tabIndex lets "Book" buttons hand focus here after scrolling. */}
          <h2 id="visit-title" tabIndex={-1}>
            Book a session
          </h2>
          <p>Send a request at any hour. We'll confirm on the number you give us.</p>
        </div>

        <div className="visit__grid">
          <BookingForm service={service} onServiceChange={onServiceChange} />
          <VisitInfo />
        </div>
      </div>
    </section>
  );
}
