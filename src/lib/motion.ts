/**
 * Every timing on the site lives here. Component CSS reads durations and
 * easings from tokens.css; the hero's beat sheet is written onto the root
 * element as custom properties by `runHeroIntro`, so the sequence can be
 * retuned in this file alone. See design-plan-motion.md §2 and §4.
 *
 * Nothing in here is required for the page to be usable: if JavaScript never
 * runs, no element is left hidden, because every "hidden" state is keyed to an
 * attribute that only this module sets.
 */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

/** Read live rather than cached, so toggling the OS setting takes effect. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCE_QUERY).matches;
}

/* -- Hero beat sheet -------------------------------------------------------
 * `at` is milliseconds from the start of the sequence, `dur` its length.
 * Budget (§6b): eight beats 80ms apart, 1200ms total, travel 36px, background
 * settling from 1.10. Durations are deliberately unchanged from §6a: raising
 * them would push the last text beat past the 1s readability floor, which §6b
 * keeps. Last text beat settles at 980ms.
 */
export interface Beat {
  /** Start offset in ms from the top of the sequence. */
  readonly at: number;
  /** Duration in ms. */
  readonly dur: number;
}

export const HERO_BEATS = {
  /** 1. The room warms up: scale 1.10 -> 1, brightness 0.45 -> 1. */
  image: { at: 0, dur: 1200 },
  /** 1b. Legibility scrim, ahead of the text that sits on it. */
  scrim: { at: 0, dur: 400 },
  /** 2. Headline, one beat per rendered line (see HERO_LINE_STAGGER). */
  title: { at: 100, dur: 640 },
  /** 3. "Open now" line and the Enugu clock. */
  status: { at: 180, dur: 560 },
  /** 4. Tagline. */
  tagline: { at: 260, dur: 560 },
  /** 5. Both CTAs as one unit. */
  actions: { at: 340, dur: 560 },
  /** 6. At-a-glance facts as one unit. Settles at 980ms. */
  facts: { at: 420, dur: 560 },
  /** 7. Header last. */
  header: { at: 500, dur: 400 },
} as const satisfies Record<string, Beat>;

/** Between rendered lines of the headline: the §6b stagger floor. */
export const HERO_LINE_STAGGER = 80;

/** End of the sequence: scroll reveals are armed here, not before. */
export const HERO_END = 1200;

/** Longest we will wait for webfonts before starting anyway (§4). */
const FONT_TIMEOUT = 800;

/** Hard failsafe: the hero is never left in its pre-state longer than this. */
const INTRO_FAILSAFE = 2500;

/* -- The gate that arms scroll reveals -------------------------------------
 * No section reveals while the hero sequence is still running.
 */
let armed = false;
let waiting: Array<() => void> = [];
let failsafe: number | undefined;

function arm(): void {
  if (armed) return;
  armed = true;
  const pending = waiting;
  waiting = [];
  for (const fn of pending) fn();
}

/** Run `fn` once the intro is done, or immediately if it already is. */
function onArmed(fn: () => void): () => void {
  if (armed) {
    fn();
    return () => {};
  }
  waiting.push(fn);
  // If the intro never reports back, arm anyway rather than stranding sections.
  failsafe ??= window.setTimeout(arm, INTRO_FAILSAFE + 500);
  return () => {
    waiting = waiting.filter((f) => f !== fn);
  };
}

/**
 * Decided once, before the first paint, so the hero can render its pre-state
 * in the same commit as everything else and never flash.
 */
let introDecision: boolean | null = null;
export function willRunHeroIntro(): boolean {
  introDecision ??=
    typeof window !== 'undefined' &&
    !prefersReducedMotion() &&
    // Deep link or a restored scroll position: the hero isn't what you're
    // looking at, so skip its sequence and let the page reveal normally.
    window.scrollY < 100;
  return introDecision;
}

/**
 * Puts the page into its pre-intro state before the first paint. Called from
 * main.tsx ahead of render, so no frame is ever painted in the wrong state.
 */
export function markIntroPending(): void {
  if (!willRunHeroIntro()) return;
  const root = document.documentElement;
  root.dataset.intro = 'pending';
  // If the hero never mounts, the page must not stay in its pre-state.
  window.setTimeout(() => {
    if (root.dataset.intro === 'pending') {
      root.dataset.intro = 'done';
      arm();
    }
  }, INTRO_FAILSAFE);
}

