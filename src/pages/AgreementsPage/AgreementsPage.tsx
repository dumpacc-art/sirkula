import { useMemo, useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import './AgreementsPage.css'
export default function AgreementsPage() {
  const { agreements, agreementAction, setShare, notify } = useStore(); const { t } = useT()
  const [q, setQ] = useState(''), [st, setSt] = useState(''), [id, setId] = useState(agreements[0]?.id ?? ''), [note, setNote] = useState(''), [party, setParty] = useState('')
  const rows = useMemo(() => agreements.filter(a => (!q || (a.title + a.community).toLowerCase().includes(q.toLowerCase())) && (!st || a.status === st)), [agreements, q, st])
  const a = agreements.find(x => x.id === id)
  const done = (x: typeof a) => x ? x.required.filter(r => x.approvedBy.some(b => b.party === r && b.version === x.version)) : []
  const act = (k: 'approve' | 'revise' | 'reject' | 'resubmit') => { if (!a) return; if (k === 'approve' && !party) return notify('Choose a party to approve as'); agreementAction(a.id, k, note, party); setNote(''); notify('Agreement {k} recorded (prototype)', { k:t(k) }) }
  const total = a?.shares.reduce((s, x) => s + x.share, 0) ?? 0
  return (
    <div className="ag">
      <header><h1>{t('Agreements')}</h1><p>{t('Prototype records only. They are not legally enforceable contracts.')}</p></header>
      <div className="ag__f"><input placeholder={t('Search agreements')} value={q} onChange={e => setQ(e.target.value)} /><Select value={st} onChange={setSt} options={[{ value:'', label:t('All statuses') }, ...['pending','active','revision','rejected'].map(s => ({ value:s, label:t(s) }))]} /></div>
      <div className="ag__cols">
        <div>{rows.length === 0 ? <p className="ag__muted">{t('No agreements match.')}</p> : rows.map(x => <button key={x.id} className={`ag__row${x.id === id ? ' on' : ''}`} onClick={() => { setId(x.id); setParty('') }}>
          <b>{t(x.title)}</b><span>{x.community} · v{x.version}</span><span className="ag__bar"><i style={{ width:`${done(x).length / x.required.length * 100}%` }} /></span><StatusBadge status={x.status} /></button>)}</div>
        {a && <div className="ag__detail"><h2>{t(a.title)}</h2><p className="ag__muted">{t('Version')} {a.version} · {t('effective')} {a.effective}</p>
          <h4>{t('Approvals for v{v} ({d}/{n})', { v:a.version, d:done(a).length, n:a.required.length })}</h4>{a.required.map(r => <p key={r} className="ag__p">{done(a).includes(r) ? '✓' : '○'} {r}</p>)}
          <h4>{t('Cost allocation (demo, not payments)')}</h4>{a.shares.map(s => <label key={s.party} className="ag__share">{s.party}<input type="number" min={0} value={s.share} onChange={e => setShare(a.id, s.party, +e.target.value)} />%</label>)}
          <p className={total === 100 ? 'ag__muted' : 'ag__warn'}>{t('Total')} {total}%{total !== 100 && ` ${t('(should be 100%)')}`}</p>
          <h4>{t('History')}</h4>{[...a.history].reverse().map((h, i) => <p key={i} className="ag__p">{h.date} · {t(h.text)}</p>)}
          <input placeholder={t('Review note')} value={note} onChange={e => setNote(e.target.value)} />
          <div className="ag__act">{a.status === 'pending' && <><Select value={party} onChange={setParty} placeholder={t('Approve as…')} options={[{ value:'', label:t('Approve as…') }, ...a.required.filter(r => !done(a).includes(r)).map(r => ({ value:r, label:r }))]} /><button onClick={() => act('approve')}>{t('Approve')}</button><button className="alt" onClick={() => act('revise')}>{t('Request revision')}</button><button className="alt" onClick={() => act('reject')}>{t('Reject')}</button></>}
            {(a.status === 'revision' || a.status === 'active') && <button onClick={() => act('resubmit')}>{t('Submit new version (resets approvals)')}</button>}</div></div>}
      </div>
    </div>
  )
}
