# §6b — Motion amplitude amendment

> Amends §6a. Where the two conflict, this section wins. Everything in §6a not
> named here still stands — easing curves, performance rules, reduced-motion
> handling, and the "do not" list are unchanged.

## Why this exists

§6a was calibrated to avoid the generated-page look and went too far the other
way. The result is technically correct and perceptually absent: a viewer
scrolling at normal speed cannot tell that anything animated. Motion that
nobody notices is not restraint, it's cost without benefit.

The target is motion a viewer would *describe* if asked — "the images uncover
themselves," "the cards come up in sequence" — while still being unable to
point at any single element and call it flashy. Bigger gestures, same
discipline.

## Revised values

| Token | §6a | Now |
|---|---|---|
| Reveal travel | ≤24px | 48–64px |
| Hero text travel | ≤16px | 32–40px |
| Hover travel | ≤12px | unchanged |
| Reveal duration | 600–800ms | 700–900ms |
| Stagger | 60–90ms | 80–110ms |
| Stagger chain cap | 6 | 8 |
| Parallax intensity | 0.15–0.25 | 0.25–0.35 |

Easing stays `cubic-bezier(0.16, 1, 0.3, 1)` — the long settle is what keeps a
larger movement from reading as cheap. Still no bounce, elastic, or overshoot.

## Two-speed reveals

This is the main change and it applies to every image on the page. A single
element moving on its own is the flat, default gesture. Two elements moving at
different rates inside the same reveal is what reads as considered.

For every image: the mask or container wipes open while the image *inside* it
scales from 1.10 to 1.00 over the same duration, with the same easing. The
frame uncovers; the picture settles into the frame. The two finish together.

Apply the same principle to text blocks where there's a heading and body: the
heading leads, the body follows 100ms behind at slightly greater travel, so the
block arrives with internal depth rather than as one plane.

## Per-section upgrades

**Hero.** Keep the eight-beat structure and the 1200ms total. Raise text travel
to 32–40px and let the background settle from 1.10 rather than 1.06. The last
text beat must still land inside the 1s readability floor.

**Treatments.** Stagger stays, but each card now arrives with the two-speed
treatment: card wipes up from a mask while its image scales down into place.
110ms apart. The price and duration line fades a beat after its card, so each
card has its own small internal sequence.

**Gallery.** Currently the most under-served section relative to its visual
weight. Keep the per-tile edge wipe, but add: tiles reveal in a diagonal
sequence rather than row order, and each tile's image scales 1.10 → 1.00 during
its wipe. Give alternating columns slightly different scroll-linked drift
(0.05 differential, no more) so the grid breathes as you pass it.

**Reviews.** "Cross-fade in place" is invisible — replace it. The featured quote
reveals with a line-by-line mask wipe, matching the hero treatment, at 110ms per
line. The three supporting cards stagger in beneath it at 48px travel. Stars
fill left to right over 400ms once the card lands.

**Booking panel.** Reveal as one unit, as planned, but at 64px travel so the
arrival is felt. Form micro-interactions unchanged — those were done well.

**Footer.** "Nothing" is wrong for the last thing on the page. Give it a quiet
arrival: the top rule draws across from left over 600ms, then the columns fade
up 80ms apart at 32px. Socials last.

## Section headings

Every section heading gets a mask wipe upward, 700ms, firing 60ms before the
section's own content. It's a small repeated gesture that gives the page a
consistent spine without being the same treatment as the content below it.

## Trigger timing

Section top at 70–85% of viewport is correct — keep it. But the reveal should
feel like it's responding to the viewer's arrival, so if any element is already
past 50% of viewport height when its observer first fires, play the reveal at
0.6× duration rather than full length. Late is worse than fast.

## Verification

Screenshot each section at 0ms, 300ms, and 900ms into its reveal and include
them. If the 0ms and 300ms frames are hard to tell apart, the amplitude is
still too low.

## Rubric change

Row 10, Motion quality, is rewritten. A 5 now requires everything §6a asked for
**plus**: a viewer scrolling at normal speed can describe what happened in each
section without being prompted, no two sections share a gesture, every image
reveal is two-speed, and no section arrives without motion. A build that
satisfies every numeric budget but reads as static scores 2, not 5.
