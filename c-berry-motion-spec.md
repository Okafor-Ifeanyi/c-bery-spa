# §6a — Motion direction

> Replaces the single "Motion" bullet in §6. Paste this in as its own section.

## Intent

Motion on this site should feel like weight and material, not like elements sliding in from off-screen. The reference for the feel is a heavy, well-balanced door: slow to start, unmistakably controlled, settling without a bounce. Restraint reads as expensive; enthusiasm reads as a template.

Every animation must answer one of three questions: *where did this come from*, *what just changed*, or *what can I do here*. Anything that answers none of them gets cut.

## Motion tokens

Define these as CSS custom properties and use them everywhere. No ad-hoc durations or easings anywhere in the codebase.

**Easing**
- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` — entrances and reveals. Fast departure, long settle.
- `--ease-in-out`: `cubic-bezier(0.65, 0, 0.35, 1)` — anything that moves between two states.
- `--ease-hover`: `cubic-bezier(0.33, 1, 0.68, 1)` — hover and focus.
- No `linear` except for continuous loops. No `ease`, no `ease-in-out` keywords, no spring overshoot or bounce anywhere.

**Duration**
- Micro (hover, focus, button press): 150–250ms
- Element reveal: 600–800ms
- Section or hero choreography: 1000–1400ms total across the sequence
- Page-load sequence: under 1800ms end to end
- Slower than instinct, in general. Sub-300ms reveals feel cheap.

**Stagger**
- 60–90ms between siblings. Below 50ms reads as one blob; above 120ms reads as a slideshow.
- Cap any stagger chain at 6 items — after that, animate the group as one unit.

**Distance**
- Translate no more than 24px on reveal, 12px on hover. Long travel looks like a slide deck.
- Prefer a reveal built from opacity plus a `clip-path` or mask wipe over a big positional move.

## Choreography, section by section

**Page load.** One orchestrated sequence, no scroll-triggered reveals until it finishes. Order: background image scales from 1.06 to 1.0 over ~1200ms while the overlay fades in → headline reveals line by line, each line wiped upward from behind a mask, 80ms apart → sub-line and CTAs fade up together → header and scroll cue fade in last. Nothing pops; every element is already where it belongs and is being uncovered.

**Scroll.** Use scroll-linked motion, not just scroll-triggered. Hero imagery parallaxes at 0.15–0.25 of scroll speed — subtle enough that it's felt rather than noticed. The sticky header transitions from transparent to solid with a backdrop blur across roughly 100px of scroll, interpolated continuously rather than snapping at a threshold.

**Section entrances.** Trigger when the element is ~15% into the viewport, not at the very edge. Vary the treatment by section so the page doesn't have one repeated gesture: services stagger in, gallery images wipe from a mask, the reviews block cross-fades, the contact panel reveals as a unit. Each element animates **once** — no replay on scroll back, no re-trigger.

**Service cards.** On hover: lift 4px, shadow deepens, the image inside scales to 1.04 while the card's overflow stays hidden so the crop tightens. All three properties share one duration and one easing so it reads as a single gesture. The "Book" affordance can reveal on hover, but must be permanently visible on touch devices.

**Gallery.** Images load with a blur-up or a mask wipe, never a hard pop. Lightbox opens with a FLIP transition — the thumbnail animates from its grid position to the full-size position, so the viewer never loses track of which image they clicked. Backdrop fades in underneath. Closing reverses exactly. Arrow navigation cross-fades between images; it does not slide the whole strip.

**Reviews.** If it's a carousel, transitions are cross-fades or a slow horizontal glide at 700ms, with the pagination indicator animating as a continuous fill rather than a discrete jump.

**Form.** This is where detail earns its keep. Labels float on focus. The focused field's border draws in from one side rather than switching colour. Validation errors slide down and push content instead of overlaying it. The submit button transitions to an in-progress state, then morphs to a checkmark on success — the button itself becomes the confirmation rather than a toast appearing elsewhere. Failure shakes once, briefly, and states what went wrong.

**Links and buttons.** Underlines wipe in from left on hover and out to the right on leave. Primary buttons shift background with a subtle scale to 0.98 on press. Every hover state has a matching focus-visible state with the same visual treatment.

## Technical requirements

- Animate **only** `transform`, `opacity`, `clip-path`, and `filter`. Never `top`, `left`, `width`, `height`, or `margin`.
- Use `IntersectionObserver` for triggers. Never bind reveal logic to a raw scroll event.
- Any per-frame scroll work runs inside `requestAnimationFrame` and is throttled.
- Apply `will-change` only immediately before an animation and remove it on completion. Do not leave it on idle elements.
- Must hold 60fps on a mid-range Android. If a smooth-scroll library is used, it must not break anchor navigation, keyboard scrolling, or the browser's find-in-page.
- Nothing may animate above the fold before the fonts load — no flash of unstyled text mid-sequence.

**`prefers-reduced-motion: reduce` is non-negotiable.** Under it: all transforms, parallax, and smooth scrolling are disabled; reveals become instant or a ≤200ms opacity fade; the lightbox opens without a FLIP transition; the page remains fully functional and nothing stays invisible because its reveal never fired. Test this explicitly and report the result.

## Implementation

GSAP with ScrollTrigger via CDN is acceptable and preferred for the choreography — this overrides the "vanilla JS only" line in §6. Lenis is acceptable for smooth scroll if it passes the constraints above. Do not add a full animation framework beyond this. If a sequence can be expressed in plain CSS with an `IntersectionObserver` class toggle, do it that way instead.

Keep all timeline definitions in one `motion.js` module, organised by section and commented, so timings can be tuned in one place.

## Do not

- Do not apply the same fade-and-slide-up to every section.
- Do not use bounce, elastic, or overshoot easing.
- Do not animate text letter by letter on body copy. Line-level reveals only, and only in the hero.
- Do not add a custom cursor, a loading screen with a percentage counter, a typewriter effect, or scroll-jacking.
- Do not animate anything on a loop unless it communicates ongoing state.
- Do not let motion delay content: text must be readable and links clickable within 1s of load regardless of where the sequence is.
- Do not re-trigger reveals when scrolling back up.

## Rubric addition

Add to §7 as row 10, **Motion quality, 15%**. A 5 means: tokens are defined and used consistently, choreography differs meaningfully between sections, the hero sequence is orchestrated rather than a group fade, the lightbox uses a FLIP transition, the form has full micro-interaction coverage, 60fps holds on mid-range mobile, and reduced-motion is complete and verified.

Renormalise the other weights: Fidelity 15, Brand distinctness 12, Section completeness 12, Responsiveness 8, Image handling 8, Form correctness 8, Accessibility 10, Code quality 6, Copywriting 6.
