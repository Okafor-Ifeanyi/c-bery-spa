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
- [ ] Add `"email"` to the `LocalBusiness` JSON-LD in `index.html`.
- [ ] If the booking form moves to Formspree, set the Formspree notification address to this inbox.

### 2. Social links
- [ ] Add a `socials` array (`{ network, url }`) to `src/data/business.ts`. Only networks with a real URL are listed.
- [ ] Render inline-SVG icons in the footer (no icon font), each with an accessible name such as "C-berry on Instagram".
- [ ] Add the URLs to `"sameAs"` in the JSON-LD.

### 3. Reviews section
- [ ] Collect 3–6 real reviews with the reviewer's permission: name (or first name + initial), rating, quote, month, optional photo.
- [ ] New section between Gallery and Visit, id `#reviews`, and a "Reviews" link in the header nav and footer.
- [ ] Layout planned in the design plan: static asymmetric grid, one featured quote in large display italic plus two or more smaller ones. No carousel.
- [ ] Only add `aggregateRating` to JSON-LD if the reviews are collected on the site itself (Google's self-serving review rules).

## Acceptance criteria

- No empty or `#` links anywhere on the page.
- Every review is from a real, consenting guest.
- Header, footer and JSON-LD stay in sync with `src/data/business.ts`.
