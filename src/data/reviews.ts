/*
 * ============================================================================
 * PLACEHOLDER REVIEWS — NOT REAL CUSTOMERS. DO NOT LAUNCH WITH THESE.
 * ============================================================================
 *
 * Every quote, name, rating and date below is written copy, not testimony. No
 * one in this file is a real C-berry guest. They exist so the Reviews section
 * can be designed, laid out and reviewed against real-shaped content.
 *
 * Before launch, replace all of them with reviews collected from real guests
 * with their permission (tickets/LATER-001), and do not add `aggregateRating`
 * to the JSON-LD in index.html until the reviews are both real and collected
 * on this site — Google's rules treat self-serving markup as a penalty.
 *
 * The brief (§8) allows marked placeholders and forbids fabricated reviews
 * presented as real, which is why nothing here claims to be verified, and why
 * the section carries a source note in the markup.
 */

export interface Review {
  id: string;
  /** First name and last initial, which is the format real ones will use. */
  name: string;
  /** Out of 5. */
  rating: number;
  quote: string;
  /** Treatment the review is about. */
  treatment: string;
  /** Month of the visit. */
  month: string;
  /** The one quote set in large display italic at the top of the section. */
  featured?: boolean;
}

export const reviews: Review[] = [
  {
    id: 'ngozi-a',
    name: 'Ngozi A.',
    rating: 5,
    quote:
      'I came in at half past eleven at night after a shift that would not end, and nobody made me feel strange for it. The room was warm, the oils were warm, and I slept properly for the first time that week.',
    treatment: 'Massage',
    month: 'August 2026',
    featured: true,
  },
  {
    id: 'chidinma-e',
    name: 'Chidinma E.',
    rating: 5,
    quote:
      'My skin was reacting badly to the harmattan and I had almost given up. Forty-five minutes later it felt calm. They told me exactly what they were using and why.',
    treatment: 'Facial Treatment',
    month: 'July 2026',
  },
  {
    id: 'tobenna-o',
    name: 'Tobenna O.',
    rating: 5,
    quote:
      'Booked the body scrub for my wife and ended up booking one for myself the same evening. Easy to find once you are inside De Castle, and the price they quoted is the price I paid.',
    treatment: 'Body Scrub',
    month: 'July 2026',
  },
  {
    id: 'amaka-n',
    name: 'Amaka N.',
    rating: 4,
    quote:
      'The aromatherapy session did exactly what I needed after a long week. I would have liked a little longer in the room afterwards before heading back out into Enugu traffic.',
    treatment: 'Aromatherapy Session',
    month: 'June 2026',
  },
];

export const featuredReview = reviews.find((review) => review.featured) ?? reviews[0];
export const supportingReviews = reviews.filter((review) => review !== featuredReview);
