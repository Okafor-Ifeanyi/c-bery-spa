# Build Prompt — C-berry Spa (single-page website)

> Fill in the bracketed fields, attach your images, then paste the whole thing as one message.

---

## 0. Inputs (fill these in)

- **Reference site:** `https://www.remedyplace.com`
- **Business name:** C-berry
- **Tagline / positioning:** `["Luxury self-care, spa life, feminine wellness & everyday healing."]`
- **Location / address:** `Inside De Castle Hotel, 14 Umuona Street, behind Park Lane Hospital, G.R.A., Enugu, Nigeria`
- **Phone / WhatsApp:** `[+234 702 552 9519]`
- **Email:** `[...]`
- **Opening hours:** `[24 hours, 7 days a week]`
- **Socials:** Instagram `[...]` · Facebook `[...]` · TikTok `[...]` · X `[...]`
- **Services to list:**``["Massage - Full Body with Essential Oils - 60 mins - ₦35,000" , "Nail Service - Manicure & Pedicure - 30 mins - ₦15,000", "Facial Treatment - Deep Cleansing & Hydration - 45 mins - ₦25,000", "Body Scrub - Exfoliation & Moisturization - 50 mins - ₦30,000", "Aromatherapy Session - Relaxation & Stress Relief - 40 mins - ₦120,000"]`
- **Reviews:** `[name, picture, status, rating, quote]` × 3–6 (or tell it to write realistic placeholders)
- **Attached images:** `[hero.jpg, treatment1.jpg, treatment2.jpg, treatment3.jpg, gallery1.jpg, gallery2.jpg, gallery3.jpg]` (all images are in `/assets/images/`)  

---

## 1. Role and objective

You are the design lead and front-end engineer for this build. Deliver a **production-ready, single-page website** for **C-berry**, a spa.

The reference site above is the **visual and structural benchmark**. It is a multi-page site; mine is **one page**. Reproduce its *quality level, layout logic, spacing rhythm, and overall feel* — do **not** copy its business name, its written copy, or its brand marks. All text is written fresh for C-berry.

## 2. Process — follow in this order

**Step 1 — Study the reference.** Fetch and read the reference URL and its key subpages. Write a short analysis covering: colour palette (hex values), typefaces and type scale, spacing/grid system, corner radii and shadow language, imagery style (crops, colour grade, aspect ratios), motion behaviour, and how it handles navigation, buttons, and forms.

**Step 2 — Write a design plan and show it to me before coding.** Include:
- 4–6 named hex values for the palette
- Typefaces and their roles (one or two families, no more)
- ASCII wireframe of the full page, top to bottom
- Three principles that make this page specifically C-berry's and not a generic spa template

Then self-check the plan: if any part of it is what you'd produce for *any* spa brief, revise it and say what you changed. Only then write code.

**Step 3 — Build.**

**Step 4 — Score yourself against the rubric in §7 and fix anything below 4/5 before handing over.**

## 3. Hard constraints

- **One page. React / Modular architecture.** No router, no separate pages. Nav links are smooth-scroll anchors.
- Section order, top to bottom: **Hero → Services → Gallery → Reviews → Reservation/Contact → Footer with socials.**
- Sticky header with the C-berry wordmark, anchor nav, and one primary CTA ("Book a session" or similar).
- Mobile-first. Must work down to 320px and up to 1920px.
- No lorem ipsum in the final output. Every string is real C-berry copy.
- No placeholder `#` links in the footer or socials — use my URLs, or omit the icon if I didn't give you one.

## 4. Image handling (important)

Priority order for every image slot:

1. **My attached images first.** Use them where they fit best — a photo of a treatment room belongs in the hero or gallery, not as a service icon.
2. **If I haven't supplied enough, pull images from the reference site** (same niche, so they'll fit). Download them into `/assets/images/`, don't hotlink to the original domain — hotlinking breaks when they change their CDN and it's bad form.
3. **If still short, use free-licence stock** (Unsplash / Pexels) with the source URL noted in the README.

Rules for all images: descriptive `alt` text, explicit `width`/`height` to prevent layout shift, `loading="lazy"` on everything below the fold, consistent aspect ratios within a grid, and a consistent colour grade across the page so mixed sources don't look mismatched.

Keep a table in the README listing every image, where it came from, and which slot it fills — I need to know what to swap out before launch, since reference-site photos are borrowed for the build, not licensed to me.

## 5. Section specifications

**Hero** — Full-viewport or near-full. Business name, a one-line proposition, one primary CTA and one secondary. Background image or video with a legibility treatment (overlay/gradient) so text passes contrast at any screen size. Optional trust strip: years open, treatments offered, rating.

