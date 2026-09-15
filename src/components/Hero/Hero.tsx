import { business, formatNaira, whatsappLink } from '../../data/business';
import { services } from '../../data/services';
import { useLagosClock } from '../../hooks/useLagosClock';
import { handleSectionLinkClick } from '../../lib/scrollToSection';
import { ResponsiveImage } from '../ResponsiveImage';
import './Hero.css';

const lowestPrice = Math.min(...services.map((s) => s.price));

export function Hero() {
  const time = useLagosClock();

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <ResponsiveImage
          slot="hero"
          priority
          sizes="(min-width: 900px) 46vw, 100vw"
          className="hero__image"
        />
      </div>

      <div className="hero__content">
        {/* C-berry never closes, so "open now" is always true. */}
        <p className="hero__status">
          <span className="hero__dot" aria-hidden="true" />
          C-berry is open now · <time>{time}</time> in Enugu
        </p>

        <h1 id="hero-title" className="hero__title">
          Unwind at any hour.
        </h1>

        <p className="hero__tagline">{business.tagline}</p>

        <div className="hero__actions">
          <a className="btn btn--primary" href="#visit" onClick={handleSectionLinkClick}>
            Book a session
          </a>
          <a
            className="btn btn--ghost"
            href={whatsappLink("Hi C-berry, I'd like to book a session.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>

        <ul className="hero__facts" aria-label="At a glance">
          <li>Open 24/7</li>
          <li>{services.length} treatments</li>
          <li>From {formatNaira(lowestPrice)}</li>
          <li>G.R.A., Enugu</li>
        </ul>
      </div>
    </section>
  );
}
