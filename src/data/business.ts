/**
 * C-berry's contact details: the single source for every component.
 * The JSON-LD (src/seo/structuredData.ts) is built from this file at build time.
 * Email and social links are deferred (see tickets/LATER-001).
 */

/** Production origin. Canonical, Open Graph, sitemap and JSON-LD all use it. */
export const SITE_URL = 'https://c-berry.vercel.app/';

export const business = {
  /** Short brand name: wordmark, WhatsApp greetings. */
  name: 'C-berry',
  /** Full brand name: titles, copyright, structured data. */
  fullName: 'C-berry Spa',
  tagline: 'Luxury self-care, spa life, feminine wellness & everyday healing.',
  phone: { display: '+234 702 552 9519', href: 'tel:+2347025529519' },
  whatsappNumber: '2347025529519',
  address: {
    venue: 'Inside De Castle Hotel',
    street: '14 Umuona Street',
    landmark: 'Behind Park Lane Hospital',
    area: 'G.R.A., Enugu, Nigeria',
  },
  hours: 'Open 24 hours, every day',
  city: 'Enugu',
  region: 'Enugu State',
  country: 'NG',

  /*
   * TODO(owner): not supplied yet. While a value is null it is left out of the
   * JSON-LD and the page; fill it in and it is published on the next build.
   */
  /** TODO: public booking email, e.g. 'hello@example.com'. */
  email: null as string | null,
  /** TODO: exact coordinates of the De Castle Hotel entrance, in decimal degrees. */
  geo: null as { latitude: number; longitude: number } | null,
  /** TODO: full profile URLs. Networks left null are not listed anywhere. */
  socials: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
    x: null as string | null,
  },
} as const;

const mapsQuery = 'De Castle Hotel, 14 Umuona Street, G.R.A., Enugu, Nigeria';

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&z=16&output=embed`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`;

export function whatsappLink(message: string): string {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export const formatNaira = (amount: number): string => naira.format(amount);
