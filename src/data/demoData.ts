import type { Batch, Processor, Notif, Activity } from '../types'
// Seluruh data demo bersifat FIKTIF. Nama organisasi, lokasi, dan harga dibuat untuk demonstrasi. "region" berisi nama provinsi.
export const demoBatches: Batch[] = [
  { id:'BT-1001', name:'PET bottle bales', category:'Plastic', qty:1200, unit:'kg', source:'Grup Hotel Samudra Bali', region:'Bali', status:'validated', date:'2026-09-02', evidence:'none' },
  { id:'BT-1002', name:'Cardboard offcuts', category:'Paper', qty:3400, unit:'kg', source:'PT Kemasan Nusantara', region:'Jawa Barat', status:'matched', date:'2026-09-05', evidence:'none' },
  { id:'BT-1003', name:'Food scraps (sorted)', category:'Organic', qty:5200, unit:'kg', source:'Komunitas Kebun Bersama', region:'Bali', status:'collection_scheduled', date:'2026-09-11', evidence:'none' },
  { id:'BT-1004', name:'Glass cullet', category:'Glass', qty:2100, unit:'kg', source:'CV Kaca Mulia', region:'Jawa Timur', status:'processing', date:'2026-09-14', evidence:'none' },
  { id:'BT-1005', name:'Aluminium cans', category:'Metal', qty:860, unit:'kg', source:'PT Minuman Segar Nusantara', region:'Sumatera Utara', status:'evidence_submitted', date:'2026-09-18', evidence:'pending' },
  { id:'BT-1006', name:'Textile trimmings', category:'Textile', qty:640, unit:'kg', source:'CV Batik Laras', region:'Jawa Tengah', status:'verified', date:'2026-09-21', evidence:'accepted' },
  { id:'BT-1007', name:'Mixed e-waste', category:'Electronics', qty:9000, unit:'kg', source:'PT Elektronik Kembali Jaya', region:'DKI Jakarta', status:'registered', date:'2026-10-01', evidence:'none' },
  { id:'BT-1008', name:'HDPE crates', category:'Plastic', qty:450, unit:'kg', source:'Grup Hotel Samudra Bali', region:'Bali', status:'exception', date:'2026-10-03', evidence:'none' },
  { id:'BT-1009', name:'Used cooking oil drums', category:'Organic', qty:780, unit:'kg', source:'Restoran Laut Biru', region:'Bali', status:'collected', date:'2026-10-06', evidence:'none' },
  { id:'BT-1010', name:'Office paper shreds', category:'Paper', qty:1500, unit:'kg', source:'Bank Daerah Nusantara', region:'DKI Jakarta', status:'completed', date:'2026-08-20', evidence:'accepted' },
  { id:'BT-1011', name:'PET flakes (washed)', category:'Plastic', qty:2650, unit:'kg', source:'Koperasi Bank Sampah Asri', region:'Jawa Timur', status:'received', date:'2026-10-08', evidence:'none' },
  { id:'BT-1012', name:'Copper wire scrap', category:'Metal', qty:310, unit:'kg', source:'PT Elektronik Kembali Jaya', region:'DKI Jakarta', status:'matched', date:'2026-10-12', evidence:'none' },
]
export const demoProcessors: Processor[] = [
  { id:'PR-01', name:'PT Daur Hijau Dewata', region:'Bali', accepts:['Plastic','Metal'], capacity:3000, lat:-8.65, lng:115.2 },
  { id:'PR-02', name:'PT Serat Nusa', region:'Jawa Barat', accepts:['Paper','Textile'], capacity:5000, lat:-6.91, lng:107.61 },
  { id:'PR-03', name:'CV Humus Lestari', region:'Bali', accepts:['Organic'], capacity:1500, lat:-8.5, lng:115.3 },
  { id:'PR-04', name:'PT Kaca Ulang Jatim', region:'Jawa Timur', accepts:['Glass'], capacity:200, lat:-7.35, lng:112.73 },
  { id:'PR-05', name:'PT Sirkuit Daur Indonesia', region:'DKI Jakarta', accepts:['Electronics','Metal'], capacity:4000, lat:-6.24, lng:106.99 },
]
export const demoNotifs: Notif[] = [
  { id:'N1', title:'Match ready', body:'BT-1002 has 2 eligible processors.', time:'2h ago', category:'Match results', read:false, link:'/app/pickup' },
  { id:'N2', title:'Evidence awaiting review', body:'BT-1005 utilization evidence submitted.', time:'5h ago', category:'Evidence reviews', read:false, link:'/app/orders' },
  { id:'N3', title:'Collection reminder', body:'BT-1003 pickup scheduled tomorrow.', time:'1d ago', category:'Collection reminders', read:false, link:'/app/materials' },
  { id:'N4', title:'Agreement needs revision', body:'Shared collection plan v2 was returned.', time:'2d ago', category:'Agreement approvals', read:true, link:'/app/partners?tab=agreements' },
]
export const demoActivity: Activity[] = [
  { id:'A1', text:'Batch BT-1007 registered', time:'1d ago', link:'/app/materials' },
  { id:'A2', text:'Match accepted for BT-1002', time:'2d ago', link:'/app/pickup' },
  { id:'A3', text:'Weight discrepancy flagged on BT-1008', time:'3d ago', link:'/app/orders' },
]
export const flowSeries = [
  { m:'May', collected:420, processed:310 }, { m:'Jun', collected:560, processed:450 }, { m:'Jul', collected:640, processed:540 },
  { m:'Aug', collected:780, processed:620 }, { m:'Sep', collected:910, processed:760 }, { m:'Oct', collected:860, processed:790 },
]
import type { Evidence } from '../types'
export const demoEvidence: Evidence[] = [
  { id:'E1', batchId:'BT-1005', stage:'evidence_submitted', note:'Smelter intake receipt (placeholder)', status:'awaiting review', by:'PT Minuman Segar Nusantara', date:'2026-10-12' },
  { id:'E2', batchId:'BT-1006', stage:'evidence_submitted', note:'Yarn production record (placeholder)', status:'accepted', by:'CV Batik Laras', date:'2026-10-02' },
]
import type { Initiative, Agreement } from '../types'
export const communities = [
  { name:'Kebun Bersama', region:'Bali', members:142 }, { name:'Koperasi Warga Sukamaju', region:'Jawa Barat', members:87 }, { name:'Kampung Hijau Malang', region:'Jawa Timur', members:203 },
]
export const demoInitiatives: Initiative[] = [
  { id:'IN-1', title:'Shared organic collection route', community:'Kebun Bersama', objective:'Pool food scraps from 40 households', category:'Organic', qty:5200, status:'active', comments:[{ by:'Council', text:'Weekly pickup works for most households.', date:'2026-09-20' }] },
  { id:'IN-2', title:'Textile swap and trimmings recovery', community:'Koperasi Warga Sukamaju', objective:'Divert tailoring offcuts', category:'Textile', qty:800, status:'proposed', comments:[] },
  { id:'IN-3', title:'Glass bottle return points', community:'Kampung Hijau Malang', objective:'Three neighbourhood return points', category:'Glass', qty:2100, status:'revision', comments:[{ by:'PT Kaca Ulang Jatim', text:'Please confirm contamination limits.', date:'2026-10-04' }] },
]
export const demoAgreements: Agreement[] = [
  { id:'AG-1', title:'Organic collection route agreement', community:'Kebun Bersama', required:['Kebun Bersama','CV Humus Lestari','Grup Hotel Samudra Bali'], approvedBy:[{ party:'Kebun Bersama', version:2 }], version:2, status:'pending', effective:'2026-11-01 to 2027-10-31',
    shares:[{ party:'Kebun Bersama', share:40 }, { party:'CV Humus Lestari', share:35 }, { party:'Grup Hotel Samudra Bali', share:25 }], history:[{ date:'2026-09-25', text:'v1 proposed' }, { date:'2026-10-02', text:'v2 revised: schedule changed' }], updated:'2026-10-02' },
  { id:'AG-2', title:'Glass return point scheme', community:'Kampung Hijau Malang', required:['Kampung Hijau Malang','PT Kaca Ulang Jatim'], approvedBy:[], version:1, status:'revision', effective:'2026-12-01 to 2027-11-30',
    shares:[{ party:'Kampung Hijau Malang', share:50 }, { party:'PT Kaca Ulang Jatim', share:50 }], history:[{ date:'2026-10-04', text:'v1 proposed' }, { date:'2026-10-06', text:'Revision requested by PT Kaca Ulang Jatim' }], updated:'2026-10-06' },
  { id:'AG-3', title:'Packaging offcut take-back', community:'Koperasi Warga Sukamaju', required:['PT Kemasan Nusantara','PT Serat Nusa'], approvedBy:[{ party:'PT Kemasan Nusantara', version:1 }, { party:'PT Serat Nusa', version:1 }], version:1, status:'active', effective:'2026-08-01 to 2027-07-31',
    shares:[{ party:'PT Kemasan Nusantara', share:60 }, { party:'PT Serat Nusa', share:40 }], history:[{ date:'2026-07-10', text:'v1 proposed' }, { date:'2026-07-20', text:'Activated after all approvals' }], updated:'2026-07-20' },
]
import type { Product, Order } from '../types'
// Harga dalam Rupiah (IDR).
export const demoProducts: Product[] = [
  { id:'P-1', name:'Recycled PET tote bag', seller:'PT Daur Hijau Dewata', category:'Bags', price:45000, stock:120, desc:'Woven from post-consumer PET bottles.', traceable:true, origin:'PET bottle bales, Bali (self-reported)', batchId:'BT-1001', region:'Bali', hue:150, unit:'pcs', source:'upcycle' },
  { id:'P-2', name:'Cardboard desk organiser', seller:'PT Serat Nusa', category:'Home', price:35000, stock:2, desc:'Pressed fibre from packaging offcuts. Limited run.', traceable:true, origin:'Cardboard offcuts, Jawa Barat (self-reported)', batchId:'BT-1002', region:'Jawa Barat', hue:40, unit:'pcs', source:'upcycle' },
  { id:'P-3', name:'Compost starter (5 kg)', seller:'CV Humus Lestari', category:'Garden', price:25000, stock:300, desc:'Finished compost from sorted food scraps.', traceable:false, region:'Bali', hue:100, unit:'pak', source:'upcycle' },
  { id:'P-4', name:'Cullet glass tumblers (set of 4)', seller:'PT Kaca Ulang Jatim', category:'Home', price:120000, stock:40, desc:'Blown from recovered glass cullet.', traceable:true, origin:'Glass cullet, Jawa Timur (self-reported)', batchId:'BT-1004', region:'Jawa Timur', hue:190, unit:'set', source:'upcycle' },
  { id:'P-5', name:'Trimmings patchwork scarf', seller:'CV Batik Laras', category:'Apparel', price:150000, stock:25, desc:'Made from textile trimmings.', traceable:true, origin:'Textile trimmings, Jawa Tengah. Evidence accepted by a platform reviewer.', batchId:'BT-1006', region:'Jawa Tengah', hue:20, unit:'pcs', source:'upcycle' },
  { id:'P-6', name:'Aluminium pen set', seller:'PT Sirkuit Daur Indonesia', category:'Office', price:60000, stock:0, desc:'Machined from recycled aluminium.', traceable:false, region:'DKI Jakarta', hue:210, unit:'set', source:'upcycle' },
  { id:'P-7', name:'Plastic-lumber plant pot', seller:'PT Daur Hijau Dewata', category:'Garden', price:55000, stock:64, desc:'Pot pressed from sorted HDPE caps. Drainage hole included.', traceable:true, origin:'HDPE caps, Bali (self-reported)', batchId:'BT-1001', region:'Bali', hue:165, unit:'pcs', source:'upcycle' },
  { id:'P-8', name:'Tyre-rubber doormat', seller:'CV Karet Kembali', category:'Home', price:85000, stock:38, desc:'Cut from retreaded inner tubes. Non-slip underside.', traceable:false, region:'Jawa Barat', hue:250, unit:'pcs', source:'upcycle' },
  { id:'P-9', name:'Denim offcut laptop sleeve', seller:'CV Batik Laras', category:'Bags', price:95000, stock:52, desc:'Padded sleeve sewn from denim factory offcuts.', traceable:true, origin:'Denim offcuts, Jawa Tengah (self-reported)', batchId:'BT-1006', region:'Jawa Tengah', hue:215, unit:'pcs', source:'upcycle' },
  { id:'P-10', name:'Recycled paper notebook (A5)', seller:'PT Serat Nusa', category:'Office', price:22000, stock:210, desc:'100 sheets from de-inked office paper. Stitched binding.', traceable:false, region:'Jawa Barat', hue:45, unit:'pcs', source:'upcycle' },
  { id:'P-11', name:'Bottle-glass candle jar', seller:'PT Kaca Ulang Jatim', category:'Home', price:48000, stock:90, desc:'Soy candle poured in a cut bottle base.', traceable:true, origin:'Glass bottles, Jawa Timur (self-reported)', batchId:'BT-1004', region:'Jawa Timur', hue:30, unit:'pcs', source:'upcycle' },
  { id:'P-12', name:'Ocean-plastic sunglasses', seller:'PT Daur Hijau Dewata', category:'Apparel', price:175000, stock:18, desc:'Frames moulded from collected coastal plastic.', traceable:false, region:'Bali', hue:195, unit:'pcs', source:'upcycle' },
  { id:'P-13', name:'Bokashi bran (1 kg)', seller:'CV Humus Lestari', category:'Garden', price:18000, stock:180, desc:'Fermented bran to start kitchen-scrap composting.', traceable:false, region:'Bali', hue:90, unit:'pak', source:'upcycle' },
  { id:'P-14', name:'Reclaimed teak serving board', seller:'CV Kayu Kembali', category:'Home', price:130000, stock:15, desc:'Cut from demolition teak. Food-safe oil finish.', traceable:false, region:'Jawa Tengah', hue:28, unit:'pcs', source:'upcycle' },
  { id:'F-1', name:'Bayam hijau organik', seller:'Tani Subak Baturiti', category:'Vegetables', price:8000, stock:120, desc:'Dipetik pagi, tanpa pestisida kimia.', traceable:false, region:'Bali', hue:130, unit:'ikat', source:'farm' },
  { id:'F-2', name:'Kangkung segar', seller:'Tani Subak Baturiti', category:'Vegetables', price:6000, stock:150, desc:'Batang renyah, panen hari yang sama.', traceable:false, region:'Bali', hue:120, unit:'ikat', source:'farm' },
  { id:'F-3', name:'Tomat ceri', seller:'Kebun Bedugul Lestari', category:'Vegetables', price:28000, stock:60, desc:'Manis, ditanam di rumah kaca dataran tinggi.', traceable:false, region:'Bali', hue:5, unit:'kg', source:'farm' },
  { id:'F-4', name:'Wortel Bedugul', seller:'Kebun Bedugul Lestari', category:'Vegetables', price:14000, stock:200, desc:'Wortel dataran tinggi, manis dan renyah.', traceable:false, region:'Bali', hue:28, unit:'kg', source:'farm' },
  { id:'F-5', name:'Kentang granola', seller:'Tani Sejahtera Dieng', category:'Vegetables', price:16000, stock:300, desc:'Cocok untuk goreng dan sup.', traceable:false, region:'Jawa Tengah', hue:42, unit:'kg', source:'farm' },
  { id:'F-6', name:'Kol putih', seller:'Tani Sejahtera Dieng', category:'Vegetables', price:9000, stock:140, desc:'Padat dan segar, langsung dari ladang.', traceable:false, region:'Jawa Tengah', hue:110, unit:'kg', source:'farm' },
  { id:'F-7', name:'Cabai rawit merah', seller:'Tani Lembang Makmur', category:'Herbs & spices', price:45000, stock:50, desc:'Pedas segar, dipanen saat merah penuh.', traceable:false, region:'Jawa Barat', hue:2, unit:'kg', source:'farm' },
  { id:'F-8', name:'Jahe merah', seller:'Tani Lembang Makmur', category:'Herbs & spices', price:32000, stock:70, desc:'Aroma tajam, cocok untuk wedang dan jamu.', traceable:false, region:'Jawa Barat', hue:12, unit:'kg', source:'farm' },
  { id:'F-9', name:'Kemangi & basil', seller:'Tani Subak Baturiti', category:'Herbs & spices', price:5000, stock:90, desc:'Daun harum, dipetik per ikat.', traceable:false, region:'Bali', hue:140, unit:'ikat', source:'farm' },
  { id:'F-10', name:'Pisang lemon', seller:'Kebun Karangasem', category:'Fruits', price:18000, stock:110, desc:'Matang pohon, rasa manis dengan sedikit asam.', traceable:false, region:'Bali', hue:52, unit:'kg', source:'farm' },
  { id:'F-11', name:'Jeruk Kintamani', seller:'Kebun Kintamani Jaya', category:'Fruits', price:26000, stock:95, desc:'Jeruk segar dataran tinggi, banyak sari.', traceable:false, region:'Bali', hue:32, unit:'kg', source:'farm' },
  { id:'F-12', name:'Mangga arumanis', seller:'Kebun Probolinggo Raya', category:'Fruits', price:24000, stock:130, desc:'Daging tebal dan manis, siap santap.', traceable:false, region:'Jawa Timur', hue:48, unit:'kg', source:'farm' },
  { id:'F-13', name:'Pepaya California', seller:'Kebun Karangasem', category:'Fruits', price:11000, stock:80, desc:'Daging oranye, manis, minim biji.', traceable:false, region:'Bali', hue:22, unit:'kg', source:'farm' },
  { id:'F-14', name:'Semangka merah', seller:'Kebun Probolinggo Raya', category:'Fruits', price:9000, stock:160, desc:'Segar dan berair, panen musim ini.', traceable:false, region:'Jawa Timur', hue:355, unit:'kg', source:'farm' },
  { id:'F-15', name:'Beras merah organik', seller:'Tani Padi Jatiluwih', category:'Staples', price:22000, stock:250, desc:'Ditanam di sawah terasering, digiling tanpa pemutih.', traceable:false, region:'Bali', hue:15, unit:'kg', source:'farm' },
  { id:'F-16', name:'Telur ayam kampung', seller:'Peternak Mitra Tabanan', category:'Staples', price:38000, stock:75, desc:'Isi 10 butir, ayam dilepas liar.', traceable:false, region:'Bali', hue:38, unit:'pak', source:'farm' },
]
export const demoOrders: Order[] = [
  { id:'O-1001', buyer:'Kafe Daun Ubud', lines:[{ productId:'P-3', name:'Compost starter (5 kg)', qty:10, price:25000 }], total:250000, date:'2026-10-10', status:'preparing' },
  { id:'O-1002', buyer:'Studio Tenun Nusantara', lines:[{ productId:'P-1', name:'Recycled PET tote bag', qty:20, price:45000 }], total:900000, date:'2026-10-14', status:'pending' },
  { id:'O-1003', buyer:'Kafe Daun Ubud', lines:[{ productId:'P-4', name:'Cullet glass tumblers (set of 4)', qty:2, price:120000 }], total:240000, date:'2026-09-30', status:'cancelled' },
]

