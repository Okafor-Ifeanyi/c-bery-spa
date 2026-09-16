# Design plan — §Motion

> New section of the design plan, written against [`c-berry-motion-spec.md`](c-berry-motion-spec.md) §6a.
> Nothing below is built yet. Review this before I touch `src/`.

## 1. Intent, in C-berry's terms

The spec's image is a heavy door. C-berry's version of that is **a room that is already lit** — the
candles are not struck on arrival, the light is raised. Every reveal uncovers something that was
already in place; nothing travels in from off-screen. This also carries the one fact that makes the
brand: the spa never closes. A site that flings elements onto the screen says "we just opened". A
site that raises the light says "we were open when you got here".

Two consequences that run through everything below:

- **Reveals are uncoverings.** Mask wipes and brightness, not slides. Positional travel is ≤16px
  everywhere, under the spec's 24px ceiling.
- **The single continuous loop on the page is the "open now" dot.** A 4s pulse beside the Enugu
  clock. It is the one thing that earns a loop under the spec's rule, because it communicates
  ongoing state — the spa is open *right now*.

## 2. Tokens

Replaces the three motion tokens currently in [`src/styles/tokens.css:54-57`](src/styles/tokens.css#L54-L57)
(`--ease-out-expo`, `--dur-fast`, `--dur-base`). Every duration and easing in the codebase reads from
this block; no literals anywhere else.

```css
/* Easing */
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);    /* entrances, reveals */
--ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);   /* state-to-state */
--ease-hover:   cubic-bezier(0.33, 1, 0.68, 1);   /* hover, focus */

/* Duration */
--dur-micro:    180ms;   /* hover, focus, press */
--dur-state:    260ms;   /* validation, cross-fade, lightbox arrows */
--dur-reveal:   560ms;   /* one element being uncovered */
--dur-line:     640ms;   /* hero headline line */
--dur-warm:     1200ms;  /* hero image warm-up */

/* Stagger */
--stagger:      70ms;    /* siblings; chains capped at 6 */

/* Distance */
--rise:         12px;    /* standard reveal travel */
--rise-line:    16px;    /* hero headline only */
--lift:         4px;     /* card hover */
```

`--ease-out-expo` (0.19, 1, 0.22, 1) is dropped in favour of the spec's `--ease-out`. They are close
cousins; having both is how ad-hoc easings start.

## 3. Gesture per section

The rule the spec sets is that no two sections share a gesture. Ours, top to bottom:

| Section | Gesture | Why this one |
|---|---|---|
| **Header** | **Scroll-linked, continuous.** Background alpha and backdrop blur interpolate across the first 100px of scroll. No entrance — it is present from the first paint, it only densifies. | Replaces today's binary `is-scrolled` toggle at `scrollY > 8` ([`Header.tsx:20`](src/components/Header/Header.tsx#L20)), which snaps. The header is furniture; furniture doesn't animate in. |
| **Hero** | **Orchestrated page-load timeline** (§4) + hero image parallax at 0.15 of scroll speed. | The page's one composed moment. Parallax is deliberately at the bottom of the spec's 0.15–0.25 range — see §5.2. |
| **Treatments** | **Staggered entrance, 70ms apart, capped at 6 cards** (we have 4). Each card: image wipes up from a mask while the text block rises 12px. Hover: lift 4px + shadow deepen + inner image to 1.04, all three on `--dur-micro`/`--ease-hover` so it reads as one gesture. | A price list is a list — a stagger is the honest reading order. The hover is the spec's card gesture unchanged. |
| **Gallery** | **Mask wipe, no rise, no stagger chain.** Tiles uncover in grid reading order, 70ms apart in pairs, wiping from the direction of their own long edge (wide tiles wipe from the left, the tall tile wipes from the bottom). Blur-up as each image decodes. | The asymmetric grid is the point; a wipe that follows each tile's own geometry makes the layout legible rather than fighting it. Distinct from the Treatments stagger because nothing rises. |
| **Lightbox** | **FLIP.** The thumbnail animates from its grid rect to the full-size rect, 420ms `--ease-in-out`, backdrop fades under it in 200ms. Close reverses exactly. Arrows cross-fade at `--dur-state`; the strip never slides. | The spec's requirement, and the one gesture that does real work: with six near-identical candle photos, losing track of which one you clicked is a live risk. |
| **Book a session / Find us** | **Reveals as one unit** — a single 560ms opacity + 12px rise for the whole panel, no internal stagger. All the detail goes into the form's micro-interactions instead (§3.1). | Staggering eight form fields is fussy and delays the first field. The reward here is in the interaction, not the arrival. |
| **Footer** | **No entrance.** Link hover only. | You reach it already scrolling. An animation here answers none of the spec's three questions. |
| **Reviews** | **Cross-fade in place.** Nothing travels, nothing is masked: the featured quote and then the supporting grid come up on opacity alone, 70ms apart. | *Built, no longer deferred.* The section is a static asymmetric grid rather than a carousel, so the spec's carousel direction (700ms glide, pagination as a continuous fill) doesn't apply. A cross-fade is the carousel gesture's honest translation to a static layout, and it is the only place on the page where nothing moves — which is what keeps it distinct from the wipes above and below. |

### 3.1 Form micro-interactions

Labels float on focus. The focused field's border **draws in from the left** as a `scaleX` on a
pseudo-element rather than switching colour (today it switches colour,
[`Reservation.css:61`](src/components/Reservation/Reservation.css#L61)). Validation errors slide down
and push content. The submit button transitions to in-progress, then **morphs to a checkmark** — the
button is the confirmation; no toast appears elsewhere. Failure shakes once, ≤250ms, and states what
went wrong.

**One scoped exception to the transform-only rule, flagged:** "errors push content instead of
overlaying" cannot be done with transform and opacity alone. I'll animate `grid-template-rows:
0fr → 1fr` on the error slot. It is a layout animation, but on a two-line subtree, triggered by a
discrete blur/submit event, never during scroll, and never more than one at a time. The alternative —
permanently reserving error space under every field — costs ~190px of vertical rhythm in a form that
already stacks on mobile. Say the word if you'd rather have the reserved space.

## 4. Hero timeline — beat sheet

`t` is milliseconds from the start of the sequence. The sequence starts on `document.fonts.ready`,
with an 800ms timeout fallback so a slow font can never withhold content (spec: nothing above the
fold animates before fonts load; also nothing waits forever on them).

Elements are the real DOM in [`Hero.tsx`](src/components/Hero/Hero.tsx).

| # | t start | dur | Element | Gesture |
|---|---|---|---|---|
| 0 | — | — | all | **Pre-state, painted:** image at `scale(1.06) brightness(0.45)`, overlay at 0, content masked, header at 0. Layout is final. Nothing has moved. |
| 1 | 0 | 1200 | `.hero__image` | `scale 1.06 → 1.00`, `brightness 0.45 → 1` — the candle warm-up, running underneath everything else |
| 1b | 0 | 400 | `.hero__media::after` | gradient overlay `opacity 0 → 1`, ahead of the text that sits on it |
| 2 | 120 | 640 | `h1` "Unwind at any hour." | mask wipe upward, `clip-path inset(100% 0 0 0) → inset(0)`, `y 16 → 0` |
| 3 | 190 | 560 | `.hero__status` (dot + Enugu clock) | opacity + `y 12 → 0` |
| 4 | 260 | 560 | `.hero__tagline` | mask wipe upward |
| 5 | 330 | 560 | `.hero__actions` | both CTAs as one unit, opacity + `y 12 → 0` |
| 6 | 400 | 560 | `.hero__facts` | list as one unit, opacity + `y 12 → 0` |
| 7 | 470 | 400 | `.site-header` | opacity 0 → 1 |
| 8 | 1200 | — | — | sequence ends; `IntersectionObserver` reveals are armed, `will-change` is stripped |

**Budget check.** Stagger 70ms (spec 60–90) · chain of 6 (cap 6) · travel ≤16px (cap 24) · total
1200ms (spec 1000–1400) · end-to-end 1200ms (cap 1800) · **last text beat settles at 960ms**, inside
the spec's 1s readability floor. CTAs are hit-testable throughout — only opacity and transform change,
never `pointer-events` or layout, so there is no dead zone and no CLS.

**No scroll cue beat.** The spec's load order ends with "header and scroll cue"; this design has no
scroll cue and I'm not adding one to fill a slot in a sequence.

**Headline lines.** The spec wants line-by-line, 80ms apart. "Unwind at any hour." is one rendered
line at every width above 380px, so beat 2 is one beat. I'll split on **rendered line boxes** measured
after `fonts.ready` and stagger them at 70ms, which means narrow phones get the two-line version for
free and nobody gets an invented line break. Tagline is a separate beat, not letter- or word-level.

**What this replaces.** Today's hero ([`Hero.css:162-190`](src/components/Hero/Hero.css#L162-L190)) is
a 2.8s brightness ramp with a 5-child fade-up staggered at 120ms — over the 1800ms ceiling, over the
90ms stagger ceiling, and a group fade, which is exactly the "generic default" §6 warns about. It gets
rewritten, not tuned.

## 5. Deviations from the reference site's motion

Stated honestly: remedyplace.com is a Next.js/Sanity site whose motion is client-side, so a server-side
fetch shows markup and responsive image params but not the running animation. The deviations below are
against the Step 1 analysis and the site's observable structure; where I'm inferring, I say so.

1. **No page transitions.** The reference is multi-page and its arrival moment is spent on route
   changes. We have one page and no router (§3 constraint), so all of that weight goes into the hero
   load sequence instead. This is the single biggest structural difference in feel.
2. **Parallax at 0.15, and only on the desktop split column.** The reference runs full-bleed hero
   media. Ours is a split layout, because every photo supplied is portrait, and the hero source is only
   736px wide (README image table). Pushing parallax to the top of the range on an already-soft image
   reveals crop edges and amplifies the softness. Lower and narrower is the honest setting.
3. **No smooth-scroll library.** §6a permits Lenis. I'm declining it: this site's entire navigation is
   anchor links with a deliberate focus hand-off to the target section, and that hand-off plus
   find-in-page and keyboard scrolling is load-bearing for the Accessibility score currently at 5/5.
   Lenis can be made to respect all three, but the upside here is small and the regression surface is
   the one area the build is strongest in. Native scrolling, plus `scroll-behavior: smooth` gated on
   `prefers-reduced-motion`, which is already in [`base.css:14-18`](src/styles/base.css#L14-L18).
4. **A loop the reference doesn't have.** The pulsing "open now" dot. Every other site in this niche
   animates something decorative; ours animates the one fact — a 24-hour spa — that the reference,
   with its appointment model, has no reason to state.
5. **Hover restraint.** Gallery hover stays at `scale(1.03)`, retuned from its old 0.9s to
   `--dur-micro`. Cards lift 4px, not 8. Inferred from the reference's general restraint rather than
   measured: the Step 1 notes don't record its hover timings, and its motion is client-side, so a
   server-side fetch can't recover them. Confirmed as the approach to take.

## 6. Deviations from §6a itself

1. **GSAP: not used. Approved.** §6a allows GSAP + ScrollTrigger *via CDN*
   and overrides §6's vanilla-JS line — but §6 was already swapped to React + Vite, so a CDN tag would
   sit outside the bundle, unversioned and unable to tree-shake, against an LCP-under-2.5s-on-4G target.
   More to the point, §6a's own rule is "if a sequence can be expressed in plain CSS with an
   `IntersectionObserver` class toggle, do it that way instead" — and all of ours can, except the hero
   timeline and the lightbox FLIP, which the Web Animations API handles in well under a kilobyte.
   GSAP + ScrollTrigger is ~70KB for four effects.

   *As built:* no GSAP, and in the end no WAAPI for the hero either. The whole page-load sequence is
   plain CSS keyframes driven by one attribute on `:root`, with JavaScript doing only the two things
   CSS can't — measuring the headline's rendered lines, and gating the start on `fonts.ready`. The Web
   Animations API is used in exactly one place, the lightbox FLIP, where the geometry has to be
   measured at run time. Total motion JavaScript: one module, no dependencies.
2. **`motion.ts`, not `motion.js`.** TypeScript project. All timeline constants and the beat sheet in
   §4 live in that one file as a typed table, commented, so timings tune in one place.
3. **Reviews is built** rather than deferred, with placeholder quotes that are marked as such in
   `src/data/reviews.ts`, in the rendered markup and in the README. Its carousel direction is N/A: see
   the gesture table above.
4. **The layout-animation exception** for validation errors, in §3.1. Approved.
5. **Rubric.** Row 10 Motion quality 15%, weights renormalised as given — they sum to 100. I'll
   re-score the whole table after building, including a verified reduced-motion result.

## 7. Reduced motion

Non-negotiable per spec. Under `prefers-reduced-motion: reduce`:

| Normally | Reduced |
|---|---|
| Hero timeline, 1200ms | Everything at its final state on first paint. No warm-up, no wipes. |
| Section reveals | Instant, or a ≤200ms opacity fade. Never invisible — the `IntersectionObserver` still fires and still adds the class. |
| Parallax, header blur interpolation | Off. Header takes its scrolled state at the 100px mark directly. |
| Lightbox FLIP | Opens at final size, backdrop fades ≤200ms. |
| "Open now" dot pulse | Static dot. |
| Card hover lift / image scale | Colour and shadow only, no transform. |
| Error slide-down, button morph, failure shake | Error appears instantly; button swaps state without morphing; no shake, message still stated. |
| `scroll-behavior: smooth` | Already gated, stays gated. |

The failure mode this guards against is an element that is invisible because its reveal never fired.
Every reveal starts from a class-toggled visible baseline, so the animation is additive.

**Verification, to be reported with the build:** emulated `prefers-reduced-motion: reduce` in Chrome
DevTools and macOS System Settings → Reduce Motion, walking all five widths (320/768/1024/1440/1920),
confirming every section is visible, the lightbox opens and closes, and the form reaches success and
failure states. Plus a 60fps check under 4× CPU throttling as the mid-range-Android proxy.

## 8. Order of work

1. Tokens (§2) and strip the three old ones — everything else depends on this.
2. `src/lib/motion.ts`: the beat sheet as data, the `IntersectionObserver` reveal helper, the
   reduced-motion gate, `will-change` add/remove.
3. Hero timeline (§4), replacing `Hero.css`'s current animation block.
4. Header scroll interpolation.
5. Section reveals: Treatments, Gallery, Reservation panel.
6. Lightbox FLIP.
7. Form micro-interactions.
8. Reduced-motion pass and the verification in §7, then re-score §7 with row 10.
