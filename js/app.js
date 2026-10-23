const $=(s,e=document)=>e.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const uid=p=>p+'_'+(crypto.randomUUID?crypto.randomUUID().slice(0,8):Math.random().toString(36).slice(2,10));
const tgl=t=>new Date(t).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
const ROLES={generator:'Penghasil Sisa Pangan',processor:'Mitra Pengolah',buyer:'Pembeli',transport:'Mitra Pengangkut'};
const CATS=['Sisa nasi & lauk','Sayur & buah','Ampas kopi','Kulit buah','Sisa pasar'];
const NAV={generator:[['dashboard','Dampak'],['waste','WasteTrack'],['match','SmartMatch'],['pickups','Penjemputan'],['market','Marketplace'],['orders','Pesanan']],
 processor:[['dashboard','Dampak'],['pickups','Penjemputan'],['products','Produk Saya'],['market','Marketplace'],['orders','Pesanan']],
 buyer:[['market','Marketplace'],['orders','Pesanan']],transport:[['pickups','Penjemputan']]};
const NEXT={'Menunggu Konfirmasi':'Terjadwal','Terjadwal':'Dijemput','Dijemput':'Diterima Mitra','Diterima Mitra':'Pemanfaatan Terkonfirmasi'};
const FEE=0.02; // biaya layanan contoh, hanya pencatatan lokal
let me=null,st={q:'',cat:'',edit:null,focus:false};

const toast=m=>{const t=document.createElement('div');t.className='toast';t.textContent=m;$('#toasts').append(t);setTimeout(()=>t.remove(),3200)};
const badge=s=>`<span class="badge ${/Pemanfaatan|Diterima|Aktif|Selesai/.test(s)?'b-ok':/Dibatalkan/.test(s)?'b-no':/Menunggu|Diproses|Terjadwal/.test(s)?'b-wait':''}">${esc(s)}</span>`;
async function hashPw(pw,salt){
 if(!(window.crypto&&crypto.subtle)){let h=5381,x=salt+'|'+pw;for(let r=0;r<2000;r++)for(let i=0;i<x.length;i++)h=((h<<5)+h+x.charCodeAt(i))|0;return 'w'+(h>>>0).toString(16)} // cadangan lemah, hanya untuk konteks tidak aman
const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
 const b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256);
 return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}

async function seed(){ // data contoh opsional, hanya sekali
 if(localStorage.sirkulaSeed)return;localStorage.sirkulaSeed='1';
 const P=[['Kompos Rukun Warga (contoh)','Semarang',['Sisa nasi & lauk','Sayur & buah','Sisa pasar'],500,0],
  ['BSF Hijau Lestari (contoh)','Semarang',['Sisa nasi & lauk','Sisa pasar'],300,300],
  ['Kebun Kopi Kompos (contoh)','Ungaran',['Ampas kopi','Kulit buah','Sayur & buah'],200,0]];
 for(const [name,city,accepts,capacity,fee] of P)await DB.put('partners',{id:uid('ptn'),name,city,accepts,capacity,fee,days:[1,2,3,4,5,6],active:true,verified:true,seed:true});
 const R=[['Kompos Matang 5 kg (contoh)','Kompos',25000,40],['Kasgot BSF 1 kg (contoh)','Kasgot',18000,25],['Pupuk Cair 1 L (contoh)','Pupuk cair',15000,30]];
 for(const [name,cat,price,stock] of R)await DB.put('products',{id:uid('prd'),name,cat,price,stock,sellerId:'seed',seller:'Penjual contoh',city:'Semarang',status:'Aktif',seed:true,created:Date.now()})}