/**
 * Runs the page-load sequence, then arms the scroll reveals.
 * Returns a cleanup function.
 *
 * The beat sheet is written onto the root element rather than the hero,
 * because the header is beat 7 and lives outside the hero's subtree.
 */
export function runHeroIntro(hero: HTMLElement): () => void {
  if (!willRunHeroIntro()) {
    arm();
    return () => {};
  }

  const root = document.documentElement;

  // Beat sheet -> custom properties. Hero.css and Header.css read these.
  for (const [name, beat] of Object.entries(HERO_BEATS) as Array<[string, Beat]>) {
    root.style.setProperty(`--at-${name}`, `${beat.at}ms`);
    root.style.setProperty(`--dur-${name}`, `${beat.dur}ms`);
  }
  root.style.setProperty('--line-stagger', `${HERO_LINE_STAGGER}ms`);

  let cancelled = false;
  const timers: number[] = [];

  const start = () => {
    if (cancelled || root.dataset.intro === 'done') return;
    measureLines(hero, '.hero__word');
    root.dataset.intro = 'run';
    timers.push(
      window.setTimeout(() => {
        // Sequence over: the page stops being held back.
        root.dataset.intro = 'done';
        arm();
      }, HERO_END + 120),
    );
  };

  // Nothing above the fold animates before the fonts land — but a slow font
  // must never withhold the content either, hence the race.
  const fonts = document.fonts?.ready;
  if (fonts) {
    let started = false;
    const once = () => {
      if (started) return;
      started = true;
      start();
    };
    fonts.then(once).catch(once);
    timers.push(window.setTimeout(once, FONT_TIMEOUT));
  } else {
    start();
  }

  timers.push(
    window.setTimeout(() => {
      if (root.dataset.intro !== 'done') {
        root.dataset.intro = 'done';
        arm();
      }
    }, INTRO_FAILSAFE),
  );

  return () => {
    cancelled = true;
    for (const id of timers) window.clearTimeout(id);
  };
}

/**
 * Group word spans into rendered lines and give each word its line's index as
 * `--line`, so CSS can reveal text by line without anyone inventing a line
 * break. Capped so a long quote on a narrow phone never outruns the stagger
 * chain: lines past the cap share its delay.
 */
export function measureLines(root: HTMLElement, selector: string, cap = 7): void {
  const words = root.querySelectorAll<HTMLElement>(selector);
  let line = -1;
  let lastTop: number | null = null;
  // Read every position first, then write, so this is one layout, not N.
  const tops = Array.from(words, (word) => word.offsetTop);
  words.forEach((word, index) => {
    const top = tops[index];
    if (lastTop === null || top - lastTop > 2) line += 1;
    lastTop = top;
    word.style.setProperty('--line', String(Math.min(line, cap)));
  });
}

/* -- Form ------------------------------------------------------------------ */

export const FORM = {
  /** Submit button morphing into its checkmark, before the summary panel. */
  morph: 420,
} as const;

/* -- Lightbox -------------------------------------------------------------- */

