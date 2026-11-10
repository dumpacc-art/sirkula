## Revisi 5-8

- **#5 Welcome mitra freeze**: `PartnerFoundOverlay` memakai handler lewat ref (efek tidak lagi jalan ulang tiap render), blur besar diganti gradien, ada `onExitComplete`; wizard baru menutup setelah animasi keluar selesai (sebelumnya di-unmount di tengah animasi). Hormati reduced-motion.
- **#6 Marketplace header kaca**: bar Shop/Orders/Sell menempel di bawah bar atas melayang (`--tb-stick`), kaca sendiri, animasi masuk global dimatikan di bar itu, kartu produk tidak lagi punya backdrop-filter masing-masing, tombol aktif ikut scroll.
- **#7 Analitik**: 12 KPI (6/4/2 kolom) dan 18 grafik (6 + 12; 3/2/1 kolom) lewat container query, jadi grid selalu penuh. Tambahan: Menunggu tinjauan bukti, Pengecualian terbuka, dan 5 grafik baru.
- **#8 Admin**: didesain ulang jadi konsol bertab (Ringkasan, Verifikasi, Pengecualian, Direktori, Log audit) dengan 8 KPI, filter, pencarian organisasi.
- Belum dijalankan dengan `npm run build` (tidak ada npm di sini).

## Revisi terbaru

- Hapus `public/videos/hero.mp4` (tidak dipakai halaman mana pun).
- Dashboard ditulis ulang: KPI (volume, tingkat pengalihan, estimasi CO₂e, bukti tertunda, penjualan), grafik alur & kategori, pipeline batch, volume per provinsi, pickup berjalan, aksi tertunda, aktivitas, dan peringkat mitra.
- Perbaikan glitch tombol "Ajukan penjemputan": `AppShell` tidak lagi memakai `framer-motion` dengan `opacity: 0` awal pada `<main>`, dan CTA/KPI dashboard tidak memakai animasi masuk.
- Laporan: riwayat laporan fiktif (`demoReportHistory`), kartu pilihan jenis, filter, unduh ulang.
- Materials: statistik, chip kategori, tampilan kartu/tabel, progres siklus hidup, detail dengan timeline. 4 batch demo baru (BT-1009..1012); `DATA_V` dinaikkan ke 4.

# Round 7: Logo everywhere, delete partner / delete Premium (demo), page-shaped skeletons

- **Logo SIRKULA (SVG)**: di-trace langsung dari gambar logo asli ke vektor (bukan digambar ulang): huruf, ikon, daun, tagline dan lengkung hijau mengikuti gambar. Panah lingkaran memakai gradient SVG hasil regresi warna dari gambar. Tanpa font, jadi tajam di ukuran berapa pun.
  - `components/brand/Logo.tsx`: `variant` = `mark`, `wordmark`, `lockup` (mark + wordmark), `full` (plus tagline + lengkung). `tone` = `color` (latar terang) atau `light` (latar gelap: huruf putih, hijau tua dicerahkan). Data trace ada di `brandPaths.ts` (dihasilkan, jangan edit manual).
  - Dipasang di: sidebar, topbar mobile, navbar dan footer landing, panel Login/Sign up, struk pickup, halaman 404, layar tunggu merek (`BrandSplash`).
  - File statis di `public/brand/`: `logo-{mark,wordmark,lockup,full}.svg` dan versi `-light`, `favicon.svg`, `apple-touch-icon.png`, `icon-192/512.png`, `og-image.png`; `index.html` memasang favicon, apple-touch-icon, manifest dan Open Graph.
  - Batas trace: tepi sedikit membulat di sudut tajam dan bayangan lembut di bawah huruf pada gambar asli tidak ikut. Untuk hasil paling bersih, ganti dengan file vektor asli dari desainer.
