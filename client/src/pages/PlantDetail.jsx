import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Droplets, Sun, Thermometer, Droplet, Star, Skull,
  Zap, Clock, Plus, Camera, Trash2, Sparkles, ChevronDown, ChevronUp, Activity, CheckCircle
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns'
import HealthBadge from '../components/HealthBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

const JOURNAL_ICONS = { manual: '📝', watered: '💧', health_check: '🩺', added: '🌱' }

function StatPill({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 font-sans flex items-center gap-1">{icon} {label}</p>
      <p className="text-sm font-bold text-white font-sans">{value}</p>
    </div>
  )
}

function Overview({ plant, photos, latestHealth, onWatered }) {
  const wateringDue = plant.next_watering_at && isPast(new Date(plant.next_watering_at))
  const daysSince   = plant.last_watered_at ? differenceInDays(new Date(), new Date(plant.last_watered_at)) : null
  const careTips    = Array.isArray(plant.care_tips) ? plant.care_tips : []

  const handleWater = async () => {
    try { await api.post(`/plants/${plant.id}/water`); toast.success('Watered! 💧'); onWatered() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-4">
      {/* Watering status — big actionable card */}
      <div className={`rounded-2xl p-5 flex items-center gap-4 ${wateringDue ? 'border border-ember/25' : 'border border-volt/15'}`}
        style={{ background: wateringDue ? 'rgba(251,146,60,0.06)' : 'rgba(74,222,128,0.04)' }}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${wateringDue ? 'bg-ember/15' : 'bg-volt/10'}`}>💧</div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm font-sans ${wateringDue ? 'text-ember' : 'text-volt'}`}>
            {wateringDue
              ? `Overdue${daysSince && daysSince > plant.watering_frequency_days ? ` — ${daysSince}d since last watered` : ''}`
              : plant.next_watering_at
                ? isToday(new Date(plant.next_watering_at)) ? 'Water today'
                  : `Next watering ${formatDistanceToNow(new Date(plant.next_watering_at), { addSuffix: true })}`
                : 'No watering schedule set'}
          </p>
          {daysSince !== null && <p className="text-xs text-white/30 font-sans mt-0.5">Last watered {daysSince === 0 ? 'today' : `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`}</p>}
        </div>
        <button onClick={handleWater}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${wateringDue ? 'bg-ember text-white hover:bg-ember-dim' : 'bg-volt text-[#070A07] hover:bg-volt-dim'}`}>
          Mark watered
        </button>
      </div>

      {/* Care stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatPill icon={<Sun size={10} />}         label="Sunlight"    value={plant.sunlight} />
        <StatPill icon={<Thermometer size={10} />} label="Temperature" value={plant.temp_min && plant.temp_max ? `${plant.temp_min}–${plant.temp_max}°C` : null} />
        <StatPill icon={<Droplet size={10} />}     label="Humidity"    value={plant.humidity} />
        <StatPill icon={<Zap size={10} />}         label="Growth"      value={plant.growth_rate} />
        <StatPill icon={<Star size={10} />}        label="Difficulty"  value={plant.difficulty} />
        <StatPill icon={<Skull size={10} />}       label="Toxicity"    value={plant.toxic ? '⚠️ Toxic' : '✓ Pet safe'} />
        <StatPill icon={<Clock size={10} />}       label="Lifespan"    value={plant.typical_lifespan} />
        <StatPill icon={<Droplets size={10} />}    label="Watering"    value={`Every ${plant.watering_frequency_days}d`} />
      </div>

      {/* Care tips */}
      {careTips.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#0D130D' }}>
          <h3 className="font-display text-base font-bold text-white mb-3">Care tips</h3>
          <ul className="space-y-2.5">
            {careTips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-white/50">
                <span className="text-volt/80 flex-shrink-0 font-bold">✓</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fun fact */}
      {plant.fun_fact && (
        <div className="rounded-2xl border border-volt/10 p-5 flex gap-4"
          style={{ background: 'rgba(74,222,128,0.03)' }}>
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-volt/60 mb-1 font-sans">Did you know</p>
            <p className="text-sm text-white/50 font-sans leading-relaxed">{plant.fun_fact}</p>
          </div>
        </div>
      )}

      {/* Notes */}
      {plant.notes && (
        <div className="rounded-2xl border border-white/[0.06] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2 font-sans">Notes</p>
          <p className="text-sm text-white/50 font-sans leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
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
    try { const res = await api.get(`/journal/${plantId}`); setEntries(res.data.entries) }
    catch { } finally { setLoading(false) }
  }, [plantId])

  useEffect(() => { load() }, [load])

  const post = async () => {
    if (!content.trim() && !photo) return
    setPosting(true)
    try {
      const fd = new FormData()
      if (content) fd.append('content', content)
      if (photo) fd.append('photo', photo)
      await api.post(`/journal/${plantId}`, fd)
      setContent(''); setPhoto(null); load()
    } catch { toast.error('Failed') } finally { setPosting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#0D130D' }}>
        <textarea className="input resize-none mb-3" rows={3}
          placeholder="Note any changes, milestones, or observations…"
          value={content} onChange={e => setContent(e.target.value)} />
        {photo && (
          <div className="flex items-center gap-2 mb-3 text-xs text-white/40">
            <Camera size={12} />{photo.name}
            <button onClick={() => setPhoto(null)} className="text-ember hover:underline ml-1">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer text-xs font-semibold text-white/30 hover:text-white/60 flex items-center gap-1.5 transition-colors">
            <Camera size={14} /> Photo
            <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
          </label>
          <button onClick={post} disabled={posting || (!content.trim() && !photo)} className="btn-primary ml-auto py-2 text-xs">
            {posting ? 'Adding…' : 'Add entry'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10 text-white/20"><p className="text-3xl mb-2">📖</p><p className="text-sm font-sans">No entries yet</p></div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-surface border border-white/[0.08] flex items-center justify-center text-[11px] flex-shrink-0">{JOURNAL_ICONS[entry.type] || '📝'}</div>
                <div className="flex-1 w-px bg-white/[0.05] my-1" />
              </div>
              <div className="pb-3 flex-1 min-w-0">
                <p className="text-[10px] text-white/25 font-sans mb-1">{format(new Date(entry.created_at), 'PPp')} · <span className="capitalize">{entry.type.replace('_', ' ')}</span></p>
                {entry.content && <p className="text-sm text-white/60 font-sans leading-relaxed">{entry.content}</p>}
                {entry.photo_path && <img src={entry.photo_path} alt="" className="mt-2 rounded-xl w-full max-w-xs object-cover border border-white/[0.06]" />}
              </div>
            </div>
          ))}
        </div>
      )}
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

  const loadHistory = useCallback(async () => {
    try { const res = await api.get(`/plants/${plant.id}/health-checks`); setHistory(res.data.healthChecks) }
    catch { }
  }, [plant.id])

  useEffect(() => { loadHistory() }, [loadHistory])

  const runCheck = async () => {
    if (!photo) { toast.error('Please upload a photo'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('photo', photo)
      if (symptoms) fd.append('symptoms', symptoms)
      const res = await api.post(`/plants/${plant.id}/health-check`, fd)
      setResult(res.data.healthCheck); setPhoto(null); setSymptoms(''); loadHistory(); onRefresh()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const displayCheck = result || latestHealth
  const scoreColor = displayCheck ? (displayCheck.health_score >= 8 ? '#4ADE80' : displayCheck.health_score >= 5 ? '#FCD34D' : '#FB923C') : null

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#0D130D' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3 font-sans">Upload for health check</p>
        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all mb-3 ${photo ? 'border-volt/40 bg-volt/[0.04]' : 'border-white/[0.08] hover:border-volt/20'}`}>
          <Camera size={18} className={photo ? 'text-volt' : 'text-white/25'} />
          <div>
            <p className="text-sm font-bold text-white/60">{photo ? photo.name : 'Choose a photo'}</p>
            <p className="text-xs text-white/25 font-sans">Clear, well-lit works best</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
        </label>
        <textarea className="input resize-none mb-3" rows={2}
          placeholder="Describe symptoms: yellowing, spots, drooping…"
          value={symptoms} onChange={e => setSymptoms(e.target.value)} />
        <button onClick={runCheck} disabled={loading || !photo} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-[#070A07]/25 border-t-[#070A07] rounded-full animate-spin" /> Analysing…</> : <><Activity size={14} /> Analyse health</>}
        </button>
      </div>

      {displayCheck && (
        <div className="rounded-2xl border p-6 space-y-4"
          style={{ borderColor: `${scoreColor}25`, background: `${scoreColor}05` }}>
          {/* Score */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1 font-sans">Health score</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold" style={{ color: scoreColor }}>{displayCheck.health_score}</span>
                <span className="text-white/25 text-lg font-sans">/ 10</span>
              </div>
            </div>
            <HealthBadge urgency={displayCheck.urgency} size="lg" />
          </div>
          {/* Score bar */}
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${(displayCheck.health_score / 10) * 100}%`, background: scoreColor }} />
          </div>
          {displayCheck.diagnosis && (
            <p className="text-sm text-white/50 font-sans leading-relaxed">{displayCheck.diagnosis}</p>
          )}
          {displayCheck.recommendations?.length > 0 && (
            <ul className="space-y-2">
              {displayCheck.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm font-sans text-white/50">
                  <CheckCircle size={13} className="text-volt mt-0.5 flex-shrink-0" />{r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {history.length > 1 && (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#0D130D' }}>
          <button onClick={() => setHistOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
            <span className="font-display text-base font-bold text-white">History ({history.length})</span>
            {histOpen ? <ChevronUp size={15} className="text-white/25" /> : <ChevronDown size={15} className="text-white/25" />}
          </button>
          {histOpen && (
            <div className="px-5 pb-4 space-y-2">
              {history.slice(1).map(h => (
                <div key={h.id} className="flex items-center gap-3 py-2 border-t border-white/[0.04]">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${h.urgency === 'Healthy' ? 'bg-volt' : h.urgency === 'Monitor' ? 'bg-yellow-400' : 'bg-ember'}`} />
                  <div className="flex-1"><p className="text-sm font-bold text-white/60">{h.health_score}/10 — {h.urgency}</p><p className="text-xs text-white/25">{format(new Date(h.created_at), 'PP')}</p></div>
                  <HealthBadge urgency={h.urgency} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CareGuide({ plant }) {
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(false)
  const careTips = Array.isArray(plant.care_tips) ? plant.care_tips : []

  const generate = async () => {
    setLoading(true)
    try { const res = await api.post(`/plants/${plant.id}/propagate`); setGuide(res.data.guide) }
    catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      {careTips.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#0D130D' }}>
          <h3 className="font-display text-base font-bold text-white mb-3">Care tips</h3>
          <ul className="space-y-2.5">
            {careTips.map((tip, i) => (
              <li key={i} className="flex gap-3 font-sans text-sm text-white/50">
                <span className="text-volt font-bold flex-shrink-0">✓</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plant.fun_fact && (
        <div className="rounded-2xl border border-volt/10 p-5"style={{ background: 'rgba(74,222,128,0.03)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-volt/50 mb-2 font-sans">Did you know</p>
          <p className="text-sm text-white/50 font-sans leading-relaxed">{plant.fun_fact}</p>
        </div>
      )}

      {!guide ? (
        <div className="rounded-2xl border border-white/[0.06] p-8 text-center" style={{ background: '#0D130D' }}>
          <div className="w-14 h-14 rounded-2xl bg-volt/10 border border-volt/20 flex items-center justify-center text-2xl mx-auto mb-3">✂️</div>
          <h3 className="font-display text-lg font-bold text-white mb-1">Propagation guide</h3>
          <p className="text-sm text-white/30 font-sans mb-5">Step-by-step AI instructions for {plant.common_name}</p>
          <button onClick={generate} disabled={loading} className="btn-secondary inline-flex items-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/15 border-t-white/50 rounded-full animate-spin" />Generating…</> : <><Sparkles size={13} />How to propagate</>}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-5" style={{ background: '#0D130D' }}>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <h3 className="font-display text-lg font-bold text-white">Propagation guide</h3>
            <div className="flex gap-2 flex-wrap">
              {guide.best_methods?.map(m => <span key={m} className="badge bg-volt/10 text-volt border border-volt/20 text-xs">{m}</span>)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {guide.best_season && <StatPill icon="📅" label="Best season" value={guide.best_season} />}
            {guide.time_to_root && <StatPill icon="🌱" label="Time to root" value={guide.time_to_root} />}
            {guide.difficulty && <StatPill icon="⭐" label="Difficulty" value={guide.difficulty} />}
          </div>
          {guide.steps?.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 font-sans">Steps</p>
              {guide.steps.map(step => (
                <div key={step.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-volt text-[#070A07] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.step}</div>
                  <div>
                    <p className="font-sans text-sm font-bold text-white/80">{step.title}</p>
                    <p className="font-sans text-sm text-white/40 mt-0.5 leading-relaxed">{step.description}</p>
                    {step.tip && <p className="mt-1 text-xs text-volt/60 font-bold">💡 {step.tip}</p>}
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
  const [activeTab, setActiveTab] = useState('overview')
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/plants/${id}`)
      setPlant(res.data.plant); setPhotos(res.data.photos); setLatestHealth(res.data.latestHealth)
    } catch { toast.error('Plant not found'); navigate('/plants') }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!confirm(`Delete ${plant.common_name}? This cannot be undone.`)) return
    setDeleting(true)
    try { await api.delete(`/plants/${id}`); toast.success('Deleted'); navigate('/plants') }
    catch { toast.error('Failed'); setDeleting(false) }
  }

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('photos', f))
      await api.post(`/plants/${id}/photos`, fd)
      load(); toast.success('Photo added!')
    } catch { toast.error('Failed') }
  }

  if (loading) return (
    <div className="animate-pulse max-w-4xl mx-auto space-y-4">
      <div className="h-[45vh] bg-surface rounded-none" />
      <div className="h-8 bg-surface rounded-xl w-64 px-4" />
    </div>
  )
  if (!plant) return null

  const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'journal', label: 'Journal' }, { id: 'health', label: 'Health' }, { id: 'care', label: 'Care' }]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── Cinematic hero ── */}
      <div className="relative" style={{ height: '45vh', minHeight: 320, maxHeight: 500 }}>
        {/* Background image */}
        {plant.cover_photo_path ? (
          <img src={plant.cover_photo_path} alt={plant.common_name}
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0F1A0F,#070A07)' }}>
            <span className="text-9xl opacity-5">🌿</span>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(7,10,7,0.5) 0%, rgba(7,10,7,0.0) 30%, rgba(7,10,7,0.85) 80%, #070A07 100%)' }} />

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 transition-colors z-10">
          <ChevronLeft size={15} /> Back
        </button>

        {/* Add photo button */}
        <label className="absolute top-6 right-4 sm:right-6 lg:right-8 cursor-pointer bg-black/30 backdrop-blur-sm text-white/60 hover:text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25 transition-colors z-10 flex items-center gap-1.5">
          <Camera size={12} /> Add photo
          <input type="file" className="hidden" accept="image/*" multiple onChange={handleAddPhoto} />
        </label>

        {/* Plant info at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6 z-10">
          {plant.family && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-volt/70 mb-1 font-sans">{plant.family}</p>
          )}
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-2">
            {plant.common_name}
          </h1>
          {plant.scientific_name && (
            <p className="font-sans text-base italic text-white/40 mb-3">{plant.scientific_name}</p>
          )}
          {/* Inline badges */}
          <div className="flex flex-wrap items-center gap-2">
            {plant.room && plant.room !== 'Unassigned' && (
              <span className="text-xs font-bold text-white/50 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">📍 {plant.room}</span>
            )}
            {plant.toxic
              ? <span className="text-xs font-bold text-ember bg-ember/20 backdrop-blur-sm px-3 py-1 rounded-full border border-ember/25">⚠️ Toxic</span>
              : <span className="text-xs font-bold text-volt bg-volt/15 backdrop-blur-sm px-3 py-1 rounded-full border border-volt/25">✓ Pet safe</span>
            }
            {latestHealth && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border
                ${latestHealth.urgency === 'Healthy' ? 'text-volt bg-volt/15 border-volt/25'
                  : latestHealth.urgency === 'Urgent' ? 'text-ember bg-ember/20 border-ember/25'
                  : 'text-yellow-300 bg-yellow-400/15 border-yellow-400/25'}`}>
                ♥ {latestHealth.health_score}/10
              </span>
            )}
            <button onClick={handleDelete} disabled={deleting}
              className="text-xs font-bold text-white/30 bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 hover:text-ember hover:bg-ember/10 hover:border-ember/20 transition-colors flex items-center gap-1">
              <Trash2 size={10} /> {deleting ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content below hero ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl border border-white/[0.06] mb-6 w-full sm:w-auto sm:inline-flex"
          style={{ background: '#0D130D' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`tab-btn flex-1 sm:flex-none py-2 px-5 ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in pb-12" key={activeTab}>
          {activeTab === 'overview' && <Overview plant={plant} photos={photos} latestHealth={latestHealth} onWatered={load} onRefresh={load} />}
          {activeTab === 'journal'  && <Journal plantId={plant.id} />}
          {activeTab === 'health'   && <Health plant={plant} latestHealth={latestHealth} onRefresh={load} />}
          {activeTab === 'care'     && <CareGuide plant={plant} />}
        </div>
      </div>
    </div>
  )
}
