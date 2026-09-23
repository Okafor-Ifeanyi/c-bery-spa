# Build prompt — Footer credit + SEO

Two features for the C-berry site. Production URL is `https://c-berry.vercel.app`.

---

## Before you start — resolve the brand name

The repo folder is `c-bery-spa` (one R) while the brand is **C-berry** (two).
Search the whole codebase for both spellings and report every place each
appears. Brand-name consistency is the single biggest factor in ranking for a
brand query, so a split spelling across title, schema, copy and alt text will
actively hurt.

Do not rename the folder or the repo. Do normalise every user-visible and
machine-readable string to **C-berry**. Where the full name is needed, use
**C-berry Spa**. Tell me anything ambiguous rather than guessing.

---

## Feature 1 — Footer credit

Add a credit line to the footer bottom bar, alongside the copyright:

> Developed by [Ifeanyi Okafor](https://ifeanyi.ifeanyiokafor.com)

Requirements:

- The name is the link text. Not the whole phrase, not "here", not the URL.
- `target="_blank"` with `rel="noopener noreferrer"`. Leave it dofollow — it's a
  genuine attribution, not a paid link.
- Visually subdued relative to the rest of the footer, but **contrast must still
  pass WCAG AA at 4.5:1**. "Discreet" is where credit lines usually fail an
  audit — check the computed ratio and report it, don't eyeball it.
- Hover and focus-visible states use the same underline-wipe treatment as every
  other link on the page. No special-casing.
- It's part of the footer, so it inherits the footer reveal from §6b — it
  arrives with the last group, not on its own.
- Mobile: must not wrap awkwardly or collide with the copyright line at 320px.

---

## Feature 2 — SEO

**Objective:** rank first for "C-berry Spa" and its close variants, and compete
for local discovery queries in the business's area.

### Critical constraint — no review schema

Section §8 of the main brief forbids presenting fabricated reviews as real, and
the four reviews currently in `reviews.ts` are placeholders. Do **not** add
`aggregateRating`, `Review`, or any rating markup to the JSON-LD. Marking up
fake reviews is a direct violation of Google's structured data policy and risks
a manual action — the exact opposite of what we're trying to achieve. Leave a
clearly marked TODO showing where it goes once real reviews exist.

### Head and metadata

- `<title>` — brand first, category and location after, under 60 characters.
- `<meta name="description">` — 150–160 characters, written to be clicked, with
  the brand name inside the first 60.
- `<link rel="canonical">` pointing at the production URL. Absolute, with the
  protocol, no trailing-slash mismatch.
- `<html lang>` set correctly.
- `<meta name="robots" content="index, follow, max-image-preview:large">`
- Open Graph: `og:title`, `og:description`, `og:url`, `og:type="website"`,
  `og:site_name`, `og:locale`, and `og:image` at exactly 1200×630 with
  `og:image:alt`. Generate the OG image from an existing site photo — do not
  reference a file that doesn't exist.
- Twitter: `summary_large_image` card with matching fields.
- Favicon set: `.ico`, 32px and 192px PNGs, `apple-touch-icon` at 180px, plus a
  `site.webmanifest`. Report any you had to generate.

### Structured data

One JSON-LD block, `@type: DaySpa` (a subtype of `HealthAndBeautyBusiness` —
more specific than `LocalBusiness` and better for this query class). Include:

`name`, `alternateName`, `description`, `url`, `telephone`, `image`, `logo`,
`priceRange`, full `address` as a `PostalAddress`, `geo` with lat/long,
`openingHoursSpecification` covering all seven days, `areaServed`, `sameAs`
listing every social profile, and `hasOfferCatalog` with an `Offer` per
treatment carrying name, description and price.

Validate the output against Google's Rich Results Test and paste the result.
Flag any field you had to leave empty because I haven't supplied it.

### Crawlability

- `public/robots.txt` allowing everything and pointing at the sitemap.
- `public/sitemap.xml` with the single canonical URL and a `lastmod`. Section
  anchors do not belong in a sitemap — don't add them.
- Verify both are served correctly from the Vite build output, not just present
  in the repo.

### On-page

- Exactly one `<h1>`, containing the brand name and what the business is.
- One `<h2>` per section, in document order, each naturally carrying the term
  someone would search for that service.
- Descriptive `id` attributes on every section — they become shareable anchors
  and can earn sitelinks.
- Alt text rewritten across all images to be descriptive and specific.
  Descriptive first, keyword second — no stuffing, no repeated phrasing.
- Body copy should contain the full brand name a handful of times naturally,
  including once in the first 100 words.

### Performance

Core Web Vitals are a ranking input and the motion work has made this a heavier
page than it was.

- Serve images as WebP or AVIF with correct dimensions and `loading="lazy"`
  below the fold. The hero image is the LCP element — preload it.
- Targets: LCP under 2.5s, CLS under 0.1, INP under 200ms on mobile.
- Add cache headers for static assets via `vercel.json`.
- Run Lighthouse on the production build, mobile profile, and report all four
  scores. If SEO is below 100 or Performance below 90, fix and re-run.

### Deliverables

1. The implemented changes
2. Lighthouse scores, mobile, production build
3. Rich Results Test output
4. The computed contrast ratio for the credit link
5. A `SEO-CHECKLIST.md` listing the off-page tasks I have to do myself, in
   priority order, with what each one requires from me
