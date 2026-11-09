/** Kontak admin SIRKULA. Ganti nomor di bawah (format internasional, tanpa +, spasi, atau 0 di depan). */
export const ADMIN_WA_NUMBER = '6281234567890'
export const ADMIN_WA_DEFAULT_MSG = 'Halo Admin SIRKULA, saya butuh bantuan.'
export const adminWaUrl = (msg: string = ADMIN_WA_DEFAULT_MSG) => `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(msg)}`
