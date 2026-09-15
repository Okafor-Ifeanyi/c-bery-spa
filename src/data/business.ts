/**
 * C-berry's contact details: the single source for every component.
 * The LocalBusiness JSON-LD in index.html repeats these; keep both in sync.
 * Email and social links are deferred (see tickets/LATER-001).
 */
export const business = {
  name: 'C-berry',
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