- **Hapus mitra (demo)**: Cari Mitra › Ajukan ke SIRKULA › profil mitra punya tombol "Hapus mitra" dengan dialog konfirmasi. Store: `deletePickupPartner`. Yang ikut terhapus: profil mitra, perjanjian "Pickup partner agreement"-nya, dan kuota terpakai. Draft yang sudah memilih mitra ini kembali ke langkah Pilih mitra. Order yang sudah dikonfirmasi tetap ada. Setelah dihapus, kartu "Become a pickup partner" muncul lagi sehingga bisa daftar ulang.
- **Hapus Premium (demo)**: Premium › kartu status punya tombol "Hapus Premium (DEMO)" dengan dialog konfirmasi. `remove(uid)` di `lib/premium.ts` menghapus data langganan dan riwayat trial, jadi akun kembali Free dan "Coba gratis 3 hari" bisa dipakai lagi. Tombol muncul hanya kalau ada data langganan.
- **ID aman setelah penghapusan**: id mitra (`PP-`) dan perjanjian (`AG-`) sekarang memakai angka terbesar + 1 (`nextNum`), bukan jumlah data, supaya tidak bentrok setelah ada yang dihapus.
- **Skeleton per halaman** (`components/ui/PageSkeletons.tsx`): setiap halaman punya bentuk sendiri dengan padding, lebar maksimum, jarak, header, filter, grid dan kartu yang sama dengan aslinya: Dashboard, Pickup (stepper + kartu form), Orders (tab Aktif / Riwayat / Laporan), Materials (tabel 8 kolom), Find Partners (tab Nearby / Programs / Agreements / Communities), Marketplace (banner petani, chip kategori, 8 kartu produk), Analytics, Notifications, Settings, Admin, Detail produk dan Premium. `?tab=` dibaca AppShell, jadi skeleton mengikuti tab yang sedang dibuka. Halaman yang belum terdaftar memakai bentuk `cards`.
- Belum dijalankan di browser atau dengan `npm run build` (tidak ada npm/jaringan di sini). Cek offline: tidak ada syntax error, import relatif ter-resolve, tidak ada import yang tidak terpakai di file yang diubah. Jalankan `npm install && npm run build` dulu.

---

# Round 6: Register as a pickup partner (no new page)

- **Where**: Find Partners › **Apply to SIRKULA** tab (`/app/partners?tab=programs`). A card at the top invites the user to register; once registered it becomes the partner's own profile card (accepting / paused, capacity, radius, accepted waste, edit, pause/resume, link to the agreement).
- **Wizard** (`components/partner/PickupPartnerWizard`), opens in place of the tab content:
  1. Company profile: business type, company name, business ID (NIB/NPWP), contact person, phone, about.
  2. Waste, capacity and location: accepted waste types (all except e-waste, which stays with the SIRKULA team), monthly capacity, service radius, city, address, map pin (tap/drag or "Use my location").
  3. Agreement: scroll-to-end text (8 clauses in `config/partnerContract.ts`). The checkbox unlocks only after reaching the end. Clause 4: **15% of the total weight of organic waste received through SIRKULA goes to the SIRKULA office** (`ORGANIC_SHARE_PCT`). Then signer name and role, "Sign and register".
  Editing later only shows steps 1-2; the signed agreement is not re-signed.
- **Registered partners show up in Pickup › Choose partner** (SmartMatch): the store now exposes `partners` = demo partners + active registered partners. Same hard rules (material, radius, quota) and pricing apply. New partners show "New partner" instead of a rating. Paused partners are hidden.
- **Agreement record**: registering creates an active "Pickup partner agreement" in the Agreements tab (partner 85% / SIRKULA 15% shown as organic share, note explains it).
- Store: `pickupPartners`, `partners`, `savePickupPartner`. `quoteForChosen(sub, partners)` now takes the partner list. The two generic programmes "Collection partner" and "Processing partner" were removed from `config/cooperation.ts` because this registration replaces them.
- Prototype limits: one partner profile per account (matched by email); registration is active immediately (no review step); the 15% share is a recorded clause only, nothing measures or collects it yet.
- Not run in a browser or with `npm run build` (no npm here). Offline check only: no syntax errors, relative imports resolve, no unused imports, every new UI string has an Indonesian translation.

---

# Round 5: Find Partners (Agreements + Communities + Ecosystem Map merged)

- **One page**: `/app/partners` ("Cari Mitra") replaces three menus. Tabs (`?tab=`): **Nearest partners** (default), **Apply to SIRKULA** (`programs`), **Agreements** (`agreements`, `&id=AG-1` opens one), **Communities** (`communities`).
- **Nearest partners**: the old Ecosystem Map is now this tab (real Google Maps places, or the demo platform network). Every place and every demo participant has a **Propose cooperation** button.
- **Apply to SIRKULA**: six cooperation programmes (collection, processing/recycling, farmer/compost supply, community collection point, corporate generator, marketplace seller) in `config/cooperation.ts`, each with terms and a starting share. "Apply" opens a short form. "My proposals" lists what was sent.
- **Proposals become agreements**: new store action `proposeCooperation` creates a pending agreement (proposer already approved v1, the other party still to approve) with `kind: 'partner' | 'program'` and an optional note. After sending, the app opens it in the Agreements tab.
- **Agreements / Communities** are reused as panels (`embedded` prop hides their own hero). Their features are unchanged.
- **Menu**: Communities, Agreements and Ecosystem Map removed from sidebar and mobile "more"; one item "Find Partners" / "Cari Mitra". Old URLs (`/app/agreements`, `/app/communities`, `/app/map`) redirect and keep the query string. Home cards and activity/notification links updated.
- `pages/EcosystemMapPage` now only exports `Nearby` and `Network`; `pages/PartnersPage` is the new page; strings in `i18n/id.partners.ts`.
- Not run in a browser or with `npm run build` (no npm here). Offline check only: no syntax errors, relative imports resolve, no unused imports. Run `npm install && npm run build` first.

