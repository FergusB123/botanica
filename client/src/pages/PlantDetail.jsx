import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Droplets, Sun, Thermometer, Droplet, Star, Skull, Zap, Clock, Plus, Camera, Trash2, Sparkles, ChevronDown, ChevronUp, Activity, CheckCircle } from 'lucide-react'
import { format, formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns'
import HealthBadge from '../components/HealthBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

const JICONS = { manual:'📝', watered:'💧', health_check:'🩺', added:'🌱' }

function Chip({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3.5 py-3">
      <p className="flex items-center gap-1 text-2xs text-dust uppercase tracking-wider font-sans mb-1">{icon} {label}</p>
      <p className="text-sm font-medium text-jet font-sans">{value}</p>
    </div>
  )
}

function Overview({ plant, photos, latestHealth, onWatered }) {
  const due      = plant.next_watering_at && isPast(new Date(plant.next_watering_at))
  const daySince = plant.last_watered_at ? differenceInDays(new Date(), new Date(plant.last_watered_at)) : null
  const tips     = Array.isArray(plant.care_tips) ? plant.care_tips : []

  const water = async () => {
    try { await api.post(`/plants/${plant.id}/water`); toast.success('Watered! 💧'); onWatered() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      {/* Watering banner */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${due ? 'bg-crimson-bg border-crimson/20' : 'bg-card border-border'}`}>
        <span className="text-2xl flex-shrink-0">💧</span>
        <div className="flex-1">
          <p className={`font-sans text-sm font-medium ${due ? 'text-crimson' : 'text-ink'}`}>
            {due ? `Overdue${daySince&&daySince>plant.watering_frequency_days?` — ${daySince}d since last watered`:''}` :
              plant.next_watering_at ? isToday(new Date(plant.next_watering_at)) ? 'Water today' :
              `Next ${formatDistanceToNow(new Date(plant.next_watering_at),{addSuffix:true})}` : 'No schedule'}
          </p>
          {daySince!=null && <p className="text-xs text-dust mt-0.5">Last watered {daySince===0?'today':`${daySince}d ago`}</p>}
        </div>
        <button onClick={water} className={due?'btn-primary py-2 text-xs bg-crimson hover:bg-crimson/90':'btn-secondary py-2 text-xs'}>
          Mark watered
        </button>
      </div>

      {/* Care chips grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Chip icon={<Sun size={10}/>} label="Sunlight" value={plant.sunlight}/>
        <Chip icon={<Thermometer size={10}/>} label="Temperature" value={plant.temp_min&&plant.temp_max?`${plant.temp_min}–${plant.temp_max}°C`:null}/>
        <Chip icon={<Droplet size={10}/>} label="Humidity" value={plant.humidity}/>
        <Chip icon={<Zap size={10}/>} label="Growth" value={plant.growth_rate}/>
        <Chip icon={<Star size={10}/>} label="Difficulty" value={plant.difficulty}/>
        <Chip icon={<Skull size={10}/>} label="Toxicity" value={plant.toxic?'⚠️ Toxic':'✓ Pet safe'}/>
        <Chip icon={<Clock size={10}/>} label="Lifespan" value={plant.typical_lifespan}/>
        <Chip icon={<Droplets size={10}/>} label="Watering" value={`Every ${plant.watering_frequency_days}d`}/>
      </div>

      {tips.length>0 && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-display text-lg text-jet mb-3">Care tips</h3>
          <ul className="space-y-2.5">
            {tips.map((t,i)=>(
              <li key={i} className="flex gap-3 text-sm font-sans text-ink"><span className="text-grove flex-shrink-0">✓</span>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {plant.fun_fact && (
        <div className="bg-card border border-border rounded-xl p-5 flex gap-3">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="font-sans text-xs text-dust uppercase tracking-wider mb-1">Did you know</p>
            <p className="text-sm text-ink font-sans leading-relaxed">{plant.fun_fact}</p>
          </div>
        </div>
      )}
      {plant.notes && (
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="font-sans text-xs text-dust uppercase tracking-wider mb-2">Notes</p>
          <p className="text-sm text-ink font-sans leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
        </div>
      )}
    </div>
  )
}

function Journal({ plantId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [photo, setPhoto] = useState(null)

  const load = useCallback(async () => {
    try { const r = await api.get(`/journal/${plantId}`); setEntries(r.data.entries) } catch {}
    finally { setLoading(false) }
  }, [plantId])
  useEffect(() => { load() }, [load])

  const post = async () => {
    if (!content.trim()&&!photo) return
    setPosting(true)
    try {
      const fd=new FormData(); if(content) fd.append('content',content); if(photo) fd.append('photo',photo)
      await api.post(`/journal/${plantId}`,fd); setContent(''); setPhoto(null); load()
    } catch { toast.error('Failed') } finally { setPosting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-border rounded-xl p-5">
        <textarea className="input resize-none mb-3" rows={3} placeholder="How is your plant doing? Note any changes…"
          value={content} onChange={e=>setContent(e.target.value)}/>
        {photo && <div className="flex items-center gap-2 mb-3 text-xs text-dust"><Camera size={12}/>{photo.name}<button onClick={()=>setPhoto(null)} className="text-crimson hover:underline ml-1">Remove</button></div>}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer text-xs text-dust hover:text-ink flex items-center gap-1.5 transition-colors">
            <Camera size={13}/> Photo
            <input type="file" className="hidden" accept="image/*" onChange={e=>setPhoto(e.target.files[0])}/>
          </label>
          <button onClick={post} disabled={posting||(!content.trim()&&!photo)} className="btn-primary ml-auto py-2 text-xs">
            {posting?'Adding…':'Add entry'}
          </button>
        </div>
      </div>
      {loading ? <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-16 bg-card rounded-xl border border-border animate-pulse"/>)}</div>
        : entries.length===0 ? <div className="text-center py-10"><p className="text-3xl mb-2">📖</p><p className="text-sm text-dust">No entries yet</p></div>
        : <div className="space-y-2">
          {entries.map(e=>(
            <div key={e.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-[10px] flex-shrink-0">{JICONS[e.type]||'📝'}</div>
                <div className="flex-1 w-px bg-border my-1"/>
              </div>
              <div className="pb-3 flex-1">
                <p className="text-xs text-dust mb-1">{format(new Date(e.created_at),'PPp')} · <span className="capitalize">{e.type.replace('_',' ')}</span></p>
                {e.content && <p className="text-sm text-ink font-sans leading-relaxed">{e.content}</p>}
                {e.photo_path && <img src={e.photo_path} alt="" className="mt-2 rounded-xl w-full max-w-xs border border-border"/>}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

function Health({ plant, latestHealth, onRefresh }) {
  const [photo, setPhoto] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [histOpen, setHistOpen] = useState(false)

  const loadH = useCallback(async () => {
    try { const r=await api.get(`/plants/${plant.id}/health-checks`); setHistory(r.data.healthChecks) } catch {}
  }, [plant.id])
  useEffect(() => { loadH() }, [loadH])

  const run = async () => {
    if (!photo) { toast.error('Upload a photo'); return }
    setLoading(true)
    try {
      const fd=new FormData(); fd.append('photo',photo); if(symptoms) fd.append('symptoms',symptoms)
      const r=await api.post(`/plants/${plant.id}/health-check`,fd)
      setResult(r.data.healthCheck); setPhoto(null); setSymptoms(''); loadH(); onRefresh()
    } catch(err) { toast.error(err.response?.data?.error||'Failed') } finally { setLoading(false) }
  }

  const check = result||latestHealth

  return (
    <div className="space-y-5">
      <div className="bg-white border border-border rounded-xl p-5">
        <p className="font-sans text-xs text-dust uppercase tracking-wider mb-3">Upload for health check</p>
        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors mb-3 ${photo?'border-jet bg-card':'border-border hover:border-border-strong'}`}>
          <Camera size={18} className={photo?'text-jet':'text-dust'}/><div><p className="text-sm font-medium text-ink">{photo?photo.name:'Choose a photo'}</p><p className="text-xs text-dust font-sans">Clear, well-lit works best</p></div>
          <input type="file" className="hidden" accept="image/*" onChange={e=>setPhoto(e.target.files[0])}/>
        </label>
        <textarea className="input resize-none mb-3" rows={2} placeholder="Describe symptoms: yellowing, spots, drooping…"
          value={symptoms} onChange={e=>setSymptoms(e.target.value)}/>
        <button onClick={run} disabled={loading||!photo} className="btn-primary w-full py-3 gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analysing…</> : <><Activity size={14}/>Analyse health</>}
        </button>
      </div>

      {check && (
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-xs text-dust uppercase tracking-wider mb-1">{result?'Latest check':'Last check'} · {format(new Date(check.created_at),'PP')}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl text-jet">{check.health_score}</span>
                <span className="text-dust text-lg">/10</span>
              </div>
            </div>
            <HealthBadge urgency={check.urgency} size="lg"/>
          </div>
          <div className="h-1.5 bg-card rounded-full overflow-hidden border border-border">
            <div className={`h-1.5 rounded-full ${check.health_score>=8?'bg-leaf':check.health_score>=5?'bg-gold':'bg-crimson'}`}
              style={{width:`${(check.health_score/10)*100}%`}}/>
          </div>
          {check.diagnosis && <p className="text-sm text-ink font-sans leading-relaxed">{check.diagnosis}</p>}
          {check.recommendations?.length>0 && (
            <ul className="space-y-1.5">
              {check.recommendations.map((r,i)=>(
                <li key={i} className="flex gap-2 text-sm font-sans text-ink"><CheckCircle size={13} className="text-grove mt-0.5 flex-shrink-0"/>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {history.length>1 && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <button onClick={()=>setHistOpen(v=>!v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-card transition-colors text-left">
            <span className="font-display text-lg text-jet">History ({history.length})</span>
            {histOpen?<ChevronUp size={15} className="text-dust"/>:<ChevronDown size={15} className="text-dust"/>}
          </button>
          {histOpen && <div className="px-5 pb-4 space-y-2">
            {history.slice(1).map(h=>(
              <div key={h.id} className="flex items-center gap-3 py-2 border-t border-border">
                <div className={`w-1.5 h-1.5 rounded-full ${h.urgency==='Healthy'?'bg-leaf':h.urgency==='Urgent'?'bg-crimson':'bg-gold'}`}/>
                <div className="flex-1"><p className="text-sm font-medium text-jet">{h.health_score}/10 — {h.urgency}</p><p className="text-xs text-dust">{format(new Date(h.created_at),'PP')}</p></div>
                <HealthBadge urgency={h.urgency}/>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  )
}

function Care({ plant }) {
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(false)
  const tips = Array.isArray(plant.care_tips)?plant.care_tips:[]

  const gen = async () => {
    setLoading(true)
    try { const r=await api.post(`/plants/${plant.id}/propagate`); setGuide(r.data.guide) }
    catch(err) { toast.error(err.response?.data?.error||'Failed') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      {tips.length>0 && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-display text-lg text-jet mb-3">Care tips</h3>
          <ul className="space-y-2.5">{tips.map((t,i)=><li key={i} className="flex gap-3 text-sm font-sans text-ink"><span className="text-grove">✓</span>{t}</li>)}</ul>
        </div>
      )}
      {plant.fun_fact && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-dust uppercase tracking-wider font-sans mb-1">Did you know</p>
          <p className="text-sm text-ink font-sans leading-relaxed">{plant.fun_fact}</p>
        </div>
      )}
      {!guide ? (
        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-xl mx-auto mb-3">✂️</div>
          <h3 className="font-display text-xl text-jet mb-1">Propagation guide</h3>
          <p className="text-sm text-dust font-sans mb-5">AI-generated instructions for {plant.common_name}</p>
          <button onClick={gen} disabled={loading} className="btn-secondary gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-border border-t-ink rounded-full animate-spin"/>Generating…</> : <><Sparkles size={13}/>How to propagate</>}
          </button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <h3 className="font-display text-xl text-jet">Propagation guide</h3>
          <div className="grid grid-cols-3 gap-2">
            {guide.best_season && <Chip icon="📅" label="Best season" value={guide.best_season}/>}
            {guide.time_to_root && <Chip icon="🌱" label="Root time" value={guide.time_to_root}/>}
            {guide.difficulty && <Chip icon="⭐" label="Difficulty" value={guide.difficulty}/>}
          </div>
          {guide.steps?.length>0 && (
            <div className="space-y-4">
              <p className="font-sans text-xs text-dust uppercase tracking-wider">Steps</p>
              {guide.steps.map(s=>(
                <div key={s.step} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-jet text-white text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
                  <div>
                    <p className="text-sm font-medium text-jet">{s.title}</p>
                    <p className="text-sm text-ink font-sans mt-0.5 leading-relaxed">{s.description}</p>
                    {s.tip && <p className="mt-1 text-xs text-grove font-medium">💡 {s.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PlantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plant, setPlant] = useState(null)
  const [photos, setPhotos] = useState([])
  const [latestHealth, setLatestHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try { const r=await api.get(`/plants/${id}`); setPlant(r.data.plant); setPhotos(r.data.photos); setLatestHealth(r.data.latestHealth) }
    catch { toast.error('Plant not found'); navigate('/plants') } finally { setLoading(false) }
  }, [id, navigate])
  useEffect(() => { load() }, [load])

  const addPhoto = async (e) => {
    const files=Array.from(e.target.files); if(!files.length) return
    try { const fd=new FormData(); files.forEach(f=>fd.append('photos',f)); await api.post(`/plants/${id}/photos`,fd); load(); toast.success('Added!') }
    catch { toast.error('Failed') }
  }
  const del = async () => {
    if(!confirm(`Delete ${plant.common_name}?`)) return
    setDeleting(true)
    try { await api.delete(`/plants/${id}`); toast.success('Deleted'); navigate('/plants') }
    catch { toast.error('Failed'); setDeleting(false) }
  }

  if (loading) return <div className="animate-pulse space-y-5 max-w-4xl mx-auto"><div className="h-8 bg-card rounded-lg w-48 border border-border"/><div className="grid md:grid-cols-5 gap-6"><div className="md:col-span-2 aspect-square bg-card rounded-xl border border-border"/><div className="md:col-span-3 space-y-4"><div className="h-12 bg-card rounded-xl border border-border"/><div className="h-8 bg-card rounded-lg w-64 border border-border"/></div></div></div>
  if (!plant) return null

  const TABS = [{ id:'overview',label:'Overview'},{ id:'journal',label:'Journal'},{ id:'health',label:'Health'},{ id:'care',label:'Care'}]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-dust hover:text-ink mb-6 transition-colors">
        <ChevronLeft size={16}/> Back to plants
      </button>

      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-6 mb-8 pb-8 border-b border-border">
        {/* Photo */}
        <div className="md:col-span-2 aspect-square rounded-xl overflow-hidden bg-card border border-border relative group">
          {plant.cover_photo_path
            ? <img src={plant.cover_photo_path} alt={plant.common_name} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">🌿</div>
          }
          <label className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <div className="bg-white/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-jet flex items-center gap-1.5">
              <Plus size={11}/> Add photo
            </div>
            <input type="file" className="hidden" accept="image/*" multiple onChange={addPhoto}/>
          </label>
        </div>

        {/* Info */}
        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            {plant.family && <p className="font-sans text-xs text-dust uppercase tracking-widest mb-2">{plant.family}</p>}
            <h1 className="font-display text-5xl text-jet leading-tight mb-1">{plant.common_name}</h1>
            {plant.scientific_name && <p className="font-sans text-base italic text-dust mb-5">{plant.scientific_name}</p>}
            <div className="flex flex-wrap gap-2 mb-6">
              {plant.room&&plant.room!=='Unassigned' && <span className="badge bg-card border border-border text-ink">📍 {plant.room}</span>}
              {plant.difficulty && <span className="badge bg-card border border-border text-ink">{plant.difficulty}</span>}
              {plant.toxic ? <span className="badge bg-crimson-bg text-crimson border border-crimson/15">⚠️ Toxic</span> : <span className="badge bg-leaf-bg text-grove border border-leaf/20">✓ Pet safe</span>}
              {latestHealth && <HealthBadge urgency={latestHealth.urgency}/>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3"><p className="text-xs text-dust font-sans mb-0.5">Watering</p><p className="text-sm font-medium text-jet">Every {plant.watering_frequency_days} days</p></div>
              <div className="bg-card border border-border rounded-lg p-3"><p className="text-xs text-dust font-sans mb-0.5">Sunlight</p><p className="text-sm font-medium text-jet">{plant.sunlight||'Not set'}</p></div>
            </div>
          </div>
          <div className="flex gap-2 mt-5 flex-wrap">
            <button className="btn-secondary py-2 text-xs gap-1.5">Edit details</button>
            <button onClick={del} disabled={deleting} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-crimson hover:bg-crimson-bg border border-transparent hover:border-crimson/15 transition-colors">
              <Trash2 size={12}/> {deleting?'Deleting…':'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`tab-btn ${tab===t.id?'active':''}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in pb-10" key={tab}>
        {tab==='overview' && <Overview plant={plant} photos={photos} latestHealth={latestHealth} onWatered={load} onRefresh={load}/>}
        {tab==='journal'  && <Journal plantId={plant.id}/>}
        {tab==='health'   && <Health plant={plant} latestHealth={latestHealth} onRefresh={load}/>}
        {tab==='care'     && <Care plant={plant}/>}
      </div>
    </div>
  )
}
