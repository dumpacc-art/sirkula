# SIRKULA (frontend prototype)

Circular economy platform prototype. All data is demo data stored in the browser (localStorage). No backend, real payments, or real verification.

## Run
```
npm install
npm run dev      # development
npm run build    # type-check + production build
```

## New in this version
- **Language (EN / ID)**: switch from the top bar, the public pages, or Settings. Applies instantly and is remembered. Dictionary: `src/i18n/id.ts` (keys are the English source strings; `{name}` entries are templates). Add new text with `t('English text')`.
- **Styled form controls**: all inputs, checkboxes and sliders are styled globally in `src/index.css`; dropdowns use `components/ui/Select` (themed open list) and sliders use `components/ui/RangeInput`.
- **Ecosystem map**: real Google Maps + live nearby recycling/waste facilities, filtered by radius, status, facility type and material. Requires an API key (see below).
- **Hero video**: put your video in `public/videos/hero.mp4` (optional `hero.webm`, `hero-poster.jpg`). Paths are in `src/config/media.ts`.

## Google Maps setup
1. In Google Cloud enable **Maps JavaScript API** and **Places API (New)**.
2. `cp .env.example .env.local` and set `VITE_GOOGLE_MAPS_API_KEY=...`
3. Restrict the key to your domain (HTTP referrers) in Google Cloud. Restart `npm run dev`.
Without a key the page shows a keyless Google map embed and a setup notice (no place list).

## Structure
- `src/pages/<Name>/<Name>.tsx + <Name>.css` : one stylesheet per page
- `src/styles/tokens.css` : design tokens (colors, type, spacing, status tones). `src/index.css` : base layer only
- `src/components/layout|ui` : AppShell, Sidebar, Topbar, Button, Card, Field, EmptyState, LoadingState, Modal, Toast, Select, KpiCard, StatusBadge (one CSS per component)
- `src/config/` : `permissions.ts` (roles and access) and `businessRules.ts` (service area, material categories)
- `src/store/StoreContext.tsx` : shared prototype state (auth, batches, matches, evidence, agreements, products, orders, notifications)
- `src/features/` : matching engine, lifecycle rules, nearby-facility config
- `src/utils/` : `validation.ts`, `format.ts`, `csv.ts`
- `src/data/` : demo datasets
- `docs/` : `01-audit.md`, `02-foundation.md` (design/architecture, simulated vs backend), `03-implementation-checklist.md`

## Demo
Sign in via `/login` ("Enter demo" with any role). Use the admin role to review evidence and open the Admin page.

## Known limitations
Not yet run in a browser after the Part 1 changes. Service area is all of Indonesia (the map starts on an Indonesia overview until you choose an area or share your location). Open issues and the build roadmap: see `docs/01-audit.md` and `docs/03-implementation-checklist.md`.
