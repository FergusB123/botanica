import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, Droplets, Sun, Thermometer, Droplet, Star, Skull,
  Zap, Clock, Plus, Camera, Trash2, Sparkles, ChevronDown, ChevronUp,
  Leaf, AlertCircle, CheckCircle, Activity
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isToday, differenceInDays } from 'date-fns'
import HealthBadge from '../components/HealthBadge'
import api from '../api/client'
import toast from 'react-hot-toast'

// ── Helpers ────────────────────────────────────────────────────────────────
const URGENCY_COLORS = { Healthy: 'bg-sage-50 border-sage-200', Monitor: 'bg-amber-50 border-amber-200', Urgent: 'bg-terra-50 border-terra-200' }
const JOURNAL_ICONS = { manual: '📝', watered: '💧', health_check: '🩺', added: '🌱' }

function InfoChip({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1 p-3 bg-stone-50 rounded-xl">
      <div className="flex items-center gap-1.5 text-xs text-bark/50 font-medium">
        {icon} {label}
      </div>
      <p className="text-sm font-medium text-bark font-sans">{value}</p>
    </div>
  )
}

// ── Overview tab ────────────────────────────────────────────────────────────
function Overview({ plant, photos, latestHealth, onWatered, onRefresh }) {
  const wateringDue = plant.next_watering_at && isPast(new Date(plant.next_watering_at))
  const daysSince = plant.last_watered_at
    ? differenceInDays(new Date(), new Date(plant.last_watered_at))
    : null

  const handleWater = async () => {
    try {
      await api.post(`/plants/${plant.id}/water`)
      toast.success(`${plant.common_name} watered! 💧`)
      onWatered()
    } catch { toast.error('Failed to update') }
  }

  const careTips = Array.isArray(plant.care_tips) ? plant.care_tips : []

  return (
    <div className="space-y-6">
      {/* Watering status */}
      <div className={`card flex items-center gap-4 ${wateringDue ? 'border-terra-200 bg-terra-50' : 'border-sage-100 bg-sage-50'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${wateringDue ? 'bg-terra-100' : 'bg-sage-100'}`}>
          💧
        </div>
        <div className="flex-1">
          <p className={`font-sans text-sm font-semibold ${wateringDue ? 'text-terra-700' : 'text-sage-700'}`}>
            {wateringDue
              ? `Overdue${daysSince > plant.watering_frequency_days ? ` — ${daysSince} days since last watered` : ''}`
              : plant.next_watering_at
                ? isToday(new Date(plant.next_watering_at))
                  ? 'Water today'
                  : `Next watering ${formatDistanceToNow(new Date(plant.next_watering_at), { addSuffix: true })}`
                : 'No watering schedule set'
            }
          </p>
          {daysSince !== null && <p className="text-xs text-bark/50 mt-0.5">Last watered {daysSince === 0 ? 'today' : `${daysSince}d ago`}</p>}
        </div>
        <button onClick={handleWater} className={`btn-primary py-2 text-xs ${wateringDue ? 'bg-terra hover:bg-terra-600' : ''}`}>
          Mark watered
        </button>
      </div>

      {/* Care details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <InfoChip icon={<Sun size={13} />} label="Sunlight" value={plant.sunlight} />
        <InfoChip icon={<Thermometer size={13} />} label="Temperature"
          value={plant.temp_min && plant.temp_max ? `${plant.temp_min}–${plant.temp_max}°C` : null} />
        <InfoChip icon={<Droplet size={13} />} label="Humidity" value={plant.humidity} />
        <InfoChip icon={<Star size={13} />} label="Difficulty" value={plant.difficulty} />
        <InfoChip icon={<Skull size={13} />} label="Toxicity" value={plant.toxic ? '⚠️ Toxic' : '✓ Pet safe'} />
        <InfoChip icon={<Zap size={13} />} label="Growth rate" value={plant.growth_rate} />
        <InfoChip icon={<Clock size={13} />} label="Lifespan" value={plant.typical_lifespan} />
        <InfoChip icon={<Droplets size={13} />} label="Watering" value={`Every ${plant.watering_frequency_days}d`} />
      </div>

      {/* Care tips */}
      {careTips.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4">Care tips</h3>
          <ul className="space-y-3">
            {careTips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-bark/80">
                <span className="text-sage mt-0.5 flex-shrink-0">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fun fact */}
      {plant.fun_fact && (
        <div className="card bg-forest-50 border-forest-100">
          <p className="text-2xl mb-2">💡</p>
          <h4 className="font-serif text-lg font-semibold mb-1">Did you know?</h4>
          <p className="text-sm text-bark/70 font-sans leading-relaxed">{plant.fun_fact}</p>
        </div>
      )}

      {/* Personal notes */}
      {plant.notes && (
        <div className="card">
          <h3 className="section-title mb-3">Notes</h3>
          <p className="text-sm text-bark/70 font-sans leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
        </div>
      )}

      {/* Photo gallery */}
      {photos.length > 1 && (
        <div className="card">
          <h3 className="section-title mb-4">Photo gallery</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map(p => (
              <div key={p.id} className="aspect-square rounded-xl overflow-hidden">
                <img src={p.file_path} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Journal tab ─────────────────────────────────────────────────────────────
function Journal({ plantId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [photo, setPhoto] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/journal/${plantId}`)
      setEntries(res.data.entries)
    } catch { /* silent */ }
    finally { setLoading(false) }
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
      setContent('')
      setPhoto(null)
      load()
    } catch { toast.error('Failed to add entry') }
    finally { setPosting(false) }
  }

  return (
    <div className="space-y-5">
      {/* Add entry */}
      <div className="card">
        <h3 className="section-title mb-4">Add journal entry</h3>
        <textarea
          className="input resize-none mb-3"
          rows={3}
          placeholder="How is your plant doing today? Note any changes, milestones, or observations…"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        {photo && (
          <div className="flex items-center gap-2 mb-3 text-sm text-bark/60">
            <Camera size={14} />
            <span>{photo.name}</span>
            <button onClick={() => setPhoto(null)} className="text-terra hover:underline">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 text-sm text-bark/60 hover:text-bark transition-colors">
            <Camera size={16} />
            Add photo
            <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
          </label>
          <button onClick={post} disabled={posting || (!content.trim() && !photo)} className="btn-primary ml-auto py-2 text-sm">
            {posting ? 'Adding…' : 'Add entry'}
          </button>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-bark/40">
          <p className="text-3xl mb-2">📖</p>
          <p className="font-sans text-sm">No journal entries yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-stone-100" />
          <div className="space-y-4 pl-14">
            {entries.map(entry => (
              <div key={entry.id} className="relative">
                <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center text-[10px]">
                  {JOURNAL_ICONS[entry.type] || '📝'}
                </div>
                <div className="card py-3 px-4">
                  <p className="text-xs text-bark/40 font-sans mb-1.5">
                    {format(new Date(entry.created_at), 'PPpp')}
                    {' · '}
                    <span className="capitalize">{entry.type.replace('_', ' ')}</span>
                  </p>
                  {entry.content && <p className="text-sm text-bark/80 font-sans leading-relaxed">{entry.content}</p>}
                  {entry.photo_path && (
                    <img src={entry.photo_path} alt="" className="mt-2 rounded-lg w-full max-w-xs object-cover" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Health tab ───────────────────────────────────────────────────────────────
function Health({ plant, latestHealth, onRefresh }) {
  const [photo, setPhoto] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [histOpen, setHistOpen] = useState(false)

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get(`/plants/${plant.id}/health-checks`)
      setHistory(res.data.healthChecks)
    } catch { /* silent */ }
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
      setResult(res.data.healthCheck)
      setPhoto(null)
      setSymptoms('')
      loadHistory()
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Health check failed')
    } finally {
      setLoading(false)
    }
  }

  const displayCheck = result || latestHealth

  return (
    <div className="space-y-5">
      {/* Upload panel */}
      <div className="card">
        <h3 className="section-title mb-4">Run a health check</h3>
        <p className="text-sm text-bark/60 font-sans mb-4">Upload a clear photo of your {plant.common_name} and Claude will diagnose any issues.</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${photo ? 'border-forest bg-forest-50' : 'border-stone-200 hover:border-forest/40'}`}>
              <Camera size={20} className={photo ? 'text-forest' : 'text-bark/40'} />
              <div>
                <p className="text-sm font-medium text-bark/70">{photo ? photo.name : 'Choose a photo'}</p>
                <p className="text-xs text-bark/40">Clear, well-lit photo works best</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
            </label>
            {photo && <button onClick={() => setPhoto(null)} className="text-terra hover:underline text-sm">Remove</button>}
          </div>

          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Describe any symptoms (optional): yellowing leaves, spots, drooping…"
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
          />

          <button onClick={runCheck} disabled={loading || !photo} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing…
              </>
            ) : (
              <><Activity size={16} /> Analyse health</>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {displayCheck && (
        <div className={`card border ${URGENCY_COLORS[displayCheck.urgency] || 'bg-stone-50'} space-y-4`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="section-title">Health report</h3>
                {result && <span className="badge bg-forest text-white text-xs">Latest</span>}
              </div>
              <p className="text-xs text-bark/50">{format(new Date(displayCheck.created_at), 'PPp')}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-4xl font-bold text-bark">{displayCheck.health_score}</p>
              <p className="text-xs text-bark/50">/ 10</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <HealthBadge urgency={displayCheck.urgency} size="lg" />
            {displayCheck.overall_status && (
              <span className="badge bg-stone-100 text-bark/60">{displayCheck.overall_status}</span>
            )}
          </div>

          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${displayCheck.health_score >= 8 ? 'bg-sage' : displayCheck.health_score >= 5 ? 'bg-amber-400' : 'bg-terra'}`}
              style={{ width: `${(displayCheck.health_score / 10) * 100}%` }}
            />
          </div>

          {displayCheck.diagnosis && (
            <div>
              <h4 className="font-sans text-sm font-semibold text-bark/70 mb-1.5">Diagnosis</h4>
              <p className="text-sm text-bark/70 font-sans leading-relaxed">{displayCheck.diagnosis}</p>
            </div>
          )}

          {displayCheck.recommendations?.length > 0 && (
            <div>
              <h4 className="font-sans text-sm font-semibold text-bark/70 mb-2">Recommendations</h4>
              <ul className="space-y-1.5">
                {displayCheck.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm font-sans text-bark/70">
                    <CheckCircle size={14} className="text-sage mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {displayCheck.positive_signs?.length > 0 && (
            <div>
              <h4 className="font-sans text-sm font-semibold text-bark/70 mb-2">Positive signs</h4>
              <div className="flex flex-wrap gap-2">
                {displayCheck.positive_signs.map((s, i) => (
                  <span key={i} className="badge bg-sage-50 text-sage-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="card">
          <button onClick={() => setHistOpen(v => !v)} className="w-full flex items-center justify-between text-left">
            <h3 className="section-title">Check history ({history.length})</h3>
            {histOpen ? <ChevronUp size={18} className="text-bark/50" /> : <ChevronDown size={18} className="text-bark/50" />}
          </button>
          {histOpen && (
            <div className="mt-4 space-y-2">
              {history.slice(1).map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.urgency === 'Healthy' ? 'bg-sage' : h.urgency === 'Monitor' ? 'bg-amber-400' : 'bg-terra'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bark">{h.health_score}/10 — {h.urgency}</p>
                    <p className="text-xs text-bark/40">{format(new Date(h.created_at), 'PP')}</p>
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

// ── Care Guide / Propagation ─────────────────────────────────────────────────
function CareGuide({ plant }) {
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/plants/${plant.id}/propagate`)
      setGuide(res.data.guide)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate guide')
    } finally {
      setLoading(false)
    }
  }

  const careTips = Array.isArray(plant.care_tips) ? plant.care_tips : []

  return (
    <div className="space-y-5">
      {/* Care tips */}
      {careTips.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-4">Care tips</h3>
          <ul className="space-y-3">
            {careTips.map((tip, i) => (
              <li key={i} className="flex gap-3 font-sans text-sm text-bark/80">
                <span className="text-sage flex-shrink-0 mt-0.5">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fun fact */}
      {plant.fun_fact && (
        <div className="card bg-sage-50 border-sage-100">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-serif text-lg font-semibold mb-1">Did you know?</h4>
              <p className="text-sm text-bark/70 font-sans leading-relaxed">{plant.fun_fact}</p>
            </div>
          </div>
        </div>
      )}

      {/* Propagation */}
      {!guide ? (
        <div className="card text-center py-8">
          <p className="text-4xl mb-3">✂️</p>
          <h3 className="section-title mb-2">Propagation guide</h3>
          <p className="text-sm text-bark/50 font-sans mb-5">Get AI-generated step-by-step instructions to propagate your {plant.common_name}</p>
          <button onClick={generate} disabled={loading} className="btn-secondary inline-flex items-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" /> Generating…</>
            ) : (
              <><Sparkles size={15} /> How to propagate</>
            )}
          </button>
        </div>
      ) : (
        <div className="card space-y-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <h3 className="section-title">Propagation guide</h3>
            <div className="flex gap-2 flex-wrap">
              {guide.best_methods?.map(m => <span key={m} className="badge bg-forest-50 text-forest">{m}</span>)}
              {guide.difficulty && <span className="badge bg-stone-100 text-bark/60">{guide.difficulty}</span>}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {guide.best_season && <InfoChip icon="📅" label="Best season" value={guide.best_season} />}
            {guide.time_to_root && <InfoChip icon="🌱" label="Time to root" value={guide.time_to_root} />}
            {guide.difficulty && <InfoChip icon="⭐" label="Difficulty" value={guide.difficulty} />}
          </div>

          {guide.supplies_needed?.length > 0 && (
            <div>
              <h4 className="font-sans text-sm font-semibold text-bark/70 mb-2">You'll need</h4>
              <div className="flex flex-wrap gap-2">
                {guide.supplies_needed.map((s, i) => <span key={i} className="badge bg-stone-100 text-bark/60">{s}</span>)}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-sans text-sm font-semibold text-bark/70 mb-3">Steps</h4>
            <div className="space-y-3">
              {guide.steps?.map(step => (
                <div key={step.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.step}
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-bark">{step.title}</p>
                    <p className="font-sans text-sm text-bark/70 mt-0.5 leading-relaxed">{step.description}</p>
                    {step.tip && (
                      <p className="mt-1 text-xs text-terra font-medium">💡 {step.tip}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {guide.success_tips?.length > 0 && (
            <div className="bg-sage-50 rounded-xl p-4">
              <h4 className="font-sans text-sm font-semibold text-sage-700 mb-2">Success tips</h4>
              <ul className="space-y-1.5">
                {guide.success_tips.map((t, i) => <li key={i} className="text-sm text-bark/70 font-sans flex gap-2"><span>✓</span>{t}</li>)}
              </ul>
            </div>
          )}

          {guide.common_mistakes?.length > 0 && (
            <div className="bg-terra-50 rounded-xl p-4">
              <h4 className="font-sans text-sm font-semibold text-terra-700 mb-2">Common mistakes to avoid</h4>
              <ul className="space-y-1.5">
                {guide.common_mistakes.map((m, i) => <li key={i} className="text-sm text-bark/70 font-sans flex gap-2"><span>⚠</span>{m}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
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
      setPlant(res.data.plant)
      setPhotos(res.data.photos)
      setLatestHealth(res.data.latestHealth)
    } catch {
      toast.error('Plant not found')
      navigate('/plants')
    } finally {
      setLoading(false)
    }
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
      load()
      toast.success('Photos added!')
    } catch { toast.error('Failed to add photos') }
    finally { setAddingPhoto(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${plant.common_name}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.delete(`/plants/${id}`)
      toast.success('Plant deleted')
      navigate('/plants')
    } catch { toast.error('Failed to delete'); setDeleting(false) }
  }

  if (loading) return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
      <div className="h-8 bg-stone-100 rounded-xl w-48" />
      <div className="h-64 bg-stone-100 rounded-2xl" />
    </div>
  )

  if (!plant) return null

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'journal', label: 'Journal' },
    { id: 'health', label: 'Health' },
    { id: 'care', label: 'Care Guide' },
  ]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-bark/50 hover:text-bark mb-6 transition-colors">
        <ChevronLeft size={18} /> Back
      </button>

      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        {/* Cover photo */}
        <div className="md:col-span-2 aspect-[3/4] md:aspect-auto rounded-2xl overflow-hidden bg-forest-50 relative group">
          {plant.cover_photo_path ? (
            <img src={plant.cover_photo_path} alt={plant.common_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🌿</div>
          )}
          <label className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <div className="bg-white/90 backdrop-blur-sm text-bark text-xs font-medium px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
              {addingPhoto ? '…' : <><Plus size={12} /> Add photo</>}
            </div>
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleAddPhoto} />
          </label>
        </div>

        {/* Info */}
        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            {plant.family && <p className="text-xs font-sans text-bark/40 uppercase tracking-wide mb-1">{plant.family}</p>}
            <h1 className="font-serif text-4xl font-semibold text-bark leading-tight mb-1">{plant.common_name}</h1>
            {plant.scientific_name && <p className="font-serif text-lg italic text-bark/50 mb-4">{plant.scientific_name}</p>}

            <div className="flex flex-wrap gap-2 mb-6">
              {plant.room && plant.room !== 'Unassigned' && (
                <span className="badge bg-forest-50 text-forest">📍 {plant.room}</span>
              )}
              {plant.difficulty && (
                <span className="badge bg-stone-100 text-bark/60">{plant.difficulty}</span>
              )}
              {plant.toxic
                ? <span className="badge bg-terra-100 text-terra-700">⚠️ Toxic</span>
                : <span className="badge bg-sage-100 text-sage-700">✓ Pet safe</span>
              }
              {latestHealth && <HealthBadge urgency={latestHealth.urgency} />}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl">
                <p className="text-xs text-bark/50 font-sans mb-0.5">Watering</p>
                <p className="text-sm font-medium text-bark">Every {plant.watering_frequency_days}d</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <p className="text-xs text-bark/50 font-sans mb-0.5">Sunlight</p>
                <p className="text-sm font-medium text-bark">{plant.sunlight || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5 flex-wrap">
            <Link to={`/plants/${id}/edit`} className="btn-secondary py-2 text-sm flex items-center gap-1.5">
              Edit details
            </Link>
            <button onClick={handleDelete} disabled={deleting} className="btn-ghost py-2 text-sm text-terra flex items-center gap-1.5 hover:bg-terra-50">
              <Trash2 size={15} />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn flex-1 py-2 ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'overview' && <Overview plant={plant} photos={photos} latestHealth={latestHealth} onWatered={load} onRefresh={load} />}
        {activeTab === 'journal' && <Journal plantId={plant.id} />}
        {activeTab === 'health' && <Health plant={plant} latestHealth={latestHealth} onRefresh={load} />}
        {activeTab === 'care' && <CareGuide plant={plant} />}
      </div>
    </div>
  )
}
