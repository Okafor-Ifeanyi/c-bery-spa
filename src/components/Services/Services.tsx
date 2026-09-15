import type { MouseEvent } from 'react';
import { formatNaira, whatsappLink } from '../../data/business';
import { services } from '../../data/services';
import { ResponsiveImage } from '../ResponsiveImage';
import './Services.css';

interface ServicesProps {
  /** Pre-selects the treatment in the booking form and scrolls there. */
  onBook: (serviceId: string) => void;
}

export function Services({ onBook }: ServicesProps) {
  function handleBook(event: MouseEvent<HTMLAnchorElement>, serviceId: string) {
    event.preventDefault();
    onBook(serviceId);
  }

  return (
    <section id="treatments" className="section treatments" aria-labelledby="treatments-title">
      <div className="container">
        <div className="section-head">
          <h2 id="treatments-title">Treatments</h2>
          <p>Five treatments, each one timed and priced up front in naira.</p>
        </div>

        <ul className="treatments__grid">
          {services.map((service) => (
            <li key={service.id} className="treatment">
              <ResponsiveImage
                slot={service.image}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                className="treatment__image"
              />
              <div className="treatment__body">
                {/* Menu-style row: name, dotted leader, price. */}
                <div className="treatment__heading">
                  <h3 className="treatment__name">{service.name}</h3>
                  <span className="treatment__leader" aria-hidden="true" />
                  <p className="treatment__price">{formatNaira(service.price)}</p>
                </div>
                <p className="treatment__detail">
                  {service.detail} · {service.minutes} min
                </p>
                <p className="treatment__description">{service.description}</p>
                <a
                  className="btn btn--ghost treatment__book"
                  href="#visit"
                  onClick={(event) => handleBook(event, service.id)}
                >
                  {service.bookLabel}
                </a>
              </div>
            </li>
          ))}

          {/* Sixth tile: advice on WhatsApp for guests who don't know what to pick. */}
          <li className="treatment treatment--ask">
            <h3 className="treatment__name">Not sure which to choose?</h3>
            <p>
              Tell us how you're feeling on WhatsApp and we'll suggest a treatment,
              day or night.
            </p>
            <a
              className="btn btn--ghost"
              href={whatsappLink("Hi C-berry, can you help me choose a treatment?")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask on WhatsApp
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
