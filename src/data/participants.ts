export type PType = 'generator'|'processor'|'transport'|'seller'|'buyer'|'community'|'collection point'
export interface Participant { id:string; name:string; type:PType; region:string; lat:number; lng:number; materials:string[]; capacity?:number; status:'active'|'inactive' }
// Peserta demo FIKTIF di Indonesia. "region" berisi nama provinsi.
export const baseParticipants: Participant[] = [
  { id:'G1', name:'Grup Hotel Samudra Bali', type:'generator', region:'Bali', lat:-8.8, lng:115.17, materials:['Plastic'], status:'active' },
  { id:'G2', name:'PT Kemasan Nusantara', type:'generator', region:'Jawa Barat', lat:-6.95, lng:107.6, materials:['Paper'], status:'active' },
  { id:'G3', name:'Komunitas Kebun Bersama', type:'community', region:'Bali', lat:-8.51, lng:115.26, materials:['Organic'], status:'active' },
  { id:'G4', name:'CV Kaca Mulia', type:'generator', region:'Jawa Timur', lat:-7.26, lng:112.75, materials:['Glass'], status:'active' },
  { id:'G5', name:'PT Minuman Segar Nusantara', type:'generator', region:'Sumatera Utara', lat:3.59, lng:98.67, materials:['Metal'], status:'active' },
  { id:'G6', name:'CV Batik Laras', type:'generator', region:'Jawa Tengah', lat:-7.57, lng:110.83, materials:['Textile'], status:'active' },
  { id:'G7', name:'PT Elektronik Kembali Jaya', type:'generator', region:'DKI Jakarta', lat:-6.2, lng:106.82, materials:['Electronics'], status:'inactive' },
  { id:'T1', name:'PT Angkut Hijau Bali', type:'transport', region:'Bali', lat:-8.62, lng:115.1, materials:['Plastic','Organic','Metal'], status:'active' },
  { id:'S1', name:'Toko Serat Nusa', type:'seller', region:'Jawa Barat', lat:-6.9, lng:107.62, materials:['Paper'], status:'active' },
  { id:'B1', name:'Kafe Daun Ubud', type:'buyer', region:'Bali', lat:-8.5, lng:115.24, materials:[], status:'active' },
  { id:'C1', name:'Titik Kumpul Sanur', type:'collection point', region:'Bali', lat:-8.7, lng:115.26, materials:['Plastic','Glass'], status:'active' },
  { id:'C2', name:'Kampung Hijau Malang', type:'community', region:'Jawa Timur', lat:-7.98, lng:112.63, materials:['Glass'], status:'active' },
]
