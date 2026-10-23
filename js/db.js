// Lapisan data IndexedDB. UI tidak menyentuh IndexedDB langsung.
const DB={
 open(){return this._p||(this._p=new Promise((res,rej)=>{const r=indexedDB.open('sirkula',1);
  r.onupgradeneeded=()=>['users','waste','partners','pickups','products','orders'].forEach(s=>r.result.createObjectStore(s,{keyPath:'id'}));
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
 async all(s){const d=await this.open();return new Promise((res,rej)=>{const q=d.transaction(s).objectStore(s).getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})},
 async get(s,id){const d=await this.open();return new Promise((res,rej)=>{const q=d.transaction(s).objectStore(s).get(id);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})},
 async put(s,o){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(s,'readwrite');t.objectStore(s).put(o);t.oncomplete=()=>res(o);t.onerror=()=>rej(t.error)})},
 async del(s,id){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(s,'readwrite');t.objectStore(s).delete(id);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})},
 // Pesanan + pengurangan stok dalam satu transaksi (atomik).
 async placeOrder(o){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(['products','orders'],'readwrite');
  const g=t.objectStore('products').get(o.productId);
  g.onsuccess=()=>{const p=g.result;if(!p||p.status!=='Aktif'||p.stock<o.qty){t.abort();return}
   p.stock-=o.qty;t.objectStore('products').put(p);t.objectStore('orders').put(o)};
  t.oncomplete=()=>res(o);t.onabort=()=>rej(new Error('Stok tidak cukup atau produk tidak aktif'))})},
 // Pembatalan + pengembalian stok (hanya pesanan "Diproses").
 async cancelOrder(id){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(['products','orders'],'readwrite');
  const g=t.objectStore('orders').get(id);
  g.onsuccess=()=>{const o=g.result;if(!o||o.status!=='Diproses'){t.abort();return}
   o.status='Dibatalkan';t.objectStore('orders').put(o);
   const pg=t.objectStore('products').get(o.productId);
   pg.onsuccess=()=>{const p=pg.result;if(p){p.stock+=o.qty;t.objectStore('products').put(p)}}};
  t.oncomplete=()=>res();t.onabort=()=>rej(new Error('Pesanan tidak bisa dibatalkan'))})},
 async clear(){const d=await this.open();d.close();this._p=null;return new Promise(r=>{const q=indexedDB.deleteDatabase('sirkula');q.onsuccess=q.onerror=q.onblocked=()=>r()})}
};
