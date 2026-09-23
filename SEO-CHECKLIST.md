# SEO checklist: off-page tasks

The on-page SEO work is in the code: metadata, JSON-LD, sitemap, robots.txt, icons and
cache headers. The tasks below need an account, a decision or information that only the
owner has. They are in priority order, and each lists what it needs from you.

Throughout, "NAP" means the business **n**ame, **a**ddress and **p**hone number.
Search engines match listings across the web by these, so use them exactly as written
here, character for character, everywhere:

> **C-berry Spa**
> De Castle Hotel, 14 Umuona Street, G.R.A., Enugu, Enugu State, Nigeria
> +234 702 552 9519

---

## 1. Take the placeholder reviews off the live page (launch blocker)

`src/data/reviews.ts` holds four written-copy reviews. Visitors will read them as real, and
the brief (§8) forbids that. Before or alongside the next deploy, either hide the Reviews
section or replace the quotes with real ones.

**Needs from you:** a decision (hide the section, or wait for real reviews), and later 3–6
real reviews given with the guest's permission: name or first name and initial, rating,
quote and month.

## 2. Decide on the domain before anything else is registered

Every listing below links to the website. If `c-berry.vercel.app` will later be replaced by a
custom domain (for example `cberryspa.com`), make the change first. Otherwise you'll have to
update every listing and set up Search Console a second time. A custom domain also looks more
credible in results and in the business listing.

**Needs from you:** a yes or no. If yes: buy the domain and add it in Vercel (Project →
Settings → Domains). Then change `SITE_URL` in `src/data/business.ts`, the absolute URLs in
`index.html`, `public/robots.txt` and `public/sitemap.xml`, and redeploy. Keep the vercel.app
address redirecting to the new domain.

## 3. Supply the missing business details

These are left out of the JSON-LD until they're set. `npm run build` prints a warning naming
each one.

| Field | Where it goes | What to send |
|---|---|---|
| Email | `business.email` | The public booking address |
| Instagram, Facebook, TikTok, X | `business.socials` | Full profile URLs. Leave a network `null` if you don't use it |
| Coordinates | `business.geo` | Latitude and longitude of the hotel entrance, to 5–6 decimal places. In Google Maps, right-click the pin and click the numbers to copy them |
| Postal code (optional) | not yet in the data | The NIPOST code for the address, if you know it. I haven't guessed one |

**Needs from you:** the values above.

## 4. Create and verify the Google Business Profile

This is the biggest lever for "spa in Enugu"-type searches and for the knowledge panel that
appears for a search on the business name. Nothing on the website can substitute for it.

- Business name: the name on the signage, exactly. If the sign says "C-berry", don't add
  "Spa" here: Google treats extra words in the name as keyword stuffing. **Tell me which it is**,
  so the site and the listing match.
- Primary category **Day spa**. Add Massage spa, Facial spa and Beauty salon only if they're
  accurate.
- Address as in the NAP block above. Mention "Inside De Castle Hotel" in the address line or
  the description.
- Hours: open 24 hours, all seven days.
- Website: the canonical URL. Appointment link: the same URL with `#visit` at the end.
- Services, with the four treatments and prices as on the site.
- At least 10 real photos: exterior and signage, treatment rooms, products.

**Needs from you:** a Google account with owner access, and the verification step (usually a
video of the premises and signage, sometimes a postcard or phone call). It can take several
days.

## 5. Google Search Console: verify, submit, inspect

- Add a **URL-prefix property** for the canonical URL. A Domain property works only once you
  own a custom domain.
- Verify it with an HTML meta tag or file. Send me the tag and I'll add it to `index.html`.
- Submit `sitemap.xml`.
- Use URL Inspection on the home page → Request indexing.
- Run the **Rich Results Test** (search.google.com/test/rich-results) on the live URL. I couldn't
  run it from here because it requires sign-in. The expected result is a valid Local business item
  with no errors.

**Needs from you:** a Google account (the same one as the Business Profile is simplest).

## 6. Claim the social profiles under one name

Use the same display name and website link on every profile, and put the NAP in the bio where
the platform allows. Then send me the URLs for step 3, so they appear in `sameAs`.

**Needs from you:** access to, or creation of, the Instagram, Facebook, TikTok and X accounts.

## 7. Collect real Google reviews

Reviews on the Business Profile affect local ranking directly. Ask guests after their visit,
for example with a short link or QR code at reception or in the WhatsApp confirmation. Reply to
every review. Never offer anything in return for a review.

Structured-data ratings on the site (`aggregateRating`) are allowed only for reviews collected
**on this site**, not ones copied from Google. The marked TODO in `src/seo/structuredData.ts`
shows where they go.

**Needs from you:** an ongoing habit, and the review link from the Business Profile dashboard.

## 8. Bing Places and Apple Business Connect

These cover Bing, Copilot, DuckDuckGo, Apple Maps and Siri. Bing Places can import the Google
profile once that is verified. Also add the site to Bing Webmaster Tools, which can import it
from Search Console.

**Needs from you:** a Microsoft account and an Apple Account. Each needs its own verification.

## 9. Local citations

List the business, with the NAP exactly as above, on the main Nigerian directories (VConnect,
BusinessList.com.ng, Finelib), and on the De Castle Hotel's own website and booking listings,
linking to the spa's site. A link from the hotel is the most valuable of these.

**Needs from you:** time to fill in the forms, and a contact at De Castle Hotel.

## 10. Replace stock photos and supply originals

Six gallery images are Unsplash stock photos, and several owner photos are only 736px wide.
Real, high-resolution photos of the rooms help in image search and in the Business Profile, and
build trust. Also confirm you hold the rights to `Massage1.jpg` and to the artwork in the
Reviews section (see the README image table).

**Needs from you:** photos (the original files, not WhatsApp copies) and confirmation of the
rights.

## 11. A proper logo file

The JSON-LD `logo` currently points at the "c" monogram favicon (`/icon-512.png`). A square
logo of at least 512px, on a solid background, is better for the knowledge panel.

**Needs from you:** the logo artwork, if one exists.

## 12. Monitor after four weeks

- Search Console → Performance: filter queries containing "berry" and check the average
  position for the brand search.
- Search Console → Core Web Vitals: real-user LCP, CLS and INP. Lighthouse only simulates
  these.
- Business Profile → Performance: searches, calls, direction requests and website clicks.

**Needs from you:** 15 minutes a month, and access for me if you want me to read the numbers.
