import type { ImageSlot } from './images.ts';

export interface Service {
  id: string;
  name: string;
  detail: string;
  minutes: number;
  price: number;
  description: string;
  bookLabel: string;
  image: ImageSlot;
}

/** Treatments in menu order. Prices and durations are C-berry's own. */
export const services: Service[] = [
  {
    id: 'massage',
    name: 'Massage',
    detail: 'Full Body with Essential Oils',
    minutes: 60,
    price: 35000,
    description: 'Warm oils worked slowly from shoulders to soles to loosen tight muscles and quiet a busy head.',
    bookLabel: 'Book a massage',
    image: 'massage',
  },
  {
    id: 'facial',
    name: 'Facial Treatment',
    detail: 'Deep Cleansing & Hydration',
    minutes: 45,
    price: 25000,
    description: 'Pores cleared, then skin layered with moisture until it feels soft, calm and bright.',
    bookLabel: 'Book a facial',
    image: 'facial',
  },
  {
    id: 'body-scrub',
    name: 'Body Scrub',
    detail: 'Exfoliation & Moisturization',
    minutes: 50,
    price: 30000,
    description: 'Dull skin polished away from neck to toe, then sealed in with a rich moisturiser.',
    bookLabel: 'Book a body scrub',
    image: 'bodyScrub',
  },
  {
    id: 'aromatherapy',
    name: 'Aromatherapy Session',
    detail: 'Relaxation & Stress Relief',
    minutes: 40,
    price: 35000,
    description: 'Calming essential oils and low candlelight for forty unhurried minutes of letting go.',
    bookLabel: 'Book aromatherapy',
    image: 'aromatherapy',
  },
];

/** Extra choice in the booking form for guests who want advice first. */
export const NOT_SURE = { id: 'not-sure', label: 'Not sure yet: help me choose' } as const;

export function serviceLabel(id: string): string {
  if (id === NOT_SURE.id) return 'a treatment (help me choose)';
  return services.find((s) => s.id === id)?.name ?? id;
}
