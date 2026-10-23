export type Role = 'generator'|'processor'|'transport'|'community'|'seller'|'buyer'|'admin'
export type BatchStatus = 'registered'|'validated'|'matched'|'collection_scheduled'|'collected'|'received'|'processing'|'evidence_submitted'|'verified'|'completed'|'rejected'|'exception'
export interface Batch { id:string; name:string; category:string; qty:number; unit:string; source:string; region:string; status:BatchStatus; date:string; evidence?:'none'|'pending'|'accepted' }
export interface Processor { id:string; name:string; region:string; accepts:string[]; capacity:number; lat:number; lng:number }
export interface Notif { id:string; title:string; body:string; time:string; category:string; read:boolean; link:string }
export interface Activity { id:string; text:string; time:string; link:string }
export interface User { name:string; email:string; org:string; role:Role }
export interface Match { id:string; batchId:string; processorId:string; processorName:string; qty:number; score:number; status:'accepted'|'rejected'; date:string }
export interface Evidence { id:string; batchId:string; stage:string; note:string; status:'awaiting review'|'accepted'|'rejected'; by:string; date:string }
export interface Initiative { id:string; title:string; community:string; objective:string; category:string; qty:number; status:'proposed'|'active'|'revision'; comments:{ by:string; text:string; date:string }[] }
export interface Agreement { id:string; title:string; community:string; required:string[]; approvedBy:{ party:string; version:number }[]; version:number; status:'pending'|'active'|'revision'|'rejected'; effective:string; shares:{ party:string; share:number }[]; history:{ date:string; text:string }[]; updated:string }
export interface Product { id:string; name:string; seller:string; category:string; price:number; stock:number; desc:string; traceable:boolean; origin?:string; batchId?:string; region:string; hue:number }
export interface CartLine { productId:string; qty:number }
export type OrderStatus = 'pending'|'confirmed'|'preparing'|'dispatched'|'delivered'|'cancelled'
export interface Order { id:string; buyer:string; lines:{ productId:string; name:string; qty:number; price:number }[]; total:number; date:string; status:OrderStatus }
export interface Prefs { language:string; currency:string; units:string; emailAlerts:boolean }
export interface Pickup { id:string; requester:string; qty:number; address:string; lat?:number; lng?:number; source:'gps'|'manual'; date:string; status:'requested' }
