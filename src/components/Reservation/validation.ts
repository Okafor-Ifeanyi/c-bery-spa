import { lagosDate, lagosTime } from '../../lib/lagosTime';

export interface BookingValues {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
}

export type BookingField = keyof BookingValues;
export type BookingErrors = Partial<Record<BookingField, string>>;

/** Field order on screen; the first invalid one receives focus on submit. */
export const BOOKING_FIELDS: BookingField[] = [
  'name', 'email', 'phone', 'service', 'date', 'time', 'guests', 'notes',
];

export const MAX_GUESTS = 6;
export const NOTES_MAX = 500;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?\d{10,14}$/;

/**
 * Returns a message for every invalid field. Dates and times are checked
 * against the clock in Enugu, not the visitor's device time zone.
 */
export function validateBooking(values: BookingValues, now = new Date()): BookingErrors {
  const errors: BookingErrors = {};
  const today = lagosDate(now);

  if (values.name.trim().length < 2) {
    errors.name = 'Enter your name so we know who to expect.';
  }

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Check the email address, or leave it blank.';
  }

  const phoneDigits = values.phone.replace(/[\s().-]/g, '');
  if (!phoneDigits) {
    errors.phone = 'Enter a phone or WhatsApp number so we can confirm.';
  } else if (!PHONE_PATTERN.test(phoneDigits)) {
    errors.phone = 'Enter the full number, like 0803 123 4567 or +234 803 123 4567.';
  }

  if (!values.service) {
    errors.service = 'Choose a treatment, or pick "Not sure yet".';
  }

  if (!values.date) {
    errors.date = 'Choose a date.';
  } else if (values.date < today) {
    errors.date = 'That date has passed. Choose today or later.';
  }

  if (!values.time) {
    errors.time = "Choose a time. We're open around the clock.";
  } else if (values.date === today && values.time <= lagosTime(now)) {
    errors.time = 'That time has passed today. Choose a later time.';
  }

  // Defensive guard: the select only offers 1-MAX_GUESTS, so this can't fire from the UI.
  const guests = Number(values.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    errors.guests = `Choose between 1 and ${MAX_GUESTS} guests.`;
  }

  if (values.notes.length > NOTES_MAX) {
    errors.notes = `Keep notes under ${NOTES_MAX} characters (${values.notes.length} now).`;
  }

  return errors;
}

export const firstInvalidField = (errors: BookingErrors): BookingField | undefined =>
  BOOKING_FIELDS.find((field) => errors[field]);
