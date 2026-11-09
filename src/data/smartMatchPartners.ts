import type { Partner } from '../features/smart-match/rules'
import { allSubIds } from '../config/segregation'
import { findSub } from '../config/wasteTaxonomy'

/** FICTIONAL demo partners for demonstration only. Names, ratings, quotas and coverage are invented. */
export const DEMO_PARTNERS: Partner[] = [
  { id: 'pt-daur-hijau', name: 'PT Daur Hijau Nusantara (Demo)', city: 'Semarang', type: 'standard', logo: 'DH', hue: 150,
    accepts: ['rec-pet', 'rec-plastic', 'rec-cardboard', 'rec-paper', 'rec-metal', 'rec-glass'], base: { lat: -6.9932, lng: 110.4203 }, radiusKm: 40, rating: 4.6, reviews: 128, quotaKg: 4000 },
  { id: 'cv-bank-lestari', name: 'CV Bank Sampah Lestari (Demo)', city: 'Jakarta Selatan', type: 'standard', logo: 'BL', hue: 200,
    accepts: ['rec-cardboard', 'rec-paper', 'rec-metal', 'rec-pet'], base: { lat: -6.2615, lng: 106.8106 }, radiusKm: 25, rating: 4.3, reviews: 64, quotaKg: 1500 },
  { id: 'pt-plastik-lestari', name: 'PT Plastik Lestari Recycling (Demo)', city: 'Bekasi', type: 'standard', logo: 'PL', hue: 35,
    accepts: ['rec-pet', 'rec-plastic'], base: { lat: -6.2383, lng: 106.9756 }, radiusKm: 60, rating: 4.8, reviews: 210, quotaKg: 6000 },
  { id: 'cv-kompos-nusa', name: 'CV Kompos Nusa Makmur (Demo)', city: 'Bandung', type: 'organic', logo: 'KN', hue: 95,
    accepts: ['org-food', 'org-produce', 'org-leaves', 'org-coffee', 'org-eggshell'], base: { lat: -6.9175, lng: 107.6191 }, radiusKm: 35, rating: 4.5, reviews: 88, quotaKg: 2500 },
  { id: 'pt-kompos-surabaya', name: 'PT Kompos Hijau Surabaya (Demo)', city: 'Surabaya', type: 'organic', logo: 'KS', hue: 110,
    accepts: ['org-food', 'org-produce', 'org-leaves'], base: { lat: -7.2575, lng: 112.7521 }, radiusKm: 30, rating: 4.2, reviews: 51, quotaKg: 800 },
  { id: 'pt-kaca-ulang', name: 'PT Kaca Ulang Indonesia (Demo)', city: 'Tangerang', type: 'standard', logo: 'KU', hue: 260,
    accepts: ['rec-glass'], base: { lat: -6.1783, lng: 106.6319 }, radiusKm: 50, rating: 4.1, reviews: 33, quotaKg: 2000 },
  { id: 'pengolah-jelantah', name: 'Pengolah Minyak Jelantah Denpasar (Demo)', city: 'Denpasar', type: 'standard', logo: 'MJ', hue: 20,
    accepts: ['res-oil'], base: { lat: -8.6705, lng: 115.2126 }, radiusKm: 80, rating: 4.4, reviews: 27, quotaKg: 600 },
  { id: 'cv-tekstil-ulang', name: 'CV Tekstil Ulang Yogyakarta (Demo)', city: 'Yogyakarta', type: 'standard', logo: 'TU', hue: 330,
    accepts: ['res-textile'], base: { lat: -7.7956, lng: 110.3695 }, radiusKm: 45, rating: 4.0, reviews: 19, quotaKg: 400 },
  // --- Bali: pricing is only verified for Bali, so Bali pickups need a partner for every waste type here. ---
  { id: 'pt-bali-daur-ulang', name: 'PT Bali Daur Ulang Sejahtera (Demo)', city: 'Denpasar', type: 'standard', logo: 'BD', hue: 160,
    accepts: ['rec-pet', 'rec-plastic', 'rec-cardboard', 'rec-paper', 'rec-metal', 'rec-glass'], base: { lat: -8.6478, lng: 115.2167 }, radiusKm: 55, rating: 4.6, reviews: 142, quotaKg: 5000 },
  { id: 'cv-kompos-bali-asri', name: 'CV Kompos Bali Asri (Demo)', city: 'Gianyar', type: 'organic', logo: 'KB', hue: 100,
    accepts: ['org-food', 'org-produce', 'org-leaves', 'org-coffee', 'org-eggshell'], base: { lat: -8.5372, lng: 115.3318 }, radiusKm: 60, rating: 4.5, reviews: 77, quotaKg: 3000 },
  { id: 'pt-residu-khusus-bali', name: 'PT Residu Khusus Bali (Demo)', city: 'Badung', type: 'standard', logo: 'RK', hue: 15,
    accepts: ['res-contaminated', 'res-oil', 'res-textile', 'res-foam', 'res-hygiene'], base: { lat: -8.5819, lng: 115.1768 }, radiusKm: 70, rating: 4.3, reviews: 58, quotaKg: 2500 },
  { id: 'cv-singaraja-daur', name: 'CV Singaraja Daur Mandiri (Demo)', city: 'Singaraja', type: 'standard', logo: 'SD', hue: 215,
    accepts: ['rec-pet', 'rec-plastic', 'rec-cardboard', 'rec-paper', 'rec-metal', 'rec-glass'], base: { lat: -8.1120, lng: 115.0882 }, radiusKm: 50, rating: 4.2, reviews: 36, quotaKg: 1800 },
  { id: 'ud-kompos-buleleng', name: 'UD Kompos Buleleng Hijau (Demo)', city: 'Singaraja', type: 'organic', logo: 'KH', hue: 120,
    accepts: ['org-food', 'org-produce', 'org-leaves', 'org-coffee'], base: { lat: -8.1301, lng: 115.0990 }, radiusKm: 45, rating: 4.4, reviews: 29, quotaKg: 1200 },
  { id: 'cv-jembrana-daur', name: 'CV Jembrana Daur Lestari (Demo)', city: 'Negara', type: 'standard', logo: 'JD', hue: 190,
    accepts: ['rec-pet', 'rec-plastic', 'rec-cardboard', 'rec-paper', 'rec-metal', 'rec-glass'], base: { lat: -8.3562, lng: 114.6256 }, radiusKm: 50, rating: 4.1, reviews: 22, quotaKg: 1500 },
  { id: 'ud-kompos-jembrana', name: 'UD Kompos Jembrana Subur (Demo)', city: 'Negara', type: 'organic', logo: 'KJ', hue: 105,
    accepts: ['org-food', 'org-produce', 'org-leaves', 'org-coffee', 'org-eggshell'], base: { lat: -8.3490, lng: 114.6170 }, radiusKm: 50, rating: 4.3, reviews: 18, quotaKg: 1000 },
  { id: 'pt-kertas-medan', name: 'PT Kertas Daur Medan (Demo)', city: 'Medan', type: 'standard', logo: 'KM', hue: 60,
    accepts: ['rec-paper', 'rec-cardboard'], base: { lat: 3.5952, lng: 98.6722 }, radiusKm: 20, rating: 4.7, reviews: 96, quotaKg: 3000 },
]

/**
 * Every non-e-waste waste type must have at least one partner that accepts it. E-waste is routed to the SIRKULA team
 * (see config/ewasteTeam.ts) and never to regular partners. Returns the ids that no partner accepts; expected to be empty.
 */
export function uncoveredTypes(partners: Partner[] = DEMO_PARTNERS): string[] {
  return allSubIds().filter(id => findSub(id)?.cat.id !== 'ewaste' && !partners.some(p => p.accepts.includes(id)))
}

/** Number of partners that accept a waste type, regardless of distance or quota. */
export const acceptorCount = (typeId: string, partners: Partner[] = DEMO_PARTNERS) => partners.filter(p => p.accepts.includes(typeId)).length
