import { useEffect, useState } from 'react';
import { lagosTime } from '../lib/lagosTime';

/** The current time in Enugu (HH:mm), refreshed every 15 seconds. */
export function useLagosClock(intervalMs = 15_000): string {
  const [time, setTime] = useState(() => lagosTime());

  useEffect(() => {
    const id = window.setInterval(() => setTime(lagosTime()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return time;
}
