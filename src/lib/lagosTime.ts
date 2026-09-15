/** Date and time helpers pinned to Enugu's time zone (WAT, Africa/Lagos). */

const TIME_ZONE = 'Africa/Lagos';

const dateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Today's date in Enugu as YYYY-MM-DD, the format of <input type="date">. */
export const lagosDate = (now = new Date()): string => dateFormat.format(now);

/** The current time in Enugu as HH:mm, the format of <input type="time">. */
export const lagosTime = (now = new Date()): string => timeFormat.format(now);

/** "Tue 16 Sep 2026" from a YYYY-MM-DD string. */
export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
