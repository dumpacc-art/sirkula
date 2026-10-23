/** What we search for on Google Places and how we filter the answers so only relevant places remain. */
export type Facility = 'all' | 'recycler' | 'wastebank' | 'scrap' | 'compost' | 'ewaste' | 'collection'
export const facilities: { key: Facility; label: string; queries: string[] }[] = [
  { key:'all', label:'All recycling facilities', queries:['recycling center', 'bank sampah', 'tempat daur ulang'] },
  { key:'recycler', label:'Recycler / processor', queries:['recycling center', 'tempat daur ulang'] },
  { key:'wastebank', label:'Waste bank / drop point', queries:['bank sampah', 'TPS3R waste drop off'] },
  { key:'scrap', label:'Scrap dealer', queries:['scrap metal dealer', 'pengepul barang bekas rongsokan'] },
  { key:'compost', label:'Composting', queries:['composting facility', 'pengolahan kompos'] },
  { key:'ewaste', label:'E-waste', queries:['e-waste recycling', 'daur ulang elektronik'] },
  { key:'collection', label:'Waste collection service', queries:['waste collection service', 'jasa angkut sampah'] },
]
/** Material filter narrows the query. */
export const materialQuery: Record<string, string> = {
  Plastic:'plastic recycling', Paper:'paper recycling', Organic:'composting organic waste', Glass:'glass recycling', Metal:'scrap metal recycling', Textile:'textile recycling', Electronics:'e-waste recycling',
}
/** A place is kept only if its name/types look like a waste/recycling business. */
export const relevant = /recycl|daur ulang|bank sampah|sampah|waste|scrap|rongsok|pengepul|barang bekas|kompos|compost|tps|limbah|e-?waste|elektronik bekas|reuse|zero waste|eco|green/i
/** Place types that are never relevant, even if the name matches (e.g. "Green Cafe"). */
export const blockedTypes = ['restaurant','cafe','food','bar','lodging','hotel','spa','beauty_salon','clothing_store','school','church','night_club','bakery','meal_takeaway']
/** Per-material keywords: when a material is chosen we prefer places mentioning it, but never hide strong waste-business matches. */
export const materialHint: Record<string, RegExp> = {
  Plastic:/plastic|plastik|pet/i, Paper:/paper|kertas|karton|cardboard/i, Organic:/kompos|compost|organik|organic|biogas/i, Glass:/glass|kaca|botol/i,
  Metal:/metal|logam|scrap|rongsok|besi|aluminium|aluminum/i, Textile:/textile|tekstil|garment|kain/i, Electronics:/e-?waste|elektronik|electronic/i,
}
