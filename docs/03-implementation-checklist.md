# SIRKULA: 10-part implementation checklist

Status legend: [x] done, [~] partly done, [ ] not started. Each part ends with run + test + report; do not mark a box without testing it.

## Part 1: Audit and design foundation  [x] (browser run pending, see 01-audit.md)
- [x] Audit, defect fixes, tokens, base/component CSS split, shared components, permissions + business-rules modules, validators/formatters, Indonesia-wide map default, docs
- [ ] You: `npm install && npm run build && npm run dev`, smoke-test (see "Verification limits")

## Part 2: Layout, navigation and responsive shell
- [ ] Off-canvas mobile sidebar + menu button; tablet behavior; skip-to-content link
- [ ] Designed 404 and "no access" pages; route-level guard using `canAccessRoute`
- [ ] Migrate shell pieces (Topbar buttons, Sidebar) to shared tokens/Button

## Part 3: Public site and onboarding (Home, Login, Register)
- [ ] Marketplace-style hero and trust sections for individuals, processors, recyclers, businesses
- [ ] Registration by participant type, Indonesian phone/address fields (`validateIndonesianPhone`), pending-verification state
- [ ] Hero video/poster handling when the file is absent

## Part 4: Indonesian data model
- [ ] Province/city/regency structure; replace global "regions"; spread demo data across Indonesia
- [ ] IDR as default currency; store schema version + migration for `localStorage`
- [ ] Remove `leaflet`, `react-leaflet`, `@types/leaflet` if still unused

## Part 5: Material registry and listings (Upwork/Fiverr-style cards, filters, search, sort)
- [ ] Batch/listing cards, filter bar, saved filters, empty/loading/error states via shared components

## Part 6: SmartMatch and logistics
- [ ] Service areas per processor (province/city based), real constraints, explainable scoring, transport options

## Part 7: Traceability, evidence and verification
- [ ] Evidence upload UX (simulated storage, clearly labelled), reviewer workflow, public traceability view, verification statuses

## Part 8: Marketplace, cart and orders
- [ ] Seller product editing, order lifecycle, IDR pricing, stock rules, no real payments unless a provider is integrated

## Part 9: Communities, agreements, analytics, reports, notifications
- [ ] Agreement workflow polish, chart drill-down, CSV/PDF exports, notification preferences

## Part 10: Quality, accessibility, performance, deployment
- [ ] Focus trap/return in Modal, `aria-activedescendant` in Select, `aria-pressed` in LangSwitch, screen-reader pass
- [ ] Migrate all page buttons to `Button`; delete bare `root button` rules
- [ ] Browser/device test matrix, Lighthouse, bundle review, production env docs, backend integration plan
