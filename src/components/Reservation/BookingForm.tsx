import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent, ReactNode } from 'react';
import { formatNaira, whatsappLink } from '../../data/business';
import { FORM, prefersReducedMotion } from '../../lib/motion';
import { NOT_SURE, serviceLabel, services } from '../../data/services';
import { formatDisplayDate, lagosDate } from '../../lib/lagosTime';
import { bookingMessage, submitBooking, type SubmitResult } from './submitBooking';
import {
  MAX_GUESTS,
  NOTES_MAX,
  firstInvalidField,
  validateBooking,
  type BookingField,
  type BookingValues,
} from './validation';

type Status = 'idle' | 'sending' | SubmitResult;
type OwnFields = Omit<BookingValues, 'service'>;

const EMPTY: OwnFields = { name: '', email: '', phone: '', date: '', time: '', guests: '1', notes: '' };

/** Wraps a control so the focus line has something to draw itself on. */
function Box({ children }: { children: ReactNode }) {
  return <div className="field__box">{children}</div>;
}
const GUEST_OPTIONS = Array.from({ length: MAX_GUESTS }, (_, i) => i + 1);

interface BookingFormProps {
  /** Lifted to App so a "Book" button in Services can pre-select it. */
  service: string;
  onServiceChange: (id: string) => void;
}