/** Mitra penjemputan (FIKTIF) untuk papan peringkat di dashboard. */
export const partnerStats = [
  { name:'PT Daur Hijau Dewata', region:'Bali', pickups:48, onTime:96, rating:4.9 },
  { name:'CV Humus Lestari', region:'Bali', pickups:37, onTime:92, rating:4.8 },
  { name:'PT Serat Nusa', region:'Jawa Barat', pickups:29, onTime:89, rating:4.6 },
  { name:'PT Sirkuit Daur Indonesia', region:'DKI Jakarta', pickups:22, onTime:86, rating:4.5 },
]
/** Riwayat laporan (FIKTIF) yang sudah ada sebelum sesi ini. */
export interface DemoReport { id:string; type:'batches'|'evidence'|'orders'; region:string; date:string; rows:number; coverage:string; by:string; size:string }
export const demoReportHistory: DemoReport[] = [
  { id:'R-0112', type:'batches', region:'All', date:'2026-11-03', rows:12, coverage:'9 of 12 batches have recorded weights', by:'Auto · mingguan', size:'2.1 KB' },
  { id:'R-0111', type:'evidence', region:'Bali', date:'2026-10-28', rows:4, coverage:'4 evidence entries for 3 batches', by:'Dewi Anggraini', size:'1.2 KB' },
  { id:'R-0110', type:'orders', region:'All', date:'2026-10-21', rows:3, coverage:'All orders (province filter does not apply)', by:'Dewi Anggraini', size:'0.8 KB' },
  { id:'R-0109', type:'batches', region:'Jawa Timur', date:'2026-10-14', rows:3, coverage:'2 of 3 batches have recorded weights', by:'Auto · mingguan', size:'1.0 KB' },
  { id:'R-0108', type:'evidence', region:'All', date:'2026-10-07', rows:6, coverage:'6 evidence entries for 6 batches', by:'Bagus Pratama', size:'1.6 KB' },
  { id:'R-0107', type:'batches', region:'DKI Jakarta', date:'2026-09-30', rows:5, coverage:'3 of 5 batches have recorded weights', by:'Auto · bulanan', size:'1.4 KB' },
  { id:'R-0106', type:'orders', region:'All', date:'2026-09-23', rows:7, coverage:'All orders (province filter does not apply)', by:'Bagus Pratama', size:'1.5 KB' },
  { id:'R-0105', type:'batches', region:'All', date:'2026-09-16', rows:8, coverage:'6 of 8 batches have recorded weights', by:'Auto · mingguan', size:'1.9 KB' },
]