---

# Marketplace redesign

- **One page**: Marketplace and its orders are no longer separate tabs. `/app/marketplace` now has Shop, Orders and Sell on SIRKULA as sections with a sticky in-page jump bar. Deep links: `/app/marketplace#orders`, `/app/marketplace#sell`. Cart is a slide-over drawer (with +/- quantity).
- **Product list**: 30 demo products (14 recycled, 16 from partner farmers), category chips with counts, source filter (recycled / farmer partnership / partner), search, in-stock toggle, sort.
- **Categories**: Vegetables, Fruits, Herbs & spices, Staples, Garden, Bags, Apparel, Home, Office, Other (`src/config/marketplace.ts`).
- **Farm products**: no discount figures. They carry the label "Circular result between partners" with a fixed explanation (commission agreed beforehand, shorter chain).
- **Selling partners**: register as partner (farmer / recycler / other), then add, edit and delete listings (name, category, unit, price, stock, description). Price and stock inputs add thousand dots while typing (`PriceInput`, `formatThousands`).
- Store: `sellers`, `registerSeller`, `updateProduct`, `deleteProduct`, `setCartQty`; `DATA_V` bumped to 3 so existing browsers pick up the new demo products.
- Not run in a browser or compiled here (no node_modules in the sandbox). Run `npm install && npm run build` first.

# Round 4: Agreements + Communities redesign

- **Agreements** (`pages/AgreementsPage`): rebuilt. Summary tiles, search + status pills with counts, agreement cards with approval progress, and a detail panel with approvals per party, a stacked cost-split bar with editable shares, a history timeline and an action bar (note, approve as, request revision, reject, submit new version). Same store actions as before. `?id=AG-1` opens a specific agreement.
- **Formal check mark**: new `components/ui/FormalCheck` (square box, upright check drawn from two straight strokes in SVG, not a font glyph) replaces the old ✓. The global checkbox (`index.css`) uses the same upright SVG check instead of the rotated-border tick.
- **Communities** (`pages/CommunityPage`): rebuilt. Dark hero with totals and "New initiative", a community directory (click to filter), a three-column initiative board (Proposed / Active / Needs revision) with search, a slide-over drawer for an initiative (facts, objective, related agreements, discussion thread, comment box; Esc closes, Ctrl/Cmd+Enter posts) and a new-initiative form with inline errors.
- Shared: `components/ui/Avatar`, polished Modal and Select, `i18n/id.agreements-communities.ts`.

Not run in a browser or with `npm run build` (no npm here). Offline check only: no syntax errors, imports resolve.

---

# Round 3: Pickup flow + Orders + redesign

- **Pickup is one flow** (`/app/pickup`): Detail → Pilih mitra → Konfirmasi. The old onboarding wizard (location, photo, waste types, quantity, review) is now the Detail step. SmartMatch is step 2, no longer its own menu. Step 3 shows partner, price breakdown and Confirm. The step comes from the saved order, so a reload lands in the right place. `?sub=<id>` opens a specific order (used by Repeat order), `?new=1` starts a fresh one.
  The old quick price calculator moved into Detail as a collapsible "Quick price estimate" (`components/pickup/PriceEstimator.tsx`).
- **Orders is one menu** (`/app/orders`): tabs Aktif (tracking), Riwayat (history + receipts), Laporan (CSV reports). `?tab=history|reports`, `?order=<id>`.
- **Removed menus**: SmartMatch, Tracking & Reports, History. Old URLs redirect and keep their query string (`/app/matching`, `/app/tracking`, `/app/history`, `/app/reports`, `/onboarding`).
  `/app/orders` used to redirect to Marketplace orders; the Marketplace Orders tab itself is unchanged.
