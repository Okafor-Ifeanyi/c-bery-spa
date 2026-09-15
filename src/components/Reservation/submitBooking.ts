/*
 * TODO: endpoint
 * Create a form at https://formspree.io, then paste its endpoint below,
 * for example 'https://formspree.io/f/abcdwxyz'. While this is empty the form
 * validates as normal but offers to send the request on WhatsApp instead.
 */
export const FORMSPREE_ENDPOINT = '';

import { formatNaira } from '../../data/business';
import { services, serviceLabel } from '../../data/services';
import { formatDisplayDate } from '../../lib/lagosTime';
import type { BookingValues } from './validation';

export type SubmitResult = 'sent' | 'failed' | 'unconfigured';

export async function submitBooking(values: BookingValues): Promise<SubmitResult> {
  if (!FORMSPREE_ENDPOINT) return 'unconfigured';

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Booking request: ${serviceLabel(values.service)}, ${formatDisplayDate(values.date)} ${values.time}`,
        name: values.name.trim(),
        email: values.email.trim() || undefined,
        phone: values.phone.trim(),
        treatment: serviceLabel(values.service),
        date: formatDisplayDate(values.date),
        time: values.time,
        guests: values.guests,
        notes: values.notes.trim() || undefined,
      }),
    });
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

/** The same request written as a WhatsApp message, used as the fallback route. */
export function bookingMessage(values: BookingValues): string {
  const service = services.find((s) => s.id === values.service);
  const treatment = service
    ? `${service.name} (${service.minutes} min, ${formatNaira(service.price)})`
    : serviceLabel(values.service);

  return [
    "Hi C-berry, I'd like to book:",
    `Treatment: ${treatment}`,
    values.date && `Date: ${formatDisplayDate(values.date)}${values.time ? ` at ${values.time}` : ''}`,
    `Guests: ${values.guests}`,
    `Name: ${values.name.trim()}`,
    `Phone: ${values.phone.trim()}`,
    values.notes.trim() && `Notes: ${values.notes.trim()}`,
  ]
    .filter(Boolean)
    .join('\n');
}
