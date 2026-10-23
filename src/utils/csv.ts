export function downloadCsv(name: string, rows: Record<string, string | number>[]): boolean {
  if (!rows.length) return false
  const cols = Object.keys(rows[0]), esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const blob = new Blob([[cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n')], { type:'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); return true
}