- **Onboarding gate removed**: new accounts go straight to Pickup (sign up) instead of a separate wizard page. Dashboard "Request now" opens the Pickup flow (the small pickup modal is no longer used).
- **Redesign**: new tokens (`styles/tokens.css`: emerald primary, green-tinted neutrals, larger radii, softer shadows), refreshed global controls (`index.css`), new sidebar with groups, topbar with page title and avatar, frosted mobile bar, segmented tabs, new stepper. Legacy pages pick up the new look through the shared tokens; their layouts were not rebuilt.
- Removed: `pages/SmartMatchPage`, `pages/BatchTrackingPage`, `pages/HistoryPage`, `pages/OnboardingPage`. Added: `components/pickup/*`, `components/orders/*`, `pages/OrdersPage`, `i18n/id.pickup-orders.ts`.

Not verified in a browser or with `npm run build` (no npm/network here). Offline check only: no syntax errors and all relative imports resolve. Run `npm install && npm run build` first.

---

# Round 2: pickup, location, skeletons, SmartMatch

- **Sidebar**: Pickup looks like every other item (CTA style removed from `Sidebar.tsx`, `Sidebar.css`, `navItems.ts`). The round Pickup button in the mobile bottom bar is unchanged.
- **Street detection** (`lib/geo.ts`): new `reverseDetailed()` builds the address from structured parts (street + number, kelurahan, kecamatan, city, province, postal code).
  Google picks `street_address`/`route` results (no plus codes). OpenStreetMap uses Nominatim at zoom 18; if it returns no street, the nearest named road within 80 m is looked up through Overpass.
  The UI says "Street detected", "Nearest street ±N m" or "No street name found" instead of guessing. GPS now watches for up to 9 s and keeps the most accurate reading (no cached position); accuracy above 50 m shows a warning.
- **Icon fields**: hint text keeps a gap from the icon on the Pickup address field, the onboarding search field and the Materials search field. Same cause as the auth fix: the global `input:not(...)` padding was stronger than the page rule, so each page rule now repeats that `:not()` chain.
- **Skeletons** (`components/ui/Skeleton.tsx`, `lib/useSkeleton.ts`): cards no longer pop in after an action.
  Pickup keeps the cost and route cards in place (still placeholder before an address, animated while searching or routing). Materials shows a skeleton table after a filter or search. SmartMatch shows placeholder partner cards while an order is (re)matched. Every page in the app shell opens behind a short page skeleton.
  The data is local, so the 0.3-0.65 s delays are presentational, not real loading.
- **SmartMatch redesign**: progress steps, order overview tiles (edit panel collapses), per-type coverage panel, partner cards with price / distance / quota, accept chips per waste type, sort, "available only" filter, collapsible price breakdown and ranking weights.
- **Partner coverage**: every non-e-waste waste type is accepted by at least one partner (`uncoveredTypes()` in `data/smartMatchPartners.ts` returns the gaps). Pricing is verified only for Bali, so 7 fictional Bali partners were added (Denpasar, Gianyar, Badung, Singaraja, Negara); every type has a partner within range of Denpasar, Kuta, Ubud, Tabanan, Amlapura, Singaraja, Negara and Nusa Dua. E-waste still goes to the SIRKULA team.
  A mixed order still needs ONE partner that accepts every selected type; the coverage panel says so when none does.

Not verified in a browser or with `npm run build` (no npm here). Street lookups need internet and were not run live. Run `npm install && npm run build` first.

---

# Redesign: auth + landing

- Login (`/login`) and Sign up (`/signup`) are now separate pages. `/register` redirects to `/signup`.
- Account type (role) picker removed from both. Every new account is a standard account.
- Sign up saves the account in this browser (`src/lib/accounts.ts`); Login checks it. Prototype only, not real security.
- Icon fields (`src/components/auth/AuthField.tsx`): hint/placeholder text now has left spacing after the icon.
  Cause of the old bug: global `input:not(...)` padding in `index.css` overrode the field padding. The new selectors in `auth.css` are stronger.
- New landing page (`pages/HomePage`), new shared illustration (`components/art/CircularArt`), new auth layout (`components/auth`).
- Removed: `RegisterPage`, `AccountTypeCards`. Indonesian translations added to `src/i18n/id.ts`.

Not changed: Settings "Demo role" switch and `accountTypes.ts` (still used internally by the dashboard/permissions).
Not verified in a browser or with `npm run build` (no npm in the build environment). Run `npm install && npm run build` first.
