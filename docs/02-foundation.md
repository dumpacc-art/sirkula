# SIRKULA: design and architecture foundation

## Brand and typography
- Display: **Fraunces**; body/UI: **Inter**. Both verified as **SIL Open Font License 1.1** (commercial use allowed; OFL text must travel with any redistributed font files). Loaded from Google Fonts in `index.html`; nothing is bundled, so no font files were downloaded or relicensed by this project.
- Fallbacks: `Georgia, 'Times New Roman', serif` and `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.
- DaFont was not used: its fonts carry per-font licenses (many personal-use only), which is a poor fit for a commercial platform.
- Palette: deep forest greens for structure, lime only for primary emphasis/selection, ivory/off-white surfaces. Use green for meaning (primary action, verified, active), not decoration.

## Where styles live
| Layer | File | Rule |
|---|---|---|
| Tokens | `src/styles/tokens.css` | Custom properties only (colors, type scale, spacing, radii, shadows, z-index, status tones) |
| Base | `src/index.css` | Reset, element defaults, global form-control look, `.sr-only` |
| Shared components | `src/components/ui/<Name>.css`, `layout/<Name>.css` | One CSS file per component; class prefix `ui-*`, `sb__`, `tb__`, ... |
| Pages | `src/pages/<Page>/<Page>.css` | **One CSS file per page.** Every selector starts with the page's own root class (`.od`, `.mk`, ...). Never style bare `button`/`input` from a page; use shared components |

Use the semantic tokens (`--color-text-muted`, `--space-4`, `--shadow-md`, `--color-pending-bg`...) in new code; the older brand names still work.

## Shared components (`src/components/ui`)
`Button` (primary/secondary/ghost/danger, sm/md/lg, `loading`, disabled), `Card`, `Field` (label + hint + error wired with `aria-describedby`/`aria-invalid`), `EmptyState` (`tone`: empty | error | pending | success), `LoadingState`, `Modal`, `Toast`, `Select` (keyboard accessible dropdown), `RangeInput`, `KpiCard`, `StatusBadge`, `LangSwitch`.
State vocabulary: loading -> `LoadingState`; no data -> `EmptyState tone="empty"`; failure -> `tone="error"` (role=alert); awaiting review -> `tone="pending"` or `StatusBadge`; success -> `tone="success"` or Toast; disabled -> `Button disabled` (55% opacity, not-allowed cursor).
All text passed into shared components must already be translated with `t()`.

## Routes
`/` Home, `/login`, `/register`, `/app/*` (guarded). App areas and who may open them are declared once in `src/config/permissions.ts` (`ROUTE_ACCESS`) and consumed by the Sidebar; add a new page by adding its route, its sidebar item and its `ROUTE_ACCESS` entry.

## Single sources of truth
- `src/config/permissions.ts`: `ROLES`, `ROUTE_ACCESS`, `ACTION_ACCESS`, `canAccessRoute()`, `can()`.
- `src/config/businessRules.ts`: `SERVICE_AREA` (Indonesia-wide; no regional default), `MATERIAL_CATEGORIES`, `DEFAULT_SEARCH_RADIUS_KM`.
- `src/features/traceability/lifecycle.ts`: batch stages and transitions.
- `src/utils/validation.ts`, `src/utils/format.ts`: validators (email, password, Indonesian phone, positive number) and `Intl`-based formatters (IDR/USD, kg, km, dates; `id-ID` or `en-GB`).

## Data-access approach
Pages never fetch or touch `localStorage` themselves: they read and mutate through `useStore()` (`src/store/StoreContext.tsx`). The only external network use is Google Maps/Places, isolated in `src/lib/googleMaps.ts` and `features/nearby`. When a backend arrives, replace the store's internals with service calls (`src/services/*`) behind the same `useStore()` surface so pages do not change.

## Simulated vs backend
| Feature | Today | Needs a backend |
|---|---|---|
| Sign-in, registration, roles | Simulated in the browser | Yes: identity, sessions, server-side authorization |
| Verification of organizations / evidence | Demo review queue (admin role) | Yes: reviewer accounts, audit trail, file storage |
| Material registry, matches, agreements, orders, notifications | Demo data in `localStorage` | Yes: shared persistent database, concurrency, notifications |
| Payments, shipping | None (prototype orders only, no money moves) | Yes: payment provider, logistics |
| SmartMatch scoring, transport cost | Real algorithm, **estimated** costs and distances | Real tariff and road-distance data |
| Ecosystem map "Nearby facilities" | **Live Google Places** data (needs API key, referrer-restricted) | Optional: proxy/caching |
| Ecosystem map "Platform network" | Fictional demo participants | Yes: registered organizations |
| Language (EN/ID) | Client-side dictionary | No |
The UI already labels demo data ("PROTOTYPE · DEMO DATA"); keep that honesty in every new feature.
