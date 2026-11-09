export type BatchStatus = 'registered'|'validated'|'matched'|'collection_scheduled'|'collected'|'received'|'processing'|'evidence_submitted'|'verified'|'completed'|'rejected'|'exception'
export interface Batch { id:string; name:string; category:string; qty:number; unit:string; source:string; region:string; status:BatchStatus; date:string; evidence?:'none'|'pending'|'accepted'; workflow?:string; lat?:number; lng?:number }
export interface Processor { id:string; name:string; region:string; accepts:string[]; capacity:number; lat:number; lng:number }
export interface Notif { id:string; title:string; body:string; time:string; category:string; read:boolean; link:string }
export interface Activity { id:string; text:string; time:string; link:string }
export type AccountType = 'personal' | 'company'
export interface Profile {
  fullName:string; phone?:string; companyName?:string; legalId?:string; branchCount?:number
  verification:'not_required'|'pending'
}
export interface User { name:string; email:string; org:string; accountType?:AccountType; profile?:Profile }
export interface Match { id:string; batchId:string; processorId:string; processorName:string; qty:number; score:number; status:'accepted'|'rejected'; date:string }
export interface Evidence { id:string; batchId:string; stage:string; note:string; status:'awaiting review'|'accepted'|'rejected'; by:string; date:string }
export interface Initiative { id:string; title:string; community:string; objective:string; category:string; qty:number; status:'proposed'|'active'|'revision'; comments:{ by:string; text:string; date:string }[] }
export interface Agreement { id:string; title:string; community:string; required:string[]; approvedBy:{ party:string; version:number }[]; version:number; status:'pending'|'active'|'revision'|'rejected'; effective:string; shares:{ party:string; share:number }[]; history:{ date:string; text:string }[]; updated:string
  /** Diisi untuk kerja sama yang diajukan lewat halaman Cari Mitra. */
  kind?:'partner'|'program'; note?:string }
export type ProductSource = 'upcycle' | 'farm' | 'partner'
export interface Product {
  id:string; name:string; seller:string; category:string; price:number; stock:number; desc:string; traceable:boolean; origin?:string; batchId?:string; region:string; hue:number
  /** Satuan jual, mis. "kg", "ikat", "pcs". */
  unit?:string
  /** upcycle = barang olahan daur ulang, farm = hasil kerja sama petani, partner = produk mitra lain. */
  source?:ProductSource
  /** Id penjual (mitra terdaftar). Kosong untuk produk demo bawaan. */
  sellerId?:string
  /** Produk yang dibuat user lewat form "Jual produk" (bisa diedit/dihapus oleh pemiliknya). */
  mine?:boolean
}
export interface SellerProfile { ownerId:string; shopName:string; region:string; about:string; kind:'olahan'|'petani'|'umkm'; joined:string }
export interface CartLine { productId:string; qty:number }
export type OrderStatus = 'pending'|'confirmed'|'preparing'|'dispatched'|'delivered'|'cancelled'
export interface Order { id:string; buyer:string; lines:{ productId:string; name:string; qty:number; price:number }[]; total:number; date:string; status:OrderStatus }
export interface Prefs { language:string; currency:string; units:string; emailAlerts:boolean }
export interface Pickup { id:string; requester:string; qty:number; address:string; lat?:number; lng?:number; source:'gps'|'manual'; date:string; status:'requested' }

export interface PickupLocation {
  lat:number; lng:number; addressText:string; building:string; floor:string; landmark:string
  source:'search'|'map'|'gps'|'manual'; accuracy?:number; savedAt:string
}
export interface PhotoRef { id:string; name:string; width:number; height:number; size:number; savedAt:string }
export interface QuantityDetails { kg:string; bags:string; date:string; notes:string }
export type WasteStream = 'organic' | 'inorganic' | 'ewaste'
export type Workflow = 'organic-batch' | 'standard-batch' | 'sirkula-ewaste'
export interface SubmissionPartner { id:string; name:string; score:number; distanceKm:number; team:boolean; priceIdr?:number }
export interface Submission {
  id:string; createdAt:string; status:'submitted'|'partner_selected'|'sirkula_team'|'confirmed'; batchId:string; partner?:SubmissionPartner; orderId?:string
  stream:WasteStream; workflow:Workflow; wasteTypes:string[]
  pickup:PickupLocation; photo:PhotoRef|null
  quantity:{ kg:number; bags:number|null; preferredDate:string|null; notes:string }
}
export interface OnboardingState {
  completed:boolean; step:number; pickup:PickupLocation|null; draft:Partial<PickupLocation>|null
  photo:PhotoRef|null; wasteTypes:string[]; quantity:QuantityDetails
}
export type SubmissionPatch = Partial<Pick<Submission,'wasteTypes'|'stream'|'workflow'|'pickup'|'quantity'>>
export interface PriceBreakdown {
  fixed:number; transport:number; handling:number; rounding:number; total:number
  distanceKm:number; transportRate:number; weightKg:number; handlingRate:number
}
/** Confirmed pickup order. Saved in the store (localStorage). */
export type OrderState = 'pending_match' | 'matched' | 'scheduled' | 'collector_assigned' | 'on_the_way_to_pickup'
  | 'arrived_at_pickup' | 'waste_collected' | 'in_transit_to_processor' | 'arrived_at_processor' | 'completed'
export interface PickupOrder {
  id:string; userId:string; createdAt:string; status:OrderState; submissionId:string; batchId:string
  collector?:{ name:string; vehicle:string }
  waste:{ stream:WasteStream; workflow:Workflow; categories:string[]; kg:number; bags:number|null; preferredDate:string|null; notes:string; photoId:string|null }
  partner:{ id:string; name:string; team:boolean; score:number; distanceKm:number }
  price:PriceBreakdown|null
  coords:{ lat:number; lng:number }; address:string
  statusHistory:{ status:OrderState; at:string }[]
  /** Set when the order completes. measuredKg is the weight recorded at the processor (demo: entered by the operator). */
  measuredKg?:number|null; completedAt?:string
  paymentStatus?:'unpaid'|'paid'
}

/** Mitra pickup yang mendaftar sendiri lewat Cari Mitra. Muncul sebagai pilihan di langkah "Pilih mitra" pada alur Pickup. */
export type PartnerBusinessType = 'collector' | 'recycler' | 'composter' | 'wastebank' | 'other'
export interface PickupPartnerContract { version:string; organicSharePct:number; signedBy:string; signedRole:string; signedAt:string }
export interface PickupPartner {
  id:string; ownerEmail:string; businessType:PartnerBusinessType; companyName:string; legalId:string; contactName:string; phone:string; about:string
  accepts:string[]; quotaKg:number; radiusKm:number; city:string; address:string; base:{ lat:number; lng:number }
  contract:PickupPartnerContract; active:boolean; registeredAt:string
}
