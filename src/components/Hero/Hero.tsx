import { Fragment, useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { business, formatNaira, whatsappLink } from '../../data/business';
import { services } from '../../data/services';
import { useLagosClock } from '../../hooks/useLagosClock';
import { handleSectionLinkClick } from '../../lib/scrollToSection';
import { runHeroIntro, useDrift } from '../../lib/motion';
import { ResponsiveImage } from '../ResponsiveImage';
import './Hero.css';

const lowestPrice = Math.min(...services.map((s) => s.price));

/**
 * Split into words so the intro can reveal the headline by rendered line
 * (design-plan-motion.md §4). The text content is unchanged, so this reads and
 * copies as one sentence.
 */
const TITLE = 'Unwind at any hour.';
const TITLE_WORDS = TITLE.split(' ');

export function Hero() {
  const time = useLagosClock();
  const heroRef = useRef<HTMLElement>(null);
  const driftRef = useDrift<HTMLDivElement>();

  // Layout effect: the sequence starts before the first paint, so the page is
  // never shown in an in-between state.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    return runHeroIntro(hero);
  }, []);

  return (
    <section id="top" className="hero" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero__media">
        {/*
          Own layer: scroll drift moves this, the warm-up scales the photo
          inside. 30% headroom (§6b: parallax 0.25-0.35). The hero starts centred, so it only ever
          drifts downward, and by at most 30% of its height.
        */}
        <div
          className="hero__parallax m-drift"
          ref={driftRef}
          data-drift="30"
          style={{ '--drift': 30 } as CSSProperties}
        >
          <ResponsiveImage
            slot="hero"
            priority
            sizes="(min-width: 900px) 46vw, 100vw"
            className="hero__image"
          />
        </div>
      </div>

      <div className="hero__content">
        {/* C-berry never closes, so "open now" is always true. */}
        <p className="hero__status">
          <span className="hero__dot" aria-hidden="true" />
          C-berry is open now · <time>{time}</time> in Enugu
        </p>

        <h1 id="hero-title" className="hero__title">
          {TITLE_WORDS.map((word, index) => (
            <Fragment key={index}>
              <span className="hero__word">
                <span className="hero__word-in">{word}</span>
              </span>
              {index < TITLE_WORDS.length - 1 ? ' ' : ''}
            </Fragment>
          ))}
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