**Services** — Grid or list of treatment cards. Each: name, 1–2 line description, duration, price, and a "Book" action that scrolls to the reservation form and pre-selects that service in the dropdown. Layout adapts: 3-up desktop, 2-up tablet, 1-up mobile.

**Gallery** — Photo grid showing the space, treatments, and details. Masonry or a deliberate asymmetric grid, not a plain uniform 3×3 unless that genuinely suits the design. Click opens a lightbox with keyboard navigation (arrows, Esc) and focus trapping. Lazy-loaded.

**Reviews** — 3–6 testimonials: name, star rating, quote, optional avatar and date. Carousel or static grid — pick whichever suits the design, but if it's a carousel it must have visible controls, pause on hover, swipe on touch, and work without JavaScript running.

**Reservation / Contact** — Two columns on desktop, stacked on mobile. Left: form with name, email, phone, service (select, populated from the Services section), preferred date, preferred time, party size, and a notes textarea. Client-side validation with inline error messages, disabled submit while pending, and a clear success state. Wire the form to Formspree (or leave a clearly marked `TODO: endpoint` constant at the top of the file). Right: address, embedded map, phone and WhatsApp click-to-action links, email, and opening hours.

**Footer** — Wordmark, short about line, anchor links, social icons (inline SVG, no icon-font dependency), copyright with the current year, and a discreet credit line if appropriate.

## 6. Technical requirements

- **Stack:** single `index.html` + `styles.css` + `script.js`, vanilla JS, no build step. *(Swap this line if you'd rather have React + Tailwind or Next.js.)*
- Design tokens as CSS custom properties at the top of the stylesheet — colours, type scale, spacing scale, radii — so I can rebrand by editing one block.
- Self-hosted or Google Fonts with `display=swap`. No more than two families, no more than four weights total.
- **Accessibility:** WCAG 2.1 AA contrast, semantic landmarks (`header`/`main`/`section`/`footer`), one `h1`, logical heading order, visible focus rings, all interactive elements keyboard-reachable, `prefers-reduced-motion` respected, form labels properly associated.
- **Performance:** images compressed and served at sensible dimensions, no render-blocking JS, target LCP under 2.5s on 4G.
- **SEO:** title, meta description, Open Graph and Twitter card tags, favicon, and a `LocalBusiness` JSON-LD block with the address, hours, and phone.
- **Motion:** one orchestrated moment, used deliberately. Fade-and-slide-up on every single section is the generic default — avoid it.

## 7. Acceptance rubric — score each 1–5, fix anything under 4

| # | Criterion | Weight | What a 5 looks like |
|---|---|---|---|
| 1 | Fidelity to reference | 20% | Spacing rhythm, type scale, and layout logic clearly descend from the reference; a viewer would call them siblings, not clones |
| 2 | Brand distinctness | 15% | Reads as C-berry, not as the reference with the name swapped. No borrowed copy or brand marks |
| 3 | Section completeness | 15% | All seven sections present, in order, every field from §5 implemented |
| 4 | Responsiveness | 10% | No horizontal scroll, no overlap, no orphaned text at 320 / 768 / 1024 / 1440 / 1920 |
| 5 | Image handling | 10% | Fallback chain followed, consistent grade and ratios, alt text everywhere, README source table present |
| 6 | Form correctness | 10% | Validates, shows inline errors, pre-selects the service, has success and failure states, submit is wired or clearly TODO'd |
| 7 | Accessibility | 10% | Passes AA contrast, full keyboard traversal including the lightbox, reduced motion honoured |
| 8 | Code quality | 5% | Tokenised CSS, no dead rules, no specificity conflicts between section and element selectors, readable and commented |
| 9 | Copywriting | 5% | Plain, active, specific to a spa in this location. Buttons say what happens. No filler |

After building, print the filled-in table with your scores and a one-line justification for each, then list what you changed as a result.

## 8. Do not

- Do not copy the reference site's HTML/CSS wholesale, its text, or its logo.
- Do not produce multiple pages or a router.
- Do not invent prices, an address, or hours — use mine, or mark them `TODO`.
- Do not fabricate reviews as if they were real customers; mark placeholder reviews clearly in a comment.
- Do not add a cookie banner, newsletter modal, chat widget, or scroll-jacking.
- Do not ship a generic template look: identical rounded cards with the same soft grey shadow, all-caps eyebrow labels above every heading, or a `→` glued to every button.

## 9. Deliverables

1. The working site files
2. `README.md` — how to run it, the token block explained, the image source table, and the list of `TODO`s I need to fill in
3. The completed rubric table with your self-scores
