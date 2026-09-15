import type { MouseEvent } from 'react';

/**
 * Scroll to a section and move keyboard focus there without a second jump.
 * Honours prefers-reduced-motion and keeps the URL hash in step.
 */
export function scrollToSection(sectionId: string, focusId?: string): void {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

  // No explicit target: focus the section's own heading instead.
  const target = focusId
    ? document.getElementById(focusId)
    : section.querySelector<HTMLElement>('h1, h2');
  if (target && !isFocusable(target) && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target?.focus({ preventScroll: true });

  history.replaceState(null, '', `#${sectionId}`);
}

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex], summary, audio[controls], video[controls]';

function isFocusable(element: HTMLElement): boolean {
  return element.matches(FOCUSABLE_SELECTOR);
}

/** Click handler for anchors that scroll to an in-page section and focus it. */
export function handleSectionLinkClick(event: MouseEvent<HTMLAnchorElement>): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.button !== 0) return;

  const hash = event.currentTarget.getAttribute('href') ?? '';
  if (!hash.startsWith('#')) return;
  const sectionId = hash.slice(1);
  if (!document.getElementById(sectionId)) return;

  event.preventDefault();
  scrollToSection(sectionId);
}
