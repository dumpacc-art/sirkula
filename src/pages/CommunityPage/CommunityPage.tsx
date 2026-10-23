import { useState, type FormEvent } from 'react'
import { useStore } from '../../store/StoreContext'
import { useT } from '../../i18n'
import { communities } from '../../data/demoData'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import './CommunityPage.css'
export default function CommunityPage() {
  const { initiatives, agreements, addInitiative, addComment, notify } = useStore(); const { t } = useT()
  const [open, setOpen] = useState(false), [err, setErr] = useState(''), [sel, setSel] = useState<string | null>(null), [c, setC] = useState(''), [com, setCom] = useState(communities[0].name)
  const cur = initiatives.find(i => i.id === sel)
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget), title = String(f.get('title')).trim(), qty = Number(f.get('qty'))
    if (!title) return setErr('Title is required'); if (!(qty > 0)) return setErr('Proposed quantity must be above 0')
    addInitiative({ title, community:com, objective:String(f.get('objective')), category:String(f.get('category')), qty }); setErr(''); setOpen(false); notify('Initiative added to the board')
  }
  return (
    <div className="cm">
      <header><h1>{t('Communities')}</h1><p>{t('Demonstration communities from different regions. Each community defines its own approval rules; nothing here is a legal or cultural default.')}</p></header>
      <section className="cm__over">{communities.map(m => <div key={m.name} className="cm__tile"><h3>{m.name}</h3><p>{t(m.region)} · {m.members} {t('members')}</p>
        <small>{t('{n} initiatives · {a} active agreements', { n:initiatives.filter(i => i.community === m.name).length, a:agreements.filter(a => a.community === m.name && a.status === 'active').length })}</small></div>)}</section>
      <div className="cm__bar"><h2>{t('Initiative board')}</h2><button onClick={() => { setErr(''); setOpen(true) }}>+ {t('New initiative')}</button></div>
      <section className="cm__board">{initiatives.map(i => <article key={i.id} className="cm__card" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSel(i.id)} onClick={() => setSel(i.id)}>
        <StatusBadge status={i.status} /><h3>{t(i.title)}</h3><p>{i.community}</p><small>{t(i.category)} · {t('{q} kg proposed · {n} comments', { q:i.qty.toLocaleString(), n:i.comments.length })}</small></article>)}</section>
      <Modal open={open} title={t('New initiative')} onClose={() => setOpen(false)}><form className="cm__form" onSubmit={submit} noValidate>
        <label>{t('Title')}<input name="title" /></label><label>{t('Community')}<Select value={com} onChange={setCom} options={communities.map(m => m.name)} /></label>
        <label>{t('Objective')}<input name="objective" /></label><label>{t('Target material')}<input name="category" defaultValue="Plastic" /></label><label>{t('Proposed quantity (kg)')}<input name="qty" type="number" /></label>
        {err && <em>{t(err)}</em>}<button type="submit">{t('Create')}</button></form></Modal>
      <Modal open={!!cur} title={cur ? t(cur.title) : ''} onClose={() => setSel(null)}>{cur && <div className="cm__form"><p>{t(cur.objective) || t('No objective written.')}</p><h4>{t('Discussion')}</h4>
        {cur.comments.length === 0 ? <small>{t('No comments yet.')}</small> : cur.comments.map((x, k) => <p key={k} className="cm__cmt"><b>{x.by}</b> · {x.date}<br />{t(x.text)}</p>)}
        <input placeholder={t('Add a comment or suggest a change')} value={c} onChange={e => setC(e.target.value)} />
        <button onClick={() => { if (!c.trim()) return; addComment(cur.id, c.trim()); setC('') }}>{t('Post comment')}</button></div>}</Modal>
    </div>
  )
}