/* ---------- Pencocokan (deterministik, berbasis aturan) ---------- */
async function match(w){
 const [ps,pk]=await Promise.all([DB.all('partners'),DB.all('pickups')]);const day=new Date(w.date).getDay();
 return ps.filter(p=>p.active&&p.verified&&p.accepts.includes(w.cat)&&p.days.includes(day)).map(p=>{
  const used=pk.filter(k=>k.partnerId===p.id&&k.status!=='Dibatalkan').reduce((a,k)=>a+(k.actualKg||k.kg),0),left=p.capacity-used;
  const same=p.city.toLowerCase()===w.city.toLowerCase(),head=(left-w.kg)/p.capacity;
  const score=(same?40:0)+Math.round(head*30)+Math.max(0,Math.round(10-p.fee/100))+10;
  const why=[`Menerima kategori "${w.cat}"`,`Sisa kapasitas ${left} kg (cukup untuk ${w.kg} kg)`,same?`Berada di kota yang sama (${p.city})`:`Berlokasi di ${p.city} (jarak pasti belum tersedia)`,p.fee?`Biaya ${rp(p.fee)}/kg`:'Tanpa biaya penerimaan','Jadwal sesuai hari ketersediaan'];
  return{p,left,score,why}}).filter(m=>m.left>=w.kg).sort((a,b)=>b.score-a.score||a.p.name.localeCompare(b.p.name))}

/* ---------- Tampilan ---------- */
const pubNav=[['','Beranda'],['market','Marketplace'],['masuk','Masuk']];
function shell(body){const cur=location.hash.slice(2).split('/')[0];
 const nav=(me?NAV[me.role]:pubNav).map(([h,l])=>`<a href="#/${h}" class="${cur===h?'on':''}">${l}</a>`).join('');
 return `<header class="top"><div class="wrap"><a class="brand" href="#/">SIRKULA</a><nav class="main" aria-label="Navigasi utama">${nav}</nav>
 ${me?`<span class="tag" style="background:#ffffff22;color:#fff">${esc(me.name)} · ${ROLES[me.role]}</span><button class="btn sm alt" style="color:#fff;box-shadow:inset 0 0 0 2px #fff8" data-act="logout">Keluar</button>`:`<a class="btn sm" href="#/daftar" style="background:var(--leaf)">Daftar</a>`}</div></header>${body}
 <footer><div class="wrap"><b>SIRKULA</b> — Mode lokal: data tersimpan hanya di browser ini. Akun lokal bukan verifikasi identitas online. Tidak ada pembayaran atau notifikasi nyata yang terkirim.
 ${me?`<p><button class="btn sm danger" data-act="reset">Hapus semua data lokal</button> <button class="btn sm alt" style="color:#fff;box-shadow:inset 0 0 0 2px #fff8" data-act="exportAll">Cadangkan data (JSON)</button></p>`:''}</div></footer>`}

const vLanding=()=>shell(`<main><div class="wrap hero"><div><h1>Sisa Pangan, Jadi Peluang.</h1>
<p>Hubungkan sisa pangan dengan mitra pengolah dan pembeli untuk menciptakan manfaat ekonomi sekaligus mengurangi sampah organik.</p>
<div class="cta"><a class="btn" href="#/daftar">Mulai Sekarang</a><a class="btn alt" href="#/" data-act="cara">Jelajahi Cara Kerja</a></div></div>
<svg class="loop" viewBox="0 0 400 400" role="img" aria-label="Alur melingkar: penghasil, pengolah, pembeli"><g class="ring"><circle cx="200" cy="200" r="130" fill="none" stroke="#4caf50" stroke-width="6" stroke-dasharray="14 10"/>
<circle cx="200" cy="70" r="12" fill="#14452f"/><circle cx="312" cy="265" r="12" fill="#14452f"/><circle cx="88" cy="265" r="12" fill="#14452f"/></g>
<text x="200" y="40" text-anchor="middle">Penghasil</text><text x="340" y="320" text-anchor="middle">Pengolah</text><text x="60" y="320" text-anchor="middle">Pembeli</text><text x="200" y="205" text-anchor="middle">SIRKULA</text></svg></div>
<section class="sec alt" id="cara"><div class="wrap reveal"><h2>Tiga langkah sederhana</h2><ol class="steps"><li><h3>Catat Sisa Pangan</h3>Isi jenis, berat, dan waktu tersedia.</li><li><h3>Cari Mitra</h3>Sistem menyarankan pengolah yang cocok beserta alasannya.</li><li><h3>Jadwalkan Penjemputan</h3>Pantau sampai sisa pangan dimanfaatkan.</li></ol></div></section>
<section class="sec"><div class="wrap reveal"><h2>Empat fitur utama</h2><div class="grid">
<div class="card"><h3>WasteTrack</h3>Catat dan kelola sisa pangan, ekspor ke CSV.</div><div class="card"><h3>SmartMatch</h3>Pencocokan berbasis aturan yang bisa dijelaskan.</div>
<div class="card"><h3>Circular Market</h3>Jual dan beli kompos, kasgot, dan pupuk cair.</div><div class="card"><h3>Dashboard Dampak</h3>Berat yang benar-benar dimanfaatkan, bukan sekadar dicatat.</div></div></div></section>
<section class="sec alt"><div class="wrap reveal"><h2>Pertanyaan umum</h2>
<details><summary>Apakah data saya aman?</summary>Versi ini menyimpan data hanya di browser Anda (IndexedDB). Tidak ada server.</details>
<details><summary>Apakah pembayaran sungguhan terjadi?</summary>Tidak. Pesanan hanya tercatat lokal; tidak ada uang yang berpindah.</details>
<details><summary>Apakah mitra dan produk contoh itu nyata?</summary>Bukan. Semuanya berlabel "contoh" dan bukan data operasional.</details></div></section></main>`);

