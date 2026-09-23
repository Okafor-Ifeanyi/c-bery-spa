/**
 * The page's one JSON-LD block, built from src/data at build time and written
 * into <head> by the plugin in vite.config.ts. Edit the data files, not this.
 *
 * It is a @graph of two nodes: the DaySpa itself, and a WebSite node, which
 * is what Google reads for the site name shown above a search result.
 */
import { business, SITE_URL } from '../data/business.ts';
import { services } from '../data/services.ts';

const SPA_ID = `${SITE_URL}#spa`;
const absolute = (path: string) => new URL(path, SITE_URL).href;

/** Fields in business.ts that are still null, for the build warning. */
export function pendingFields(): string[] {
  const pending: string[] = [];
  if (!business.email) pending.push('email');
  if (!business.geo) pending.push('geo (latitude, longitude)');
  for (const [network, url] of Object.entries(business.socials)) {
    if (!url) pending.push(`sameAs: ${network}`);
  }
  return pending;
}

export function buildStructuredData() {
  const prices = services.map((s) => s.price);
  const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
  const sameAs = Object.values(business.socials).filter((url): url is string => Boolean(url));

  const spa = {
    '@type': 'DaySpa',
    '@id': SPA_ID,
    name: business.fullName,
    alternateName: [business.name, `${business.fullName} Enugu`, 'Cberry Spa', 'C berry Spa'],
    description:
      `${business.fullName} is a 24-hour day spa inside De Castle Hotel, G.R.A., Enugu, ` +
      'offering massage, facials, body scrubs and aromatherapy.',
    slogan: business.tagline,
    url: SITE_URL,
    telephone: business.phone.href.replace('tel:', ''),
    // TODO(owner): email is published here once business.email is set.
    ...(business.email ? { email: business.email } : {}),
    image: [absolute('/og-image.jpg'), absolute('/images/hero-736.webp')],
    logo: absolute('/icon-512.png'),
    priceRange: `${naira(Math.min(...prices))}–${naira(Math.max(...prices))}`,
    currenciesAccepted: 'NGN',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `De Castle Hotel, ${business.address.street}, G.R.A.`,
      addressLocality: business.city,
      addressRegion: business.region,
      addressCountry: business.country,
    },
    // TODO(owner): geo is published here once business.geo is set.
    ...(business.geo
      ? { geo: { '@type': 'GeoCoordinates', latitude: business.geo.latitude, longitude: business.geo.longitude } }
      : {}),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `De Castle Hotel, ${business.address.street}, G.R.A., Enugu`,
    )}`,
    // Open around the clock: Google's form for 24 hours is 00:00 to 23:59.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    areaServed: [
      { '@type': 'City', name: business.city },
      { '@type': 'State', name: business.region },
    ],
    // TODO(owner): social profiles are listed here once business.socials are set.
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Spa treatments',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        name: `${s.name}: ${s.detail}`,
        description: `${s.description} ${s.minutes} minutes.`,
        price: String(s.price),
        priceCurrency: 'NGN',
        url: `${SITE_URL}#treatments`,
        itemOffered: { '@type': 'Service', name: s.name, provider: { '@id': SPA_ID } },
      })),
    },
    /*
     * TODO(reviews): aggregateRating and review go here, and only once the
     * reviews in src/data/reviews.ts are real, consenting guests collected on
     * this site. The current four are placeholders: marking them up would break
     * Google's review snippet policy and risk a manual action.
     *
     * aggregateRating: { '@type': 'AggregateRating', ratingValue, reviewCount },
     * review: realReviews.map((r) => ({ '@type': 'Review', author, reviewRating, reviewBody, datePublished })),
     */
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: business.fullName,
    alternateName: business.name,
    url: SITE_URL,
    inLanguage: 'en-NG',
    publisher: { '@id': SPA_ID },
  };

  return { '@context': 'https://schema.org', '@graph': [spa, website] };
}
