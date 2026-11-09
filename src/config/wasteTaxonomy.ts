/** Waste taxonomy for onboarding step 3. Labels are bilingual; the UI picks the language from prefs. */
export type LocalText = { en: string; id: string }
export type Lang = keyof LocalText
export interface WasteSub { id: string; label: LocalText; examples: LocalText; keywords: string[] }
export interface WasteCategory { id: 'organic' | 'recyclable' | 'residual' | 'ewaste'; label: LocalText; hint: LocalText; subs: WasteSub[] }

export const WASTE_CATEGORIES: WasteCategory[] = [
  { id: 'organic', label: { en: 'Organic', id: 'Organik' },
    hint: { en: 'Food and garden waste that breaks down naturally.', id: 'Sisa makanan dan kebun yang bisa terurai secara alami.' },
    subs: [
      { id: 'org-food', label: { en: 'Food scraps', id: 'Sisa makanan' }, examples: { en: 'Rice, side dishes, stale bread', id: 'Nasi, lauk, roti basi' }, keywords: ['makanan', 'nasi', 'lauk', 'roti', 'food', 'leftover'] },
      { id: 'org-produce', label: { en: 'Vegetables & fruit', id: 'Sayur & buah' }, examples: { en: 'Peels, wilted vegetables, stems', id: 'Kulit buah, sayur layu, tangkai' }, keywords: ['sayur', 'buah', 'sayuran', 'kulit', 'fruit', 'vegetable', 'peel'] },
      { id: 'org-leaves', label: { en: 'Leaves & grass', id: 'Dedaunan & rumput' }, examples: { en: 'Dry leaves, grass clippings, small twigs', id: 'Daun kering, rumput, ranting kecil' }, keywords: ['daun', 'rumput', 'ranting', 'leaves', 'grass', 'garden'] },
      { id: 'org-coffee', label: { en: 'Coffee & tea grounds', id: 'Ampas kopi & teh' }, examples: { en: 'Used grounds and tea bags', id: 'Ampas dan kantong teh bekas' }, keywords: ['kopi', 'teh', 'ampas', 'coffee', 'tea', 'grounds'] },
      { id: 'org-eggshell', label: { en: 'Eggshells', id: 'Cangkang telur' }, examples: { en: 'Rinsed eggshells', id: 'Cangkang telur yang sudah dibilas' }, keywords: ['telur', 'cangkang', 'egg', 'shell'] },
    ] },
  { id: 'recyclable', label: { en: 'Recyclable inorganic', id: 'Anorganik daur ulang' },
    hint: { en: 'Clean, dry materials that recyclers can process.', id: 'Material bersih dan kering yang bisa diolah oleh pendaur ulang.' },
    subs: [
      { id: 'rec-pet', label: { en: 'PET plastic bottles', id: 'Botol plastik PET' }, examples: { en: 'Mineral water and drink bottles', id: 'Botol air mineral dan minuman' }, keywords: ['pet', 'plastik', 'botol', 'bottle', 'air mineral', 'mineral'] },
      { id: 'rec-plastic', label: { en: 'Other plastic packaging (HDPE/PP)', id: 'Plastik kemasan lain (HDPE/PP)' }, examples: { en: 'Jerry cans, bottle caps, detergent packs', id: 'Galon, tutup botol, kemasan sabun' }, keywords: ['hdpe', 'pp', 'galon', 'plastik', 'kemasan', 'plastic', 'tutup'] },
      { id: 'rec-cardboard', label: { en: 'Cardboard', id: 'Kardus' }, examples: { en: 'Boxes and cartons, flattened', id: 'Kardus dan karton, sudah dilipat' }, keywords: ['kardus', 'karton', 'box', 'cardboard', 'carton'] },
      { id: 'rec-paper', label: { en: 'Paper', id: 'Kertas' }, examples: { en: 'Office paper, newspaper, magazines', id: 'HVS, koran, majalah' }, keywords: ['kertas', 'koran', 'hvs', 'paper', 'majalah', 'buku', 'newspaper'] },
      { id: 'rec-metal', label: { en: 'Metal cans', id: 'Kaleng logam' }, examples: { en: 'Drink and food cans, thin scrap metal', id: 'Kaleng minuman, kaleng makanan, besi tipis' }, keywords: ['kaleng', 'aluminium', 'aluminum', 'logam', 'can', 'metal', 'besi'] },
      { id: 'rec-glass', label: { en: 'Glass', id: 'Kaca' }, examples: { en: 'Bottles and jars. Wrap broken glass.', id: 'Botol kaca dan toples. Bungkus pecahan kaca.' }, keywords: ['kaca', 'botol kaca', 'toples', 'glass', 'jar'] },
    ] },
  { id: 'residual', label: { en: 'Residual & special', id: 'Residu & khusus' },
    hint: { en: 'Contaminated or special handling. Not part of the usual recycling stream.', id: 'Terkontaminasi atau perlu penanganan khusus. Tidak masuk alur daur ulang biasa.' },
    subs: [
      { id: 'res-contaminated', label: { en: 'Contaminated waste', id: 'Sampah terkontaminasi' }, examples: { en: 'Oily or food-soaked packaging that cannot be cleaned', id: 'Kemasan berminyak atau bekas makanan yang tidak bisa dibersihkan' }, keywords: ['kotor', 'terkontaminasi', 'berminyak', 'contaminated', 'residu', 'residue'] },
      { id: 'res-oil', label: { en: 'Used cooking oil', id: 'Minyak jelantah' }, examples: { en: 'Used cooking oil in a sealed container', id: 'Minyak goreng bekas dalam wadah tertutup' }, keywords: ['minyak', 'jelantah', 'oil', 'goreng', 'cooking oil'] },
      { id: 'res-textile', label: { en: 'Fabric & textiles', id: 'Kain & tekstil' }, examples: { en: 'Worn-out clothes, fabric scraps', id: 'Pakaian bekas rusak, kain perca' }, keywords: ['kain', 'tekstil', 'baju', 'pakaian', 'textile', 'fabric', 'clothes', 'perca'] },
      { id: 'res-foam', label: { en: 'Styrofoam (EPS)', id: 'Styrofoam (EPS)' }, examples: { en: 'Food containers and packing foam', id: 'Wadah makanan dan busa kemasan' }, keywords: ['styrofoam', 'eps', 'foam', 'sterofoam', 'busa'] },
      { id: 'res-hygiene', label: { en: 'Diapers & sanitary pads', id: 'Popok & pembalut' }, examples: { en: 'Used hygiene products, sealed in a bag', id: 'Produk kebersihan bekas, dibungkus kantong' }, keywords: ['popok', 'pembalut', 'diaper', 'sanitary', 'hygiene'] },
    ] },
  { id: 'ewaste', label: { en: 'Electronic waste (e-waste)', id: 'Sampah elektronik (e-waste)' },
    hint: { en: 'Devices and parts. Batteries need special handling.', id: 'Perangkat dan komponennya. Baterai perlu penanganan khusus.' },
    subs: [
      { id: 'ew-phone', label: { en: 'Phones & tablets', id: 'HP & tablet' }, examples: { en: 'Phones, tablets, smartwatches', id: 'Ponsel, tablet, smartwatch' }, keywords: ['hp', 'handphone', 'ponsel', 'tablet', 'phone', 'smartphone'] },
      { id: 'ew-battery', label: { en: 'Batteries', id: 'Baterai' }, examples: { en: 'AA/AAA, lithium, small power cells. Do not puncture.', id: 'Baterai AA/AAA, lithium, sel kecil. Jangan ditusuk.' }, keywords: ['baterai', 'battery', 'aki', 'lithium', 'aa', 'aaa'] },
      { id: 'ew-charger', label: { en: 'Chargers & adapters', id: 'Charger & adaptor' }, examples: { en: 'Phone chargers, power adapters, power banks', id: 'Charger ponsel, adaptor, power bank' }, keywords: ['charger', 'adaptor', 'adapter', 'power bank', 'powerbank'] },
      { id: 'ew-cable', label: { en: 'Cables', id: 'Kabel' }, examples: { en: 'USB, HDMI, extension cords', id: 'USB, HDMI, kabel roll' }, keywords: ['kabel', 'cable', 'usb', 'hdmi', 'wire'] },
      { id: 'ew-small', label: { en: 'Small electronics', id: 'Elektronik kecil' }, examples: { en: 'Speakers, mice, keyboards, LED lamps', id: 'Speaker, mouse, keyboard, lampu LED' }, keywords: ['speaker', 'mouse', 'keyboard', 'elektronik', 'led', 'lampu', 'electronic'] },
    ] },
]

export const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

/** True when every word of the query appears somewhere in the subcategory's text (labels, examples, keywords). */
export function matchesSub(sub: WasteSub, query: string): boolean {
  const hay = normalize([sub.label.en, sub.label.id, sub.examples.en, sub.examples.id, ...sub.keywords].join(' '))
  return normalize(query).split(/\s+/).filter(Boolean).every(w => hay.includes(w))
}

export function findSub(id: string): { sub: WasteSub; cat: WasteCategory } | undefined {
  for (const cat of WASTE_CATEGORIES) { const sub = cat.subs.find(s => s.id === id); if (sub) return { sub, cat } }
  return undefined
}