const vAuth=mode=>shell(`<main class="page wrap" style="max-width:560px"><h1 style="font-size:2rem">${mode==='daftar'?'Buat workspace lokal':'Masuk'}</h1>
<p class="hint">Akun ini hanya ada di browser ini dan bukan verifikasi identitas online.</p>
<form data-form="${mode}" class="card form" novalidate>
${mode==='daftar'?`<div class="full"><label for="role">Peran</label><select id="role" name="role">${Object.entries(ROLES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>
<div class="full"><label for="name">Nama usaha / organisasi / Anda</label><input id="name" name="name" required></div>
<div class="full"><label for="city">Kota</label><input id="city" name="city" required placeholder="Semarang"></div>`:''}
<div class="full"><label for="email">Email</label><input id="email" name="email" type="email" required></div>
<div class="full"><label for="pw">Kata sandi (min. 6 karakter)</label><input id="pw" name="pw" type="password" required minlength="6"></div>
<div class="full"><p class="err" id="ferr" role="alert"></p><button class="btn">${mode==='daftar'?'Daftar':'Masuk'}</button></div></form>
<p>${mode==='daftar'?'Sudah punya akun? <a href="#/masuk">Masuk</a>':'Belum punya akun? <a href="#/daftar">Daftar</a>'}</p></main>`);

async function vWaste(){
 const q=st.q.toLowerCase(),ws=(await DB.all('waste')).filter(w=>w.userId===me.id).sort((a,b)=>b.created-a.created).filter(w=>!q||(w.cat+w.city+w.note).toLowerCase().includes(q));
 const e=st.edit&&await DB.get('waste',st.edit);
 return shell(`<main class="page wrap"><div class="bar"><h1 style="font-size:2rem">WasteTrack</h1><div><button class="btn alt sm" data-act="csv">Ekspor CSV</button></div></div>
 <details ${e?'open':''} class="card"><summary>${e?'Ubah catatan':'Catat Sisa Pangan'}</summary><form data-form="waste" class="form" novalidate><input type="hidden" name="id" value="${e?e.id:''}">
 <div><label for="c">Kategori</label><select id="c" name="cat">${CATS.map(c=>`<option ${e&&e.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
 <div><label for="k">Berat (kg)</label><input id="k" name="kg" type="number" min="0.1" step="0.1" required value="${e?e.kg:''}"></div>
 <div><label for="d">Tersedia pada</label><input id="d" name="date" type="date" required value="${e?e.date:''}"></div>
 <div><label for="t">Kota</label><input id="t" name="city" required value="${e?esc(e.city):esc(me.city||'')}"></div>
 <div class="full"><label for="n">Catatan</label><input id="n" name="note" value="${e?esc(e.note):''}"></div>
 <div class="full"><p class="err" id="ferr" role="alert"></p><button class="btn">Simpan</button></div></form></details>
 <label for="s">Cari catatan</label><input id="s" data-q value="${esc(st.q)}" placeholder="Kategori, kota, catatan">
 <div class="tw" style="margin-top:12px"><table><thead><tr><th>Kategori</th><th>Berat</th><th>Tersedia</th><th>Kota</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
 ${ws.map(w=>`<tr><td>${esc(w.cat)}<br><span class="hint">${esc(w.note)}</span></td><td>${w.kg} kg</td><td>${tgl(w.date)}</td><td>${esc(w.city)}</td><td>${badge(w.status)}</td><td>
 ${w.status==='Tersedia'?`<a class="btn sm" href="#/match/${w.id}">Cari Mitra</a> <button class="btn sm alt" data-act="edit" data-id="${w.id}">Ubah</button> `:''}
 ${['Tersedia','Dibatalkan'].includes(w.status)?`<button class="btn sm danger" data-act="delWaste" data-id="${w.id}">Hapus</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6">Belum ada catatan. Buka "Catat Sisa Pangan" di atas untuk memulai.</td></tr>'}</tbody></table></div></main>`)}

async function vMatch(id){
 const ws=(await DB.all('waste')).filter(w=>w.userId===me.id&&w.status==='Tersedia');
 const w=ws.find(x=>x.id===id)||null;
 let body=`<label for="pick">Pilih catatan yang ingin dicarikan mitra</label><select id="pick" data-go>${'<option value="">— pilih —</option>'+ws.map(x=>`<option value="${x.id}" ${w&&w.id===x.id?'selected':''}>${esc(x.cat)} · ${x.kg} kg · ${tgl(x.date)}</option>`).join('')}</select>`;
 if(!ws.length)body+=`<div class="card" style="margin-top:16px">Belum ada sisa pangan berstatus Tersedia. <a href="#/waste">Catat dulu</a>.</div>`;
 if(w){const R=await match(w);body+=`<h2 style="margin-top:24px">Rekomendasi untuk ${esc(w.cat)} (${w.kg} kg)</h2><p class="hint">Aturan: mitra aktif & terverifikasi, menerima kategori, kapasitas cukup, jadwal cocok. Skor: kota sama (40), sisa kapasitas (30), biaya (10), verifikasi (10).</p>
 <div class="grid">${R.map(m=>`<div class="card"><h3>${esc(m.p.name)}</h3><span class="tag">Skor ${m.score}</span><div class="meter" style="margin:10px 0" title="Kapasitas terpakai"><i style="width:${Math.round(100*(1-m.left/m.p.capacity))}%"></i></div>
 <ul>${m.why.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="btn sm" data-act="request" data-w="${w.id}" data-p="${m.p.id}">Minta Penjemputan</button></div>`).join('')||'<div class="card">Belum ada mitra yang cocok untuk kategori, kapasitas, atau hari ini. Coba ubah tanggal ketersediaan.</div>'}</div>`}
 return shell(`<main class="page wrap"><h1 style="font-size:2rem">SmartMatch</h1>${body}</main>`)}

async function vPickups(){
 const [pk,ws,ps]=await Promise.all([DB.all('pickups'),DB.all('waste'),DB.all('partners')]);
 const list=pk.filter(k=>me.role!=='generator'||k.userId===me.id).sort((a,b)=>b.created-a.created);
 return shell(`<main class="page wrap"><h1 style="font-size:2rem">Penjemputan</h1><p class="hint">Mengubah status di sini hanya mencatat di aplikasi ini; tidak ada pemberitahuan nyata ke pihak lain.</p><div class="grid">
 ${list.map(k=>{const w=ws.find(x=>x.id===k.wasteId)||{},p=ps.find(x=>x.id===k.partnerId)||{};const n=NEXT[k.status];
 return `<div class="card"><h3>${esc(w.cat)} · ${k.actualKg||k.kg} kg</h3>${badge(k.status)}<p class="hint">Mitra: ${esc(p.name)}<br>Kota: ${esc(w.city)}</p>
 <div class="tl">${k.history.map(h=>`<span>${esc(h.s)} · ${tgl(h.t)}</span>`).join('')}</div><p>
 ${n&&me.role!=='generator'&&me.role!=='buyer'?`<button class="btn sm" data-act="advance" data-id="${k.id}">${n==='Dijemput'?'Catat dijemput':'Tandai '+n}</button> `:''}
 ${n&&me.role==='generator'&&['Menunggu Konfirmasi','Terjadwal'].includes(k.status)?`<button class="btn sm danger" data-act="cancelPickup" data-id="${k.id}">Batalkan</button>`:''}</p></div>`}).join('')||'<div class="card">Belum ada permintaan penjemputan.</div>'}</div></main>`)}

async function vMarket(){
 const q=st.q.toLowerCase(),pr=(await DB.all('products')).filter(p=>p.status==='Aktif'&&(!st.cat||p.cat===st.cat)&&(!q||p.name.toLowerCase().includes(q)));
 const cats=[...new Set((await DB.all('products')).map(p=>p.cat))];
 return shell(`<main class="page wrap"><h1 style="font-size:2rem">Circular Market</h1><div class="form"><div><label for="s">Cari produk</label><input id="s" data-q value="${esc(st.q)}"></div>
 <div><label for="f">Kategori</label><select id="f" data-cat><option value="">Semua</option>${cats.map(c=>`<option ${st.cat===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div></div>
 <div class="grid" style="margin-top:18px">${pr.map(p=>`<div class="card"><span class="tag">${esc(p.cat)}</span>${p.seed?' <span class="tag">Data contoh</span>':''}<h3>${esc(p.name)}</h3><div class="metric" style="font-size:1.4rem">${rp(p.price)}</div>
 <p class="hint">${esc(p.seller)} · ${esc(p.city)}<br>Stok: ${p.stock}${p.stock<=0?' (habis)':''}. Belum ada dokumen mutu terlampir.</p>
 ${me&&me.role==='buyer'?`<label for="q${p.id}">Jumlah</label><input id="q${p.id}" type="number" min="1" max="${p.stock}" value="1"><p><button class="btn sm" data-act="order" data-id="${p.id}" ${p.stock<=0?'disabled':''}>Pesan</button></p>`:me?'<p class="hint">Pemesanan khusus akun Pembeli.</p>':'<a class="btn sm" href="#/masuk">Masuk untuk memesan</a>'}</div>`).join('')||'<div class="card">Tidak ada produk yang cocok. Hapus filter pencarian.</div>'}</div></main>`)}

async function vProducts(){
 const pr=(await DB.all('products')).filter(p=>p.sellerId===me.id);
 return shell(`<main class="page wrap"><h1 style="font-size:2rem">Produk Saya</h1><form data-form="product" class="card form" novalidate>
 <div><label for="n">Nama produk</label><input id="n" name="name" required></div><div><label for="c">Kategori</label><input id="c" name="cat" required placeholder="Kompos"></div>
 <div><label for="p">Harga (Rp)</label><input id="p" name="price" type="number" min="1" required></div><div><label for="s">Stok</label><input id="s" name="stock" type="number" min="0" required></div>
 <div class="full"><p class="err" id="ferr" role="alert"></p><button class="btn">Terbitkan Produk</button></div></form>
 <div class="tw" style="margin-top:16px"><table><thead><tr><th>Produk</th><th>Harga</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
 ${pr.map(p=>`<tr><td>${esc(p.name)}</td><td>${rp(p.price)}</td><td><button class="btn sm alt" data-act="stock" data-id="${p.id}" data-d="-1">−</button> ${p.stock} <button class="btn sm alt" data-act="stock" data-id="${p.id}" data-d="1">+</button></td><td>${badge(p.status)}</td>
 <td><button class="btn sm alt" data-act="toggleProd" data-id="${p.id}">${p.status==='Aktif'?'Nonaktifkan':'Aktifkan'}</button></td></tr>`).join('')||'<tr><td colspan="5">Belum ada produk. Isi formulir di atas.</td></tr>'}</tbody></table></div></main>`)}

async function vOrders(){
 const os=(await DB.all('orders')).filter(o=>o.buyerId===me.id||o.sellerId===me.id).sort((a,b)=>b.created-a.created);
 return shell(`<main class="page wrap"><h1 style="font-size:2rem">Pesanan</h1><p class="hint">Catatan lokal. Tidak ada pembayaran nyata dan penjual tidak diberi tahu.</p><div class="tw"><table><thead><tr><th>Produk</th><th>Jumlah</th><th>Subtotal</th><th>Biaya layanan (2%)</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
 ${os.map(o=>`<tr><td>${esc(o.name)}<br><span class="hint">${tgl(o.created)}</span></td><td>${o.qty}</td><td>${rp(o.sub)}</td><td>${rp(o.fee)}</td><td><b>${rp(o.total)}</b></td><td>${badge(o.status)}</td><td>
 ${o.status==='Diproses'&&o.buyerId===me.id?`<button class="btn sm" data-act="received" data-id="${o.id}">Pesanan diterima</button> <button class="btn sm danger" data-act="cancelOrder" data-id="${o.id}">Batalkan</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7">Belum ada pesanan.</td></tr>'}</tbody></table></div></main>`)}

async function vDash(){
 const [ws,pk,os]=await Promise.all([DB.all('waste'),DB.all('pickups'),DB.all('orders')]);
 const mine=me.role==='generator'?ws.filter(w=>w.userId===me.id):ws,mp=me.role==='generator'?pk.filter(k=>k.userId===me.id):pk;
 const sum=a=>a.reduce((x,y)=>x+y,0),rec=sum(mine.filter(w=>w.status!=='Dibatalkan').map(w=>w.kg));
 const kg=k=>k.actualKg||k.kg,col=sum(mp.filter(k=>['Dijemput','Diterima Mitra','Pemanfaatan Terkonfirmasi'].includes(k.status)).map(kg));
 const acc=sum(mp.filter(k=>['Diterima Mitra','Pemanfaatan Terkonfirmasi'].includes(k.status)).map(kg)),use=sum(mp.filter(k=>k.status==='Pemanfaatan Terkonfirmasi').map(kg));
 const done=os.filter(o=>o.status==='Selesai'&&(o.buyerId===me.id||o.sellerId===me.id)),pct=rec?Math.round(100*use/rec):0;
 const M=[['Tercatat',rec,'Total berat sisa pangan yang dicatat (tanpa yang dibatalkan).'],['Sudah dijemput',col,'Berat aktual yang tercatat saat penjemputan.'],['Diterima mitra',acc,'Berat yang sudah diterima mitra pengolah.'],['Sudah dimanfaatkan',use,'Berat yang dikonfirmasi telah dimanfaatkan.']];
 const mx=Math.max(1,...M.map(m=>m[1]));
 return shell(`<main class="page wrap"><h1 style="font-size:2rem">Dampak</h1><div class="grid">${M.map(m=>`<div class="card"><div class="metric">${m[1]} kg</div><b>${m[0]}</b><p class="hint">${m[2]}</p><div class="meter"><i style="width:${Math.round(100*m[1]/mx)}%"></i></div></div>`).join('')}
 <div class="card"><div class="metric">${pct}%</div><b>Persentase pemanfaatan</b><p class="hint">Dimanfaatkan ÷ tercatat. ${rec?'':'Belum ada data.'}</p></div>
 <div class="card"><div class="metric">${done.length}</div><b>Transaksi selesai</b><p class="hint">Nilai ${rp(done.reduce((a,o)=>a+o.sub,0))}. Pesanan batal tidak dihitung.</p></div></div>
 <p class="hint">Estimasi emisi atau kesetaraan lingkungan sengaja tidak ditampilkan karena belum ada metodologi dan data sumber.</p></main>`)}

/* ---------- Router ---------- */
async function route(){
 const [r,id]=location.hash.slice(2).split('/');me=localStorage.sirkulaMe?await DB.get('users',localStorage.sirkulaMe):null;
 const pub=['','masuk','daftar','market'];
 if(!pub.includes(r)&&(!me||!NAV[me.role].some(n=>n[0]===r))){location.hash=me?'#/'+NAV[me.role][0][0]:'#/masuk';return}
 if(me&&['masuk','daftar'].includes(r)){location.hash='#/'+NAV[me.role][0][0];return}
 const V={'':vLanding,masuk:()=>vAuth('masuk'),daftar:()=>vAuth('daftar'),waste:vWaste,match:()=>vMatch(id),pickups:vPickups,market:vMarket,products:vProducts,orders:vOrders,dashboard:vDash};
 $('#app').innerHTML=await (V[r]||vLanding)();
 const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&(e.target.classList.add('in'),io.unobserve(e.target))));
 document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
 if(st.focus){const s=$('[data-q]');if(s){s.focus();s.setSelectionRange(99,99)}st.focus=false}
}

/* ---------- Aksi ---------- */
const ACT={
 cara(){const el=document.getElementById('cara');el&&el.scrollIntoView({behavior:'smooth'})},
 logout(){localStorage.removeItem('sirkulaMe');location.hash='#/';route()},
 async reset(){if(confirm('Hapus SEMUA data lokal? Tindakan ini tidak bisa dibatalkan.')){await DB.clear();localStorage.clear();location.hash='#/';location.reload()}},
 async exportAll(){const o={};for(const s of ['users','waste','partners','pickups','products','orders'])o[s]=await DB.all(s);
  o.users=o.users.map(({pass,salt,...u})=>u);dl('sirkula-cadangan.json',JSON.stringify(o,null,2),'application/json')},
 async csv(){const ws=(await DB.all('waste')).filter(w=>w.userId===me.id);
  const rows=[['ID','Kategori','Berat_kg','Tersedia','Kota','Status','Catatan'],...ws.map(w=>[w.id,w.cat,w.kg,w.date,w.city,w.status,w.note])];
  dl('wastetrack.csv',rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n'),'text/csv')},
 edit(d){st.edit=d.id;route()},
 async delWaste(d){if(confirm('Hapus catatan ini?')){await DB.del('waste',d.id);toast('Catatan dihapus');route()}},
 async request(d){const w=await DB.get('waste',d.w);if(!w||w.status!=='Tersedia')return toast('Catatan ini sudah diminta');
  w.status='Menunggu Konfirmasi';w.updated=Date.now();await DB.put('waste',w);
  await DB.put('pickups',{id:uid('pck'),wasteId:w.id,partnerId:d.p,userId:me.id,kg:w.kg,status:'Menunggu Konfirmasi',created:Date.now(),history:[{s:'Menunggu Konfirmasi',t:Date.now()}]});
  toast('Permintaan penjemputan tercatat');location.hash='#/pickups'},
 async advance(d){const k=await DB.get('pickups',d.id),n=NEXT[k.status];if(!n)return;
  if(n==='Dijemput'){const v=parseFloat(prompt('Berat aktual yang dijemput (kg):',k.kg));if(!(v>0))return toast('Berat harus lebih dari 0');k.actualKg=v}
  k.status=n;k.history.push({s:n,t:Date.now()});await DB.put('pickups',k);await syncWaste(k);toast('Status: '+n);route()},
 async cancelPickup(d){if(!confirm('Batalkan penjemputan?'))return;const k=await DB.get('pickups',d.id);
  if(!NEXT[k.status]||!['Menunggu Konfirmasi','Terjadwal'].includes(k.status))return;
  k.status='Dibatalkan';k.history.push({s:'Dibatalkan',t:Date.now()});await DB.put('pickups',k);
  const w=await DB.get('waste',k.wasteId);w.status='Tersedia';w.updated=Date.now();await DB.put('waste',w);toast('Penjemputan dibatalkan');route()},
 async order(d){const qty=parseInt($('#q'+d.id).value);const p=await DB.get('products',d.id);
  if(!(qty>=1)||qty>p.stock)return toast('Jumlah tidak valid atau melebihi stok');
  const sub=p.price*qty,fee=Math.round(sub*FEE);
  try{await DB.placeOrder({id:uid('ord'),productId:p.id,name:p.name,qty,sub,fee,total:sub+fee,status:'Diproses',buyerId:me.id,sellerId:p.sellerId,created:Date.now()});toast('Pesanan tercatat');location.hash='#/orders'}catch(e){toast(e.message)}},
 async cancelOrder(d){if(!confirm('Batalkan pesanan?'))return;try{await DB.cancelOrder(d.id);toast('Pesanan dibatalkan, stok dikembalikan');route()}catch(e){toast(e.message)}},
 async received(d){const o=await DB.get('orders',d.id);if(o.status!=='Diproses')return;o.status='Selesai';await DB.put('orders',o);toast('Pesanan selesai');route()},
 async stock(d){const p=await DB.get('products',d.id);p.stock=Math.max(0,p.stock+ +d.d);await DB.put('products',p);route()},
 async toggleProd(d){const p=await DB.get('products',d.id);p.status=p.status==='Aktif'?'Nonaktif':'Aktif';await DB.put('products',p);route()}
};
async function syncWaste(k){const w=await DB.get('waste',k.wasteId);w.status=k.status;if(k.actualKg)w.kg=k.actualKg;w.updated=Date.now();await DB.put('waste',w)}
function dl(n,t,m){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;a.click();toast('Berkas diunduh: '+n)}

const FORM={
 async daftar(f){if(!f.name.trim()||!f.city.trim())return 'Nama dan kota wajib diisi.';if(!/^\S+@\S+\.\S+$/.test(f.email))return 'Format email tidak valid.';if(f.pw.length<6)return 'Kata sandi minimal 6 karakter.';
  if((await DB.all('users')).some(u=>u.email===f.email.toLowerCase()))return 'Email sudah terdaftar di browser ini.';
  const salt=uid('s'),u={id:uid('usr'),role:f.role,name:f.name.trim(),city:f.city.trim(),email:f.email.toLowerCase(),salt,pass:await hashPw(f.pw,salt),created:Date.now()};
  await DB.put('users',u);localStorage.sirkulaMe=u.id;toast('Workspace lokal dibuat');location.hash='#/'+NAV[u.role][0][0]},
 async masuk(f){const u=(await DB.all('users')).find(x=>x.email===f.email.toLowerCase());
  if(!u||u.pass!==await hashPw(f.pw,u.salt))return 'Email atau kata sandi salah.';localStorage.sirkulaMe=u.id;location.hash='#/'+NAV[u.role][0][0]},
 async waste(f){const kg=parseFloat(f.kg);if(!(kg>0))return 'Berat harus lebih dari 0.';if(!f.date)return 'Tanggal wajib diisi.';if(!f.city.trim())return 'Kota wajib diisi.';
  const old=f.id&&await DB.get('waste',f.id);if(old&&old.status!=='Tersedia')return 'Hanya catatan berstatus Tersedia yang bisa diubah.';
  await DB.put('waste',{...(old||{id:uid('wst'),userId:me.id,status:'Tersedia',created:Date.now()}),cat:f.cat,kg,date:f.date,city:f.city.trim(),note:f.note.trim(),updated:Date.now()});
  st.edit=null;toast('Catatan disimpan');route()},
 async product(f){const price=parseInt(f.price),stock=parseInt(f.stock);if(!f.name.trim()||!f.cat.trim())return 'Nama dan kategori wajib diisi.';if(!(price>0)||!(stock>=0))return 'Harga dan stok harus berupa angka valid.';
  await DB.put('products',{id:uid('prd'),name:f.name.trim(),cat:f.cat.trim(),price,stock,sellerId:me.id,seller:me.name,city:me.city,status:'Aktif',created:Date.now()});toast('Produk diterbitkan');route()}
};

document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&ACT[b.dataset.act]){e.preventDefault();b.disabled=true;Promise.resolve(ACT[b.dataset.act](b.dataset)).finally(()=>b.isConnected&&(b.disabled=false))}});
document.addEventListener('submit',async e=>{const fm=e.target.closest('[data-form]');if(!fm)return;e.preventDefault();
 const btn=fm.querySelector('button');btn.disabled=true;let msg;
 try{msg=await FORM[fm.dataset.form](Object.fromEntries(new FormData(fm)))}catch(err){console.error(err);msg='Terjadi kesalahan: '+err.message}
 if(msg&&$('#ferr'))$('#ferr').textContent=msg;btn&&(btn.disabled=false)});
window.addEventListener('unhandledrejection',e=>toast('Error: '+(e.reason&&e.reason.message||e.reason)));
window.addEventListener('error',e=>toast('Error: '+e.message));
document.addEventListener('input',e=>{if(e.target.matches('[data-q]')){st.q=e.target.value;st.focus=true;route()}});
document.addEventListener('change',e=>{if(e.target.matches('[data-cat]')){st.cat=e.target.value;route()}if(e.target.matches('[data-go]')&&e.target.value)location.hash='#/match/'+e.target.value});
window.addEventListener('hashchange',()=>{st.q='';st.edit=null;route()});
seed().then(route);
