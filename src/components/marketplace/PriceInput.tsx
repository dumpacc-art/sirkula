import { formatThousands, parseThousands } from '../../config/marketplace'

/** Input angka dengan pemisah ribuan otomatis (12000 -> 12.000). `value` selalu string berformat. */
export default function PriceInput({ value, onChange, prefix, id, placeholder, label }: {
  value: string; onChange: (formatted: string, n: number) => void; prefix?: string; id?: string; placeholder?: string; label?: string
}) {
  return (
    <span className={`mkp${prefix ? ' mkp--pre' : ''}`}>
      {prefix && <i aria-hidden="true">{prefix}</i>}
      <input id={id} inputMode="numeric" autoComplete="off" placeholder={placeholder} aria-label={label} value={value}
        onChange={e => { const f = formatThousands(e.target.value); onChange(f, parseThousands(f)) }} />
    </span>
  )
}
