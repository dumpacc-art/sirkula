import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts'
import { flowSeries } from '../../data/demoData'
import { useT } from '../../i18n'

const rise = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: .55, ease: [.22, 1, .36, 1] as const } }

export default function ImpactCharts() {
  const { t } = useT()
  return (
        <div className="lp__charts">
      <motion.div {...rise}><h4>{t('Collected vs processed (demo)')}</h4><ResponsiveContainer width="100%" height={220}><AreaChart data={flowSeries}><CartesianGrid stroke="#ffffff1f" vertical={false} /><XAxis dataKey="m" stroke="#9fb8a8" tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: 0 }} /><Area dataKey="collected" stroke="#9fb8a8" fill="#9fb8a8" fillOpacity={.25} /><Area dataKey="processed" stroke="#c5f26b" fill="#c5f26b" fillOpacity={.35} /></AreaChart></ResponsiveContainer></motion.div>
      <motion.div {...rise}><h4>{t('Processed per month (demo)')}</h4><ResponsiveContainer width="100%" height={220}><BarChart data={flowSeries}><CartesianGrid stroke="#ffffff1f" vertical={false} /><XAxis dataKey="m" stroke="#9fb8a8" tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: 0 }} cursor={{ fill: '#ffffff12' }} /><Bar dataKey="processed" fill="#c5f26b" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></motion.div>
    </div>
  )
}
