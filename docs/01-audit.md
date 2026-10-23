# SIRKULA: Part 1 audit

Audited: the uploaded `sirkula` project (Vite 5 + React 18 + TypeScript, React Router 6, framer-motion, lucide-react, recharts, qrcode.react).
Method: static reading of every file, scripted CSS/import analysis, contrast math, and a differential type-check (see "Verification limits").

## What exists
| Area | State |
|---|---|
| Entry | `index.html` -> `src/main.tsx` -> `<BrowserRouter><StoreProvider><App/><Toast/>` |
| Routes | `/` Home, `/login`, `/register`, `/app/*` behind a `Guard` (any signed-in user): dashboard, materials, matching, tracking, communities, agreements, marketplace (+ `:productId`), orders, map, analytics, reports, notifications, settings, admin. Unknown paths -> `PagePlaceholder` |
| State | `src/store/StoreContext.tsx`: one React context persisted to `localStorage` (`sirkula-proto-v1`). All pages read/write through `useStore()` |
| Data | `src/data/*`: demo batches, processors, participants, products, orders (clearly labelled demo) |
| Domain logic | `features/smart-match` (scoring), `features/traceability` (batch lifecycle), `features/nearby` (Google Places queries/filters) |
| i18n | EN/ID dictionary in `src/i18n/id.ts` (keys are English source strings) |
| Network | Only Google Maps JS / Places (needs `VITE_GOOGLE_MAPS_API_KEY`). No backend |
| CSS | 19 pages, each with exactly one `<Page>.css`, plus one CSS per shared component |

## Defects found and fixed in Part 1
1. **Bali hardcoded as the default service area** (`EcosystemMapPage`: `BALI` constant, label "Bali", Bali examples in the search box). The map now opens on an Indonesia-wide overview and searches only after the user picks an area or shares their location.
2. **Real CSS collision:** `PagePlaceholder.css` defined a global `.ph` (64px padding, centered) while `Select` used `<span class="ph">` for placeholder text. Renamed to `pgph` / `ui-sel__ph`.
3. **Page styles leaking into shared components:** `.mk button`, `.sm button`, `.cm button`, `.nt button`, `.ad button` (bare element selectors) out-ranked the Select trigger (`.ui-sel__btn`) and tied with the Modal close button. Select and Modal selectors now have higher specificity.
4. **Contrast below WCAG AA (4.5:1):** muted text 3.6-3.9:1, placeholders 2.4:1, danger text on tinted badge 3.7:1. Tokens adjusted (5.3-5.7:1, 4.7:1, 4.7:1).
5. Google Fonts were pulled via a render-blocking CSS `@import`; moved to `<link>` with `preconnect` in `index.html`.
6. `.lang-switch` component styles lived in the global stylesheet; moved to `LangSwitch.css`.
7. Role checks scattered across 5 files; now `src/config/permissions.ts`.
8. Material list duplicated in `MaterialsPage` and `EcosystemMapPage`; now `MATERIAL_CATEGORIES`.
9. Login validation duplicated inline; now `utils/validation.ts` (identical behavior).

## Open issues (not changed in Part 1; owner part in `03-implementation-checklist.md`)
- **Mobile navigation:** at <=768px the sidebar is `position:fixed` and always visible (72/244px) with no off-canvas toggle; it covers content. (README already admitted this.)
- **Data model is global, not Indonesian:** regions are "Southeast Asia / Northern Europe / Latin America / East Africa / South Asia", demo participants are worldwide, `matchEngine` uses continent centroids and service radii up to 12,000 km. Needs province/city-level Indonesian data.
- **Demo data still contains Bali coordinates** (3 processors/participants plus "Sanur Drop Point"). They are fictional and labelled demo, but should be spread across Indonesia when the data model changes.
- **Currency defaults to USD** (`prefs.currency`, product prices); Indonesian users expect IDR. `formatCurrency` already supports IDR.
- **Authentication is simulated:** any email + password >= 6 chars signs in, the role is self-selected, `Guard` only checks that a user object exists, and the admin check is UI-only. Safe for a prototype, not for real use.
- **localStorage store has no schema version:** `{...init, ...JSON.parse(saved)}` can load stale shapes after a code change.
- **Button styling is duplicated** across ~10 page stylesheets (and 5 use bare `root button` selectors). The new shared `Button` exists but pages are not migrated yet.
- **Accessibility gaps (static review, not tested with a screen reader):** Modal has no focus trap/return; Select listbox does not manage `aria-activedescendant`; `LangSwitch` lacks `aria-pressed`; no skip-to-content link; some Selects have no `label`.
- **Unused dependencies:** `leaflet`, `react-leaflet`, `@types/leaflet` (0 imports). Candidates for removal (not removed: could not run `npm` here).
- Hero video file is not included (`public/videos/README.txt` only); `AppRoutes` contains a dead placeholder-route generator; code is written as dense one-liners, which makes review and diffs harder.
- Google Maps key is a browser key by design: it must be restricted by HTTP referrer in Google Cloud. It is never a secret.

## Verification limits (honest status)
- `npm install` fails in this sandbox (no network), so **`vite dev` and `npm run build` were NOT run**, and nothing was tested in a browser.
- Done instead: (a) TypeScript compile of original vs modified `src/` with stubbed library types, diffed: no new real errors; (b) Node assertions for validation, formatting, permissions and i18n; (c) scripted CSS checks (balanced braces, one CSS per page, no stray `.ph`, one `:root`).
- Please run `npm install && npm run build && npm run dev` locally and check the Select dropdowns, Modals, Login, Settings role switch and the map page before starting Part 2.
