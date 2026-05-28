import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, Droplets, Sun, Thermometer, Droplet, Star, Skull,
  Zap, Clock, Plus, Camera, Trash2, Sparkles, ChevronDown, ChevronUp, Activity, CheckCircle
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns'
import HealthBadge from '../components/HealthBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

const URGENCY_BORDER = { Healthy: 'border-volt/20', Monitor: 'border-yellow-400/20', Urgent: 'border-ember/20' }
const JOURNAL_ICONS = { manual: '📝', watered: '💧', health_check: '🩺', added: '🌱' }

function InfoChip({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1 p-3 bg-raised rounded-xl border border-white/[0.04]">
      <div className="flex items-center gap-1.5 text-xs text-white/30 font-medium">{icon} {label}</div>
      <p className="text-sm font-semibold text-white/80 font-sans">{value}</p>
    </div>
  )
}

function Overview({ plant, photos, latestHealth, onWatered }) {
  const wateringDue = plant.next_watering_at && isPast(new Date(plant.next_watering_at))
  const daysSince = plant.last_watered_at ? differenceInDays(new Date(), new Date(plant.last_watered_at)) : null
  const careTips = Array.isArray(plant.care_tips) ? plant.care_tips : []

  const handleWater = async () => {
    try { await api.post(`/plants/${plant.id}/water`); toast.success('Watered! 💧'); onWatered() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${wateringDue ? 'border-ember/20 bg-ember/[0.05]' : 'border-volt/15 bg-volt/[0.04]'}`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${wateringDue ? 'bg-ember/10' : 'bg-volt/10'}`}>💧</div>
        <div className="flex-1">
          <p className={`font-sans text-sm font-bold ${wateringDue ? 'text-ember' : 'text-volt'}`}>
            {wateringDue ? `Overdue${daysSince > plant.watering_frequency_days ? ` — ${daysSince} days since last watered` : ''}` :
              plant.next_watering_at ? isToday(new Date(plant.next_watering_at)) ? 'Water today' :
              `Next watering ${formatDistanceToNow(new Date(plant.next_watering_at), { addSuffix: true })}` : 'No schedule set'}
          </p>
          {daysSince !== null && <p className="text-xs text-white/30 mt-0.5">Last watered {daysSince === 0 ? 'today' : `${daysSince}d ago`}</p>}
        </div>
        <button onClick={handleWater} className={`${wateringDue ? 'btn-terra' : 'btn-primary'} py-2 text-xs`}>Mark watered</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoChip icon={<Sun size={12} />} label="Sunlight" value={plant.sunlight} />
        <InfoChip icon={<Thermometer size={12} />} label="Temperature" value={plant.temp_min && plant.temp_max ? `${plant.temp_min}–${plant.temp_max}°C` : null} />
        <InfoChip icon={<Droplet size={12} />} label="Humidity" value={plant.humidity} />
        <InfoChip icon={<Star size={12} />} label="Difficulty" value={plant.difficulty} />
        <InfoChip icon={<Skull size={12} />} label="Toxicity" value={plant.toxic ? '⚠️ Toxic' : '✓ Pet safe'} />
        <InfoChip icon={<Zap size={12} />} label="Growth rate" value={plant.growth_rate} />
        <InfoChip icon={<Clock size={12} />} label="Lifespan" value={plant.typical_lifespan} />
        <InfoChip icon={<Droplets size={12} />} label="Watering" value={`Every ${plant.watering_frequency_days}d`} />
      </div>

      {careTips.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4">Care tips</h3>
          <ul className="space-y-3">
            {careTips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-white/50">
                <span className="text-volt mt-0.5 flex-shrink-0">✓</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plant.fun_fact && (
        <div className="rounded-2xl border border-volt/15 p-5" style={{ background: 'rgba(74,222,128,0.04)' }}>
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-display text-base font-bold text-white mb-1">Did you know?</h4>
              <p className="text-sm text-white/50 font-sans leading-relaxed">{plant.fun_fact}</p>
            </div>
          </div>
        </div>
      )}

      {plant.notes && (
        <div className="card">
          <h3 className="section-title mb-3">Notes</h3>
          <p className="text-sm text-white/50 font-sans leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
        </div>
      )}

      {photos.length > 1 && (
        <div className="card">
          <h3 className="section-title mb-4">Photo gallery</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map(p => (
              <div key={p.id} className="aspect-square rounded-xl overflow-hidden border border-white/[0.06]">
                <img src={p.file_path} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
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
    } catch { toast.error('Failed to add entry') } finally { setPosting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="section-title mb-4">Add entry</h3>
        <textarea className="input resize-none mb-3" rows={3}
          placeholder="How is your plant doing today? Note any changes or milestones…"
          value={content} onChange={e => setContent(e.target.value)} />
        {photo && (
          <div className="flex items-center gap-2 mb-3 text-sm text-white/40">
            <Camera size={13} /><span>{photo.name}</span>
            <button onClick={() => setPhoto(null)} className="text-ember hover:underline text-xs">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors">
            <Camera size={15} /> Add photo
            <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
          </label>
          <button onClick={post} disabled={posting || (!content.trim() && !photo)}
            className="btn-primary ml-auto py-2 text-sm">
            {posting ? 'Adding…' : 'Add entry'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-white/25"><p className="text-3xl mb-2">📖</p><p className="font-sans text-sm">No entries yet</p></div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.05]" />
          <div className="space-y-3 pl-14">
            {entries.map(entry => (
              <div key={entry.id} className="relative">
                <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-surface border border-white/10 flex items-center justify-center text-[9px]">
                  {JOURNAL_ICONS[entry.type] || '📝'}
                </div>
                <div className="card py-3 px-4">
                  <p className="text-xs text-white/25 font-sans mb-1.5">
                    {format(new Date(entry.created_at), 'PPpp')} · <span className="capitalize">{entry.type.replace('_', ' ')}</span>
                  </p>
                  {entry.content && <p className="text-sm text-white/60 font-sans leading-relaxed">{entry.content}</p>}
                  {entry.photo_path && <img src={entry.photo_path} alt="" className="mt-2 rounded-lg w-full max-w-xs object-cover" />}
                </div>
              </div>
            ))}
          </div>
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
    } catch (err) { toast.error(err.response?.data?.error || 'Health check failed') }
    finally { setLoading(false) }
  }

  const displayCheck = result || latestHealth

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="section-title mb-4">Run a health check</h3>
        <p className="text-sm text-white/40 font-sans mb-4">Upload a clear photo and Claude will diagnose any issues.</p>
        <div className="space-y-3">
          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${photo ? 'border-volt/40 bg-volt/[0.04]' : 'border-white/10 hover:border-volt/20'}`}>
            <Camera size={19} className={photo ? 'text-volt' : 'text-white/30'} />
            <div>
              <p className="text-sm font-semibold text-white/60">{photo ? photo.name : 'Choose a photo'}</p>
              <p className="text-xs text-white/25">Clear, well-lit photo works best</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
          </label>
          <textarea className="input resize-none" rows={2}
            placeholder="Describe symptoms (optional): yellowing, spots, drooping…"
            value={symptoms} onChange={e => setSymptoms(e.target.value)} />
          <button onClick={runCheck} disabled={loading || !photo} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-[#070A07]/30 border-t-[#070A07] rounded-full animate-spin" /> Analysing…</> : <><Activity size={15} /> Analyse health</>}
          </button>
        </div>
      </div>

      {displayCheck && (
        <div className={`card border ${URGENCY_BORDER[displayCheck.urgency] || 'border-white/[0.06]'} space-y-4`}
          style={displayCheck.urgency === 'Healthy' ? { background: 'rgba(74,222,128,0.03)' } :
                 displayCheck.urgency === 'Urgent'  ? { background: 'rgba(251,146,60,0.03)' } :
                 { background: 'rgba(252,211,77,0.03)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="section-title">Health report</h3>
                {result && <span className="badge bg-volt/10 text-volt border border-volt/20 text-xs">Latest</span>}
              </div>
              <p className="text-xs text-white/25">{format(new Date(displayCheck.created_at), 'PPp')}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-4xl font-bold text-white">{displayCheck.health_score}</p>
              <p className="text-xs text-white/30">/ 10</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <HealthBadge urgency={displayCheck.urgency} size="lg" />
            {displayCheck.overall_status && <span className="badge bg-white/5 text-white/40 border border-white/10">{displayCheck.overall_status}</span>}
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full transition-all ${displayCheck.health_score >= 8 ? 'bg-volt' : displayCheck.health_score >= 5 ? 'bg-yellow-400' : 'bg-ember'}`}
              style={{ width: `${(displayCheck.health_score / 10) * 100}%` }} />
          </div>
          {displayCheck.diagnosis && (
            <div>
              <h4 className="font-sans text-xs font-bold text-white/30 uppercase tracking-wider mb-2">Diagnosis</h4>
              <p className="text-sm text-white/50 font-sans leading-relaxed">{displayCheck.diagnosis}</p>
            </div>
          )}
          {displayCheck.recommendations?.length > 0 && (
            <div>
              <h4 className="font-sans text-xs font-bold text-white/30 uppercase tracking-wider mb-2">Recommendations</h4>
              <ul className="space-y-1.5">
                {displayCheck.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm font-sans text-white/50">
                    <CheckCircle size={13} className="text-volt mt-0.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {history.length > 1 && (
        <div className="card">
          <button onClick={() => setHistOpen(v => !v)} className="w-full flex items-center justify-between text-left">
            <h3 className="section-title">Check history ({history.length})</h3>
            {histOpen ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
          </button>
          {histOpen && (
            <div className="mt-4 space-y-2">
              {history.slice(1).map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-raised rounded-xl border border-white/[0.04]">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.urgency === 'Healthy' ? 'bg-volt' : h.urgency === 'Monitor' ? 'bg-yellow-400' : 'bg-ember'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white/70">{h.health_score}/10 — {h.urgency}</p>
                    <p className="text-xs text-white/25">{format(new Date(h.created_at), 'PP')}</p>
                  </div>
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
    <div className="space-y-5">
      {careTips.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4">Care tips</h3>
          <ul className="space-y-3">
            {careTips.map((tip, i) => (
              <li key={i} className="flex gap-3 font-sans text-sm text-white/50">
                <span className="text-volt flex-shrink-0 mt-0.5">✓</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plant.fun_fact && (
        <div className="rounded-2xl border border-volt/15 p-5" style={{ background: 'rgba(74,222,128,0.04)' }}>
          <div className="flex gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="font-display text-base font-bold text-white mb-1">Did you know?</h4>
              <p className="text-sm text-white/50 font-sans leading-relaxed">{plant.fun_fact}</p>
            </div>
          </div>
        </div>
      )}

      {!guide ? (
        <div className="card text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-volt/10 border border-volt/20 flex items-center justify-center text-2xl mx-auto mb-3">✂️</div>
          <h3 className="section-title mb-2">Propagation guide</h3>
          <p className="text-sm text-white/30 font-sans mb-5">AI-generated step-by-step instructions for {plant.common_name}</p>
          <button onClick={generate} disabled={loading} className="btn-secondary inline-flex items-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />Generating…</> : <><Sparkles size={14} />How to propagate</>}
          </button>
        </div>
      ) : (
        <div className="card space-y-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <h3 className="section-title">Propagation guide</h3>
            <div className="flex gap-2 flex-wrap">
              {guide.best_methods?.map(m => <span key={m} className="badge bg-volt/10 text-volt border border-volt/20">{m}</span>)}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {guide.best_season && <InfoChip icon="📅" label="Best season" value={guide.best_season} />}
            {guide.time_to_root && <InfoChip icon="🌱" label="Time to root" value={guide.time_to_root} />}
            {guide.difficulty && <InfoChip icon="⭐" label="Difficulty" value={guide.difficulty} />}
          </div>
          {guide.steps?.length > 0 && (
            <div>
              <h4 className="font-sans text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Steps</h4>
              <div className="space-y-4">
                {guide.steps.map(step => (
                  <div key={step.step} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-volt text-[#070A07] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.step}</div>
                    <div>
                      <p className="font-sans text-sm font-bold text-white/80">{step.title}</p>
                      <p className="font-sans text-sm text-white/40 mt-0.5 leading-relaxed">{step.description}</p>
                      {step.tip && <p className="mt-1 text-xs text-volt/70 font-semibold">💡 {step.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>
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
  const [addingPhoto, setAddingPhoto] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/plants/${id}`)
      setPlant(res.data.plant); setPhotos(res.data.photos); setLatestHealth(res.data.latestHealth)
    } catch { toast.error('Plant not found'); navigate('/plants') }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setAddingPhoto(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('photos', f))
      await api.post(`/plants/${id}/photos`, fd)
      load(); toast.success('Photos added!')
    } catch { toast.error('Failed') } finally { setAddingPhoto(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${plant.common_name}? This cannot be undone.`)) return
    setDeleting(true)
    try { await api.delete(`/plants/${id}`); toast.success('Plant deleted'); navigate('/plants') }
    catch { toast.error('Failed'); setDeleting(false) }
  }

  if (loading) return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
      <div className="h-8 bg-surface rounded-xl w-48" />
      <div className="h-72 bg-surface rounded-2xl" />
    </div>
  )

  if (!plant) return null

  const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'journal', label: 'Journal' }, { id: 'health', label: 'Health' }, { id: 'care', label: 'Care Guide' }]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 mb-6 transition-colors">
        <ChevronLeft size={17} /> Back
      </button>

      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="md:col-span-2 aspect-[3/4] md:aspect-auto rounded-2xl overflow-hidden bg-surface relative group border border-white/[0.06]">
          {plant.cover_photo_path ? (
            <img src={plant.cover_photo_path} alt={plant.common_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">🌿</div>
          )}
          <label className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <div className="bg-void/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
              {addingPhoto ? '…' : <><Plus size={11} /> Add photo</>}
            </div>
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleAddPhoto} />
          </label>
        </div>

        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            {plant.family && <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-1 font-sans">{plant.family}</p>}
            <h1 className="font-display text-4xl font-bold text-white leading-tight mb-1">{plant.common_name}</h1>
            {plant.scientific_name && <p className="font-sans text-base italic text-white/30 mb-4">{plant.scientific_name}</p>}
            <div className="flex flex-wrap gap-2 mb-6">
              {plant.room && plant.room !== 'Unassigned' && <span className="badge bg-white/5 text-white/50 border border-white/10">📍 {plant.room}</span>}
              {plant.difficulty && <span className="badge bg-white/5 text-white/40 border border-white/10">{plant.difficulty}</span>}
              {plant.toxic ? <span className="badge bg-ember/10 text-ember border border-ember/20">⚠️ Toxic</span> : <span className="badge bg-volt/10 text-volt border border-volt/20">✓ Pet safe</span>}
              {latestHealth && <HealthBadge urgency={latestHealth.urgency} />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface border border-white/[0.05] rounded-xl">
                <p className="text-xs text-white/25 font-sans mb-0.5">Watering</p>
                <p className="text-sm font-bold text-white">Every {plant.watering_frequency_days}d</p>
              </div>
              <div className="p-3 bg-surface border border-white/[0.05] rounded-xl">
                <p className="text-xs text-white/25 font-sans mb-0.5">Sunlight</p>
                <p className="text-sm font-bold text-white">{plant.sunlight || 'Not set'}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-5 flex-wrap">
            <button className="btn-secondary py-2 text-sm">Edit details</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-ember hover:bg-ember/10 transition-colors border border-transparent hover:border-ember/20">
              <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-white/[0.06] rounded-xl p-1 mb-6">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`tab-btn flex-1 py-2 ${activeTab === tab.id ? 'active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'overview' && <Overview plant={plant} photos={photos} latestHealth={latestHealth} onWatered={load} onRefresh={load} />}
        {activeTab === 'journal'  && <Journal plantId={plant.id} />}
        {activeTab === 'health'   && <Health plant={plant} latestHealth={latestHealth} onRefresh={load} />}
        {activeTab === 'care'     && <CareGuide plant={plant} />}
      </div>
    </div>
  )
}
