import { motion } from 'framer-motion'
import './KpiCard.css'
export default function KpiCard({ label, value, hint }: { label:string; value:string|number; hint?:string }) {
  return (
    <motion.div className="kpi" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.35 }}>
      <span className="kpi__label">{label}</span><strong className="kpi__value">{value}</strong>{hint && <small>{hint}</small>}
    </motion.div>
  )
}