export function BookingForm({ service, onServiceChange }: BookingFormProps) {
  const [fields, setFields] = useState<OwnFields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<BookingField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  /* The button is the confirmation: it morphs to a checkmark before the
     summary panel replaces the form (design-plan-motion.md §3.1). */
  const [morphing, setMorphing] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  /* Error text is kept for as long as the slot takes to close, so a cleared
     message collapses rather than vanishing mid-animation. */
  const lastError = useRef<Partial<Record<BookingField, string>>>({});

  const values: BookingValues = { ...fields, service };
  const errors = validateBooking(values);
  const visibleError = (field: BookingField) =>
    submitted || touched[field] ? errors[field] : undefined;

  // Move focus to the outcome so screen readers announce it.
  useEffect(() => {
    if (status === 'failed' || status === 'unconfigured') {
      statusRef.current?.focus();
    }
  }, [status]);

  // Hold on the checkmark, then hand over to the summary panel.
  useEffect(() => {
    if (status !== 'sent' || prefersReducedMotion()) return;
    setMorphing(true);
    const timer = window.setTimeout(() => setMorphing(false), FORM.morph);
    return () => window.clearTimeout(timer);
  }, [status]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    if (name === 'service') onServiceChange(value);
    else setFields((current) => ({ ...current, [name]: value }));
    if (status === 'failed' || status === 'unconfigured') setStatus('idle');
  }

  function handleBlur(event: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const name = event.target.name as BookingField;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const invalid = firstInvalidField(errors);
    if (invalid) {
      document.getElementById(`booking-${invalid}`)?.focus();
      return;
    }

    setStatus('sending');
    setStatus(await submitBooking(values));
  }

  function startOver() {
    setFields(EMPTY);
    onServiceChange('');
    setTouched({});
    setSubmitted(false);
    setStatus('idle');
  }

  /** Shared wiring for every control: value, handlers and error association. */
  function control(name: BookingField) {
    const error = visibleError(name);
    return {
      id: `booking-${name}`,
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      className: 'field__control',
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `booking-${name}-error` : undefined,
    };
  }

  /*
   * The slot is always in the DOM and animates its own row from 0fr to 1fr, so
   * an error pushes the fields below it down instead of covering them. It is
   * the one layout animation on the site: a two-line subtree, driven by blur or
   * submit, never during a scroll.
   */
  function errorFor(name: BookingField) {
    const error = visibleError(name);
    if (error) lastError.current[name] = error;
    return (
      <div
        className="field__error-slot"
        data-open={error ? 'true' : 'false'}
        aria-hidden={error ? undefined : true}
      >
        <p className="field__error" id={`booking-${name}-error`}>
          {error ?? lastError.current[name] ?? ''}
        </p>
      </div>
    );
  }

  if (status === 'sent' && !morphing) {
    return (
      <div className="booking booking--sent" ref={statusRef} tabIndex={-1} role="status">
        <h3>Request sent</h3>
        <p>
          Thank you, {values.name.trim().split(' ')[0]}. We'll contact you on {values.phone.trim()} to
          confirm {serviceLabel(values.service)} on {formatDisplayDate(values.date)} at {values.time}.
        </p>
        <button type="button" className="btn btn--ghost" onClick={startOver}>
          Book another session
        </button>
      </div>
    );
  }

  const whatsappFallback = whatsappLink(bookingMessage(values));

  return (
    <form className="booking" noValidate onSubmit={handleSubmit} aria-labelledby="visit-title">
      <div className="booking__grid">
        <div className="field field--half">
          <label htmlFor="booking-name">Name</label>
          <Box>
            <input {...control('name')} type="text" autoComplete="name" />
          </Box>
          {errorFor('name')}
        </div>

        <div className="field field--half">
          <label htmlFor="booking-email">
            Email <span className="field__optional">(optional)</span>
          </label>
          <Box>
            <input {...control('email')} type="email" autoComplete="email" inputMode="email" />
          </Box>
          {errorFor('email')}
        </div>

        <div className="field field--half">
          <label htmlFor="booking-phone">Phone or WhatsApp</label>
          <Box>
            <input {...control('phone')} type="tel" autoComplete="tel" inputMode="tel" />
          </Box>
          {errorFor('phone')}
        </div>

        <div className="field field--half">
          <label htmlFor="booking-service">Treatment</label>
          <Box>
            <select {...control('service')}>
              <option value="">Choose a treatment</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.minutes} min · {formatNaira(s.price)}
                </option>
              ))}
              <option value={NOT_SURE.id}>{NOT_SURE.label}</option>
            </select>
          </Box>
          {errorFor('service')}
        </div>

        <div className="field field--third">
          <label htmlFor="booking-date">Date</label>
          <Box>
            <input {...control('date')} type="date" min={lagosDate()} />
          </Box>
          {errorFor('date')}
        </div>

        <div className="field field--third">
          <label htmlFor="booking-time">Time</label>
          <Box>
            <input {...control('time')} type="time" />
          </Box>
          {errorFor('time')}
        </div>

        <div className="field field--third">
          <label htmlFor="booking-guests">Guests</label>
          <Box>
            <select {...control('guests')}>
              {GUEST_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? 'Just me' : `${n} people`}
                </option>
              ))}
            </select>
          </Box>
          {errorFor('guests')}
        </div>

        <div className="field">
          <label htmlFor="booking-notes">
            Notes <span className="field__optional">(optional)</span>
          </label>
          <Box>
            <textarea
              {...control('notes')}
              rows={4}
              maxLength={NOTES_MAX + 50}
              aria-describedby={
                visibleError('notes') ? 'booking-notes-error' : 'booking-notes-hint'
              }
            />
          </Box>
          <p className="field__hint" id="booking-notes-hint">
            Pressure preference, allergies, or a group larger than {MAX_GUESTS}.
          </p>
          {errorFor('notes')}
        </div>
      </div>

      {status === 'unconfigured' && (
        <div className="booking__status" ref={statusRef} tabIndex={-1} role="status">
          <p className="booking__status-title">Online requests aren't switched on yet.</p>
          <p>Send the same details on WhatsApp and we'll confirm your booking there.</p>
          <a className="btn btn--primary" href={whatsappFallback} target="_blank" rel="noopener noreferrer">
            Send on WhatsApp
          </a>
        </div>
      )}

      {status === 'failed' && (
        <div className="booking__status booking__status--error" ref={statusRef} tabIndex={-1} role="alert">
          <p className="booking__status-title">We couldn't send your request.</p>
          <p>Check your connection and try again, or send the same details on WhatsApp.</p>
          <a className="btn btn--ghost" href={whatsappFallback} target="_blank" rel="noopener noreferrer">
            Send on WhatsApp
          </a>
        </div>
      )}

      <div className="booking__footer">
        {/*
          Idle -> sending -> a checkmark drawn in place. The button becomes the
          confirmation; no toast appears anywhere else on the page.
        */}
        <button
          type="submit"
          className="btn btn--primary booking__submit"
          data-state={morphing ? 'sent' : status === 'sending' ? 'sending' : 'idle'}
          disabled={status === 'sending' || morphing}
        >
          {morphing ? (
            <>
              <span className="visually-hidden">Request sent</span>
              <svg
                className="booking__check"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4 12.5l5.2 5.2L20 7" />
              </svg>
            </>
          ) : status === 'sending' ? (
            'Sending request…'
          ) : (
            'Request booking'
          )}
        </button>
        <p className="booking__note">We reply day or night to confirm.</p>
      </div>
    </form>
  );
}
