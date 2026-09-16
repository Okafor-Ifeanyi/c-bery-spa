import type { CSSProperties } from 'react';
import { featuredReview, supportingReviews, type Review } from '../../data/reviews';
import { useReveal } from '../../lib/motion';
import { Drift } from '../Drift';
import { ResponsiveImage } from '../ResponsiveImage';
import './Reviews.css';

/**
 * Static asymmetric grid: one quote set large in display italic, the rest
 * beneath it. Not a carousel — there are four reviews, and hiding three of
 * them behind controls would be motion for its own sake.
 *
 * Motion (§6b): the featured quote is uncovered line by line, 110ms per line,
 * the way the hero headline is; the three cards beneath rise 48px in sequence;
 * every card's stars fill left to right once the card has landed. Beside the
 * quote, the gold figure wipes up and settles, a beat after the quote, then
 * floats gently as the section scrolls past.
 */
export function Reviews() {
  const revealRef = useReveal<HTMLElement>();
  const words = featuredReview.quote.split(' ');

  return (
    <section id="reviews" className="section reviews" aria-labelledby="reviews-title" ref={revealRef}>
      {/*
        PLACEHOLDER REVIEWS: the quotes below are written copy, not real
        testimony. See src/data/reviews.ts and tickets/LATER-001.
      */}
      <div className="container">
        <div className="section-head" data-reveal="out" data-reveal-kind="head">
          <h2 id="reviews-title">In their words</h2>
          <p>What guests say after a treatment, at whatever hour they came in.</p>
        </div>

        <div className="reviews__feature">
          {/* data-lines: the words are grouped into rendered lines when this arrives. */}
          <figure className="review review--featured" data-reveal="out" data-lines=".m-word">
            <Stars rating={featuredReview.rating} />
            <blockquote className="review__quote">
              <p>
                {words.map((word, index) => (
                  <span key={index}>
                    <span className="m-word">
                      <span>{word}</span>
                    </span>
                    {index < words.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
            </blockquote>
            <figcaption className="review__by">
              <span className="review__name">{featuredReview.name}</span>
              <span className="review__meta">
                {featuredReview.treatment} · {featuredReview.month}
              </span>
            </figcaption>
          </figure>

          {/* Decorative: empty alt. Beside the quote from 900px; below that, a
              faint overlay behind it (Reviews.css). */}
          <div className="reviews__art m-frame" data-reveal="out" data-order={1} aria-hidden="true">
            <Drift amount={10}>
              <ResponsiveImage slot="reviewsArt" sizes="(min-width: 900px) 24vw, 60vw" className="m-zoom" />
            </Drift>
          </div>
        </div>

        <ul className="reviews__grid">
          {supportingReviews.map((review, index) => (
            <li key={review.id} className="reveal-rise" data-reveal="out" data-order={index}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="review">
      <Stars rating={review.rating} />
      <blockquote className="review__quote">
        <p>{review.quote}</p>
      </blockquote>
      <figcaption className="review__by">
        <span className="review__name">{review.name}</span>
        <span className="review__meta">
          {review.treatment} · {review.month}
        </span>
      </figcaption>
    </figure>
  );
}

const STAR_PATH = 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z';

/**
 * Inline SVG, no icon font. Each earned star is an outline with a filled copy
 * laid over it; the copy is what wipes in, one star after another (--s).
 * The rating is read out as text, not as shapes.
 */
function Stars({ rating }: { rating: number }) {
  return (
    <p className="review__stars">
      <span className="visually-hidden">{rating} out of 5</span>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="review__star" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
            <path d={STAR_PATH} />
          </svg>
          {index < rating && (
            <svg
              className="review__star-fill"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              focusable="false"
              style={{ '--s': index } as CSSProperties}
            >
              <path d={STAR_PATH} />
            </svg>
          )}
        </span>
      ))}
    </p>
  );
}
