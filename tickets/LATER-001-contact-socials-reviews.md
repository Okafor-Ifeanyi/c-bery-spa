# LATER-001 — Add email, social links and a Reviews section

**Status:** Backlog (deferred at launch)
**Raised:** 2026-09-15
**Type:** Feature

## Why this was deferred

The launch build shipped without these because the content didn't exist yet:

- no public email address
- no Instagram, Facebook, TikTok or X URLs
- no real customer reviews (placeholder reviews would read as fabricated)

The brief forbids placeholder `#` links and invented reviews, so each was left out instead of stubbed.

## Scope

### 1. Email
- [ ] Add `email` to `business` in `src/data/business.ts`.
- [ ] Show it in the Visit section contact list as a `mailto:` link, after WhatsApp and phone.
- [ ] Set `email` in `src/data/business.ts`; the JSON-LD picks it up at build.
- [ ] If the booking form moves to Formspree, set the Formspree notification address to this inbox.

### 2. Social links
- [ ] Fill in `socials` in `src/data/business.ts` (already there, all `null`). Only networks with a real URL are listed.
- [ ] Render inline-SVG icons in the footer (no icon font), each with an accessible name such as "C-berry on Instagram".
- [ ] `sameAs` in the JSON-LD is built from `socials` automatically.

### 3. Reviews section

**The section is now built** (2026-09-16), so what is left here is the content, not the work.

- [x] New section between Gallery and Visit, id `#reviews`, with a "Reviews" link in the header nav and footer.
- [x] Static asymmetric grid: one featured quote in large display italic plus three smaller ones. No carousel.
- [x] Scroll gesture: a cross-fade in place, the one section on the page where nothing travels.
- [ ] **Replace the placeholder quotes.** `src/data/reviews.ts` holds four written-copy reviews, marked
      as placeholders at the top of the file and in the rendered markup. Collect 3–6 real reviews with
      the reviewer's permission — name (or first name + initial), rating, quote, month, optional photo —
      and swap them in. The shape of the data doesn't change.
- [ ] Only add `aggregateRating` to JSON-LD if the reviews are real *and* collected on the site itself
      (Google's self-serving review rules). Nothing has been added yet.

## Acceptance criteria

- No empty or `#` links anywhere on the page.
- Every review is from a real, consenting guest. **Not yet true:** the four currently shipping are
  placeholders and must not go live.
- Header, footer and JSON-LD stay in sync with `src/data/business.ts`.
