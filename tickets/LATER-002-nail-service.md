# LATER-002 — Bring back Nail Service when it launches

**Status:** Backlog (not offered yet)
**Raised:** 2026-09-16
**Type:** Feature

## Why it was removed

Nail Service (Manicure & Pedicure, 30 min, ₦15,000) was in the original brief, but the treatment isn't being offered yet, so shipping it would take bookings C-berry can't fulfil.

`assets/Nail_Service.jpg` is kept in the repo, unused, ready for its return.

## To restore

- [ ] Re-add the `nails` entry to `services` in `src/data/services.ts` (id `nails`, name "Nail Service", detail "Manicure & Pedicure", 30 min, ₦15,000, `image: 'nails'`, bookLabel "Book nails"). It appeared second, after Massage.
- [ ] Re-add its `SOURCES` entry in `scripts/process-images.mjs`:
      `{ slot: 'nails', file: 'assets/Nail_Service.jpg', grade: 'warm', alt: 'Hands and feet with glossy nude nails and white French tips, resting on grey satin' }`
- [ ] Run `npm run images` to regenerate `src/data/imageManifest.json`.
- [ ] `index.html`: add the Offer back to the JSON-LD catalogue, widen `priceRange` to `₦15,000–₦35,000`, and put nails back in the title and the three descriptions.
- [ ] `src/components/Services/Services.tsx`: the section's supporting line counts the treatments ("Four treatments…").
- [ ] README: re-add the `nails` row to the image table and drop the "unused" note.
- [ ] The image is only 628px wide, so it renders soft on 2× screens. Ask for the original first.

## Acceptance criteria

- The treatment appears in the grid, in the booking form's dropdown and in the JSON-LD, with the price it's actually sold at.
- The hero's "From ₦…" figure updates by itself, since it reads the lowest price in `services`.
