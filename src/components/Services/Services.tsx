import type { MouseEvent } from 'react';
import { formatNaira, whatsappLink } from '../../data/business';
import { services } from '../../data/services';
import { useCentreFocus, useReveal } from '../../lib/motion';
import { Drift } from '../Drift';
import { ResponsiveImage } from '../ResponsiveImage';
import './Services.css';

interface ServicesProps {
  /** Pre-selects the treatment in the booking form and scrolls there. */
  onBook: (serviceId: string) => void;
}

export function Services({ onBook }: ServicesProps) {
  /*
   * This section's gesture (§6b): cards arrive in reading order, 110ms apart,
   * each one wiping up out of a mask while its photo settles from 1.10, and its
   * price and duration landing a beat later. On a phone they arrive one by one.
   */
  const revealRef = useReveal<HTMLElement>();
  const centreRef = useCentreFocus<HTMLUListElement>();

  function handleBook(event: MouseEvent<HTMLAnchorElement>, serviceId: string) {
    event.preventDefault();
    onBook(serviceId);
  }

  return (
    <section
      id="treatments"
      className="section treatments"
      aria-labelledby="treatments-title"
      ref={revealRef}
    >
      <div className="container">
        <div className="section-head" data-reveal="out" data-reveal-kind="head">
          <h2 id="treatments-title">Treatments</h2>
          <p>Four treatments, each one timed and priced up front in naira.</p>
        </div>

        <ul className="treatments__grid" ref={centreRef}>
          {services.map((service, index) => (
            <li
              key={service.id}
              className="treatment reveal-card"
              data-reveal="out"
              data-order={index}
              data-centre=""
            >
              {/* The frame holds still; the photo drifts, settles and tightens inside it. */}
              <div className="treatment__media">
                <Drift>
                  <ResponsiveImage
                    slot={service.image}
                    sizes="(min-width: 1100px) 23vw, (min-width: 640px) 46vw, 100vw"
                    className="treatment__image m-zoom"
                  />
                </Drift>
              </div>
              <div className="treatment__body">
                {/* Menu-style row: name, dotted leader, price. */}
                <div className="treatment__heading">
                  <h3 className="treatment__name">{service.name}</h3>
                  <span className="treatment__leader" aria-hidden="true" />
                  <p className="treatment__price m-after">{formatNaira(service.price)}</p>
                </div>
                <p className="treatment__detail m-after">
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
        </ul>

        {/*
          Closing invitation. It sits in its own centred block between sections,
          the way the reference site handles this kind of prompt: a text-only
          tile inside a photo grid reads as a card that failed to load.
        */}
        <div className="treatments__cta reveal-rise" data-reveal="out">
          <h3>Not sure which to choose?</h3>
          <p>Tell us how you're feeling and we'll suggest a treatment. Someone answers day or night.</p>
          <a
            className="btn btn--ghost"
            href={whatsappLink("Hi C-berry, can you help me choose a treatment?")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