export const LIGHTBOX = {
  /**
   * Thumbnail -> full size, and the exact reverse on close.
   * The Web Animations API needs literals, so these mirror --dur-flip and
   * --ease-in-out in tokens.css; the backdrop underneath is driven by those.
   * Change both together.
   */
  flip: { dur: 420, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
  /** Arrow navigation: a cross-fade, never a slide. */
  cross: { dur: 260 },
} as const;

/**
 * Animates the opened photograph between a thumbnail's rect and its laid-out
 * position, so the viewer never loses track of which photo they clicked.
 *
 * `object-fit: contain` letterboxes the photo inside its box, so the scale is
 * worked out against the painted picture rather than the element. Scaling about
 * the centre — the default origin — keeps the two centres aligned throughout.
 *
 * Returns null when there is nothing to animate, including under reduced
 * motion, in which case the caller opens or closes at full size instead.
 */
export function flipImage(
  img: HTMLElement,
  from: DOMRect,
  intrinsic: { width: number; height: number },
  reverse = false,
): Animation | null {
  if (prefersReducedMotion() || typeof img.animate !== 'function') return null;

  const box = img.getBoundingClientRect();
  if (!box.width || !box.height || !from.width || !from.height) return null;

  const scale = Math.min(box.width / intrinsic.width, box.height / intrinsic.height);
  const paintedW = intrinsic.width * scale;
  const paintedH = intrinsic.height * scale;
  if (!paintedW || !paintedH) return null;

  const dx = from.left + from.width / 2 - (box.left + box.width / 2);
  const dy = from.top + from.height / 2 - (box.top + box.height / 2);

  const atThumbnail = {
    transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${(
      from.width / paintedW
    ).toFixed(4)}, ${(from.height / paintedH).toFixed(4)})`,
  };
  const atFullSize = { transform: 'none' };

  return img.animate(reverse ? [atFullSize, atThumbnail] : [atThumbnail, atFullSize], {
    duration: LIGHTBOX.flip.dur,
    easing: LIGHTBOX.flip.easing,
    fill: reverse ? 'forwards' : 'both',
  });
}

/* -- Scroll reveals --------------------------------------------------------
 *
 * Every element inside a section that carries `data-reveal="out"` is its own
 * unit, observed on its own. On a desktop a whole grid usually fires together;
 * on a phone the same cards arrive one at a time, and each one plays the
 * moment it arrives instead of waiting on a stagger slot meant for siblings
 * that are still off screen.
 *
 * Units that fire in the same callback are staggered by `data-order` (or
 * `data-order-sm` below 768px, where a grid's shape changes). Equal orders share
 * a slot, which is how the gallery's diagonals arrive together. The slot is
 * written as `--i` and the CSS turns it into a delay.
 */

/** §6b: stagger chains are capped at eight. */
const CHAIN_CAP = 7;
const SMALL_QUERY = '(max-width: 767.98px)';

function reveal(targets: HTMLElement[]): void {
  if (targets.length === 0) return;
  const small = window.matchMedia(SMALL_QUERY).matches;
  const orderOf = (el: HTMLElement) =>
    Number((small && el.dataset.orderSm) || el.dataset.order || 0);
  const slots = [...new Set(targets.map(orderOf))].sort((x, y) => x - y);
  const vh = window.innerHeight;

  // Read every position before writing anything.
  const late = targets.map((el) => el.getBoundingClientRect().top < vh * 0.5);

  targets.forEach((el, index) => {
    el.style.setProperty('--i', String(Math.min(slots.indexOf(orderOf(el)), CHAIN_CAP)));
    // Late is worse than fast (§6b): already past mid-screen plays at 0.6x.
    if (late[index]) el.style.setProperty('--pace', '0.6');
    // Text revealed by line needs its lines measured in the final layout.
    if (el.dataset.lines) measureLines(el, el.dataset.lines);
    el.dataset.reveal = 'in';
  });
}

/**
 * Units marked `data-reveal-row` arrive with every unrevealed sibling that
 * starts on the same layout row. The gallery needs this: its halves drift in
 * opposite directions, so tiles in one row would otherwise cross the trigger
 * line at different moments and its diagonal waves would fall apart.
 * offsetTop ignores transforms, so the drift doesn't affect the grouping.
 */
function rowMates(el: HTMLElement): HTMLElement[] {
  if (!('revealRow' in el.dataset) || !el.parentElement) return [];
  return Array.from(el.parentElement.children).filter(
    (other): other is HTMLElement =>
      other !== el &&
      other instanceof HTMLElement &&
      other.dataset.reveal === 'out' &&
      'revealRow' in other.dataset &&
      Math.abs(other.offsetTop - el.offsetTop) < 4,
  );
}

/**
 * Observes every `[data-reveal]` unit inside the returned ref's element,
 * including the element itself. Each unit reveals once, when its top is 15%
 * into the viewport, and is never observed again, so nothing replays.
 */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  // Layout effect, so the reduced-motion path paints visible on the first frame.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const units = [
      ...(root.matches('[data-reveal]') ? [root] : []),
      ...root.querySelectorAll<HTMLElement>('[data-reveal]'),
    ];

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      for (const el of units) el.dataset.reveal = 'in';
      return;
    }

    let observer: IntersectionObserver | undefined;
    const cancel = onArmed(() => {
      observer = new IntersectionObserver(
        (entries, obs) => {
          const due = new Set<HTMLElement>();
          for (const entry of entries) {
            // Second test: already above the viewport, as after a deep link.
            if (entry.isIntersecting || entry.boundingClientRect.bottom <= 0) {
              due.add(entry.target as HTMLElement);
            }
          }
          for (const el of [...due]) {
            for (const mate of rowMates(el)) due.add(mate);
          }
          for (const el of due) obs.unobserve(el);
          reveal([...due]);
        },
        // "15% into the viewport", which a unit taller than the viewport can
        // still satisfy, unlike "15% of the unit visible".
        { rootMargin: '0px 0px -15% 0px' },
      );
      for (const el of units) observer.observe(el);
    });

    return () => {
      cancel();
      observer?.disconnect();
    };
  }, []);

  return ref;
}

/**
 * Fades a photograph in as it decodes, instead of letting it pop.
 *
 * Returns a ref callback. The image is visible by default and only marked
 * pending if it genuinely hasn't loaded yet, so a cached image never flickers
 * and a broken one never stays invisible.
 */
export function useImageFadeIn(): (img: HTMLImageElement | null) => void {
  return useCallback((img: HTMLImageElement | null) => {
    if (!img || img.complete) return;
    img.classList.add('is-loading');
    const done = () => img.classList.remove('is-loading');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }, []);
}

/* -- Scroll-linked motion -------------------------------------------------- */

/**
 * Writes the header's 0 -> 1 density over the first `distance` px of scroll as
 * `--head` on the element, interpolated continuously rather than snapped at a
 * threshold. One passive listener, one rAF, one custom property.
 */
export function useScrollProgress<T extends HTMLElement>(distance = 100): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let last = -1;
    // Reduced motion: the header takes its dense state at the 100px mark
    // directly rather than interpolating across it (design-plan-motion.md §7).
    const snap = prefersReducedMotion();

    const write = () => {
      frame = 0;
      const next = snap
        ? window.scrollY > distance
          ? 1
          : 0
        : Math.min(1, Math.max(0, window.scrollY / distance));
      // Two decimal places: below that the change isn't visible, and skipping
      // the write skips the style recalc.
      const rounded = Math.round(next * 100) / 100;
      if (rounded === last) return;
      last = rounded;
      el.style.setProperty('--head', String(rounded));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(write);
    };

    write();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [distance]);

  return ref;
}

/* -- Image drift -----------------------------------------------------------
 *
 * Every photograph on the page drifts inside its frame as it crosses the
 * viewport: the hero's parallax, generalised (design-plan-motion.md §3).
 *
 * Each drift layer sits inside an overflow-hidden frame and is taller than it
 * by `data-drift` percent top and bottom. As the frame crosses the viewport,
 * progress runs -1 -> +1 and the layer moves by that fraction of its headroom,
 * so it can never expose an edge. The hero is the same maths: it starts
 * centred, so it only ever drifts one way.
 *
 * One passive scroll listener and one rAF for all of them. Each frame reads
 * every rect first and writes every transform after, so it is one layout per
 * frame, not one per image. Only layers actually on screen do any work, and
 * only they carry will-change.
 */

interface DriftLayer {
  el: HTMLElement;
  /** Headroom as a fraction of the frame's height. */
  headroom: number;
  onScreen: boolean;
  /**
   * Set for gallery tiles: instead of drifting inside a frame, the tile itself
   * moves at this signed rate relative to the grid's distance from mid-screen.
   */
  tileRate?: number;
  /** A tile takes its on-screen state from its grid rather than tracking its own. */
  visibleVia?: DriftLayer;
  /** Only tracks visibility for others; never moved itself. */
  watchOnly?: boolean;
}

const layers = new Set<DriftLayer>();
let driftFrame = 0;
let driftVisibility: IntersectionObserver | undefined;
const byElement = new WeakMap<Element, DriftLayer>();

function driftTick(): void {
  driftFrame = 0;
  const vh = window.innerHeight;
  const active: DriftLayer[] = [];
  const offsets: number[] = [];

  const wide = !window.matchMedia(SMALL_QUERY).matches;
  const tiles: Array<[HTMLElement, string]> = [];

  for (const layer of layers) {
    if (layer.watchOnly || !(layer.visibleVia ?? layer).onScreen) continue;
    const frame = layer.el.parentElement;
    if (!frame) continue;
    const rect = frame.getBoundingClientRect();
    if (layer.tileRate !== undefined) {
      // Phones stack the grid differently, so there is no clean column split.
      const shift = wide ? (vh / 2 - (rect.top + rect.height / 2)) * layer.tileRate : 0;
      tiles.push([layer.el, `0 ${Math.max(-24, Math.min(24, shift)).toFixed(1)}px`]);
      continue;
    }
    const progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);
    const clamped = Math.max(-1, Math.min(1, progress));
    active.push(layer);
    offsets.push(clamped * rect.height * layer.headroom);
  }

  active.forEach((layer, index) => {
    layer.el.style.transform = `translate3d(0, ${offsets[index].toFixed(1)}px, 0)`;
  });
  // The individual `translate` property, so a tile's drift never competes with
  // the clip-path and scale its reveal is animating.
  for (const [el, value] of tiles) el.style.translate = value;
}

function requestDrift(): void {
  if (!driftFrame) driftFrame = requestAnimationFrame(driftTick);
}

function startDrift(): void {
  window.addEventListener('scroll', requestDrift, { passive: true });
  window.addEventListener('resize', requestDrift, { passive: true });
  driftVisibility = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const layer = byElement.get(entry.target);
        if (!layer) continue;
        layer.onScreen = entry.isIntersecting;
        if (!layer.watchOnly) {
          layer.el.style.willChange = entry.isIntersecting ? 'transform' : '';
        }
        for (const other of layers) {
          if (other.visibleVia === layer) {
            other.el.style.willChange = entry.isIntersecting ? 'translate' : '';
          }
        }
      }
      requestDrift();
    },
    // Start a little before the frame appears, so it never enters unpositioned.
    { rootMargin: '10% 0px' },
  );
}

function stopDrift(): void {
  window.removeEventListener('scroll', requestDrift);
  window.removeEventListener('resize', requestDrift);
  driftVisibility?.disconnect();
  driftVisibility = undefined;
  if (driftFrame) cancelAnimationFrame(driftFrame);
  driftFrame = 0;
}

function register(layer: DriftLayer, watch: Element): () => void {
  if (layers.size === 0) startDrift();
  layers.add(layer);
  byElement.set(watch, layer);
  driftVisibility?.observe(watch);
  return () => {
    driftVisibility?.unobserve(watch);
    byElement.delete(watch);
    layers.delete(layer);
    layer.el.style.transform = '';
    layer.el.style.translate = '';
    layer.el.style.willChange = '';
    if (layers.size === 0) stopDrift();
  };
}

const canDrift = () => !prefersReducedMotion() && 'IntersectionObserver' in window;

/**
 * Registers the element as a drift layer inside its parent frame. Headroom
 * comes from `data-drift` (a percentage), which the CSS also reads for the
 * layer's inset, so the two can't disagree.
 */
export function useDrift<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el?.parentElement || !canDrift()) return;
    return register(
      { el, headroom: (Number(el.dataset.drift) || 10) / 100, onScreen: false },
      el.parentElement,
    );
  }, []);

  return ref;
}

/**
 * The gallery breathes as you pass it (§6b): tiles marked `data-column="a"`
 * and `"b"` move in opposite directions at half of `differential` each, so the
 * two halves of the grid differ by exactly that much. Capped at 24px either way.
 */
export function useColumnDrift<T extends HTMLElement>(differential = 0.05): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid || !canDrift()) return;
    const watcher: DriftLayer = { el: grid, headroom: 0, onScreen: false, watchOnly: true };
    const stopWatching = register(watcher, grid);
    const tiles = Array.from(grid.querySelectorAll<HTMLElement>('[data-column]'), (el) => {
      const layer: DriftLayer = {
        el,
        headroom: 0,
        onScreen: false,
        tileRate: (el.dataset.column === 'a' ? 1 : -1) * (differential / 2),
        visibleVia: watcher,
      };
      layers.add(layer);
      return layer;
    });
    requestDrift();

    return () => {
      for (const layer of tiles) {
        layers.delete(layer);
        layer.el.style.translate = '';
        layer.el.style.willChange = '';
      }
      stopWatching();
    };
  }, [differential]);

  return ref;
}

/* -- Touch -----------------------------------------------------------------
 *
 * A phone has no hover, so the card and tile hover states would never be seen
 * there. Instead, on touch-only devices, whichever card or tile is crossing the
 * middle of the screen takes that state (`data-centred`), and pressing one gives
 * immediate feedback through :active.
 */

/**
 * Marks `[data-centre]` elements inside the ref while they cross the middle
 * band of the viewport. Touch-only devices; a state, not a reveal, so it does
 * follow the scroll both ways.
 */
export function useCentreFocus<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) return;
    if (!window.matchMedia('(hover: none)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.dataset.centred = '';
          else delete el.dataset.centred;
        }
      },
      { rootMargin: '-40% 0px -40% 0px' },
    );
    for (const el of root.querySelectorAll('[data-centre]')) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * iOS Safari only applies :active to elements when the document has a touch
 * listener. This is that listener: it does nothing else, and it is passive.
 */
export function enableTouchActiveStates(): void {
  if (typeof document === 'undefined') return;
  document.addEventListener('touchstart', () => {}, { passive: true });
}
