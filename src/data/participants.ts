export type PType = 'generator'|'processor'|'transport'|'seller'|'buyer'|'community'|'collection point'
export interface Participant { id:string; name:string; type:PType; region:string; lat:number; lng:number; materials:string[]; capacity?:number; status:'active'|'inactive' }
export const baseParticipants: Participant[] = [
  { id:'G1', name:'Harbor Hotel Group', type:'generator', region:'Southeast Asia', lat:-8.7, lng:115.1, materials:['Plastic'], status:'active' },
  { id:'G2', name:'Nordlys Packaging', type:'generator', region:'Northern Europe', lat:60.4, lng:5.3, materials:['Paper'], status:'active' },
  { id:'G3', name:'Kebun Bersama Community', type:'community', region:'Southeast Asia', lat:-8.4, lng:115.3, materials:['Organic'], status:'active' },
  { id:'G4', name:'Casa Vidrio', type:'generator', region:'Latin America', lat:-33.5, lng:-70.7, materials:['Glass'], status:'active' },
  { id:'G5', name:'Metro Beverages', type:'generator', region:'East Africa', lat:-1.3, lng:36.8, materials:['Metal'], status:'active' },
  { id:'G6', name:'Loom & Co', type:'generator', region:'South Asia', lat:23, lng:72.6, materials:['Textile'], status:'active' },
  { id:'G7', name:'TechBack Ltd', type:'generator', region:'Northern Europe', lat:55.7, lng:13.2, materials:['Electronics'], status:'inactive' },
  { id:'T1', name:'Eco Haul Logistics', type:'transport', region:'Southeast Asia', lat:-8.6, lng:115.0, materials:['Plastic','Organic','Metal'], status:'active' },
  { id:'S1', name:'Fibra Nova Shop', type:'seller', region:'Northern Europe', lat:59.8, lng:10.9, materials:['Paper'], status:'active' },
  { id:'B1', name:'Cafe Daun', type:'buyer', region:'Southeast Asia', lat:-8.5, lng:115.2, materials:[], status:'active' },
  { id:'C1', name:'Sanur Drop Point', type:'collection point', region:'Southeast Asia', lat:-8.7, lng:115.26, materials:['Plastic','Glass'], status:'active' },
  { id:'C2', name:'Barrio Verde', type:'community', region:'Latin America', lat:-33.3, lng:-70.5, materials:['Glass'], status:'active' },
]
