import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Check, Edit2 } from 'lucide-react'
import PhotoUpload from '../components/PhotoUpload'
import api from '../api/client'
import toast from 'react-hot-toast'

const ROOMS = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Outdoors', 'Balcony', 'Hallway', 'Unassigned']
const DIFFICULTY = ['Easy', 'Medium', 'Hard', 'Expert']

function Field({ label, children }) {
  return <div><label className="label">{label}</label>{children}</div>
}

export default function AddPlant() {
  const navigate = useNavigate()
  const [step, setStep] = useState('upload')
  const [photos, setPhotos] = useState([])
  const [existingPhotoPaths, setExistingPhotoPaths] = useState([])
  const [identification, setIdentification] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setE = (k) => (e) => set(k, e.target.value)

  const handleIdentify = async () => {
    if (!photos.length) { toast.error('Please add at least one photo'); return }
    setStep('identifying')
    try {
      const fd = new FormData()
      photos.forEach(f => fd.append('photos', f))
      const res = await api.post('/plants/identify', fd)
      const ai = res.data.identification
      setIdentification(ai)
      setExistingPhotoPaths(res.data.photos)
      setForm({
        common_name: ai.common_name || '', scientific_name: ai.scientific_name || '',
        family: ai.family || '', room: 'Living Room',
        watering_frequency_days: ai.watering_frequency_days || 7, sunlight: ai.sunlight || '',
        temp_min: ai.temp_min || '', temp_max: ai.temp_max || '', humidity: ai.humidity || '',
        difficulty: ai.difficulty || 'Easy', toxic: ai.toxic || false,
        growth_rate: ai.growth_rate || '', typical_lifespan: ai.typical_lifespan || '',
        care_tips: Array.isArray(ai.care_tips) ? ai.care_tips : [], fun_fact: ai.fun_fact || '', notes: '',
      })
      setStep('review')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identification failed')
      setStep('upload')
    }
  }

  const skipIdentify = () => {
    setForm({ common_name: '', scientific_name: '', family: '', room: 'Living Room',
      watering_frequency_days: 7, sunlight: '', temp_min: '', temp_max: '',
      humidity: 'Medium', difficulty: 'Easy', toxic: false, growth_rate: '',
      typical_lifespan: '', care_tips: [], fun_fact: '', notes: '' })
    setExistingPhotoPaths([])
    setStep('review')
  }

  const handleSave = async () => {
    if (!form.common_name?.trim()) { toast.error('Plant name is required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v === null || v === undefined) return
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
        else fd.append(k, String(v))
      })
      existingPhotoPaths.forEach(p => fd.append('existing_photos', p))
      const res = await api.post('/plants', fd)
      toast.success(`${form.common_name} added! 🌿`)
      navigate(`/plants/${res.data.plant.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save plant')
    } finally { setSaving(false) }
  }

  const stepLabels = ['Upload', 'Review', 'Save']
  const stepIndex = { upload: 0, identifying: 0, review: 1 }[step] ?? 0

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-white/60" />
        </button>
        <div>
          <h1 className="page-title">Add a plant</h1>
          <p className="text-sm text-white/30 font-sans mt-0.5">
            {step === 'upload' && 'Upload a photo to identify your plant'}
            {step === 'identifying' && 'Analysing your plant…'}
            {step === 'review' && (identification ? 'Review & confirm identification' : 'Enter plant details')}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col gap-1.5">
            <div className={`h-1 rounded-full transition-colors duration-300 ${i <= stepIndex ? 'bg-volt' : 'bg-white/10'}`} />
            <span className={`text-xs font-semibold font-sans ${i <= stepIndex ? 'text-volt' : 'text-white/20'}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div className="card space-y-5">
          <PhotoUpload files={photos} onChange={setPhotos} multiple
            label="Drop plant photos here or click to browse"
            hint="Better photos = more accurate identification · JPG, PNG, WEBP · Max 10MB" />
          <div className="flex gap-3">
            <button onClick={handleIdentify} disabled={!photos.length}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              <Sparkles size={15} /> Identify with AI
            </button>
            <button onClick={skipIdentify} className="btn-ghost py-3 px-5">Skip</button>
          </div>
        </div>
      )}

      {/* Identifying step */}
      {step === 'identifying' && (
        <div className="card text-center py-16 space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-volt/20 animate-spin border-t-volt" />
            <div className="absolute inset-4 flex items-center justify-center text-3xl animate-pulse-gentle">🔍</div>
          </div>
          <h3 className="font-display text-2xl font-bold text-white">Analysing your plant</h3>
          <p className="text-white/30 text-sm font-sans max-w-xs mx-auto">
            Claude is examining your photo and identifying the species, care needs, and more…
          </p>
        </div>
      )}

      {/* Review step */}
      {step === 'review' && (
        <div className="space-y-5">
          {identification && (
            <div className="rounded-2xl border border-volt/20 p-5 flex gap-4"
              style={{ background: 'rgba(74,222,128,0.05)' }}>
              <div className="w-10 h-10 rounded-xl bg-volt flex-shrink-0 flex items-center justify-center">
                <Sparkles size={18} className="text-[#070A07]" />
              </div>
              <div>
                <p className="font-sans text-xs font-bold text-volt/80 uppercase tracking-wider mb-1">
                  AI Identification · {identification.confidence} confidence
                </p>
                <p className="font-display text-xl font-bold text-white">{identification.common_name}</p>
                {identification.scientific_name && <p className="text-sm italic text-white/40">{identification.scientific_name}</p>}
              </div>
            </div>
          )}

          {existingPhotoPaths.length > 0 && (
            <div className="card">
              <p className="label mb-3">Photos</p>
              <div className="flex gap-2 flex-wrap">
                {existingPhotoPaths.map((p, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden relative border border-white/[0.06]">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-volt text-[#070A07] px-1.5 py-0.5 rounded-full font-bold">Cover</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card space-y-5">
            <h3 className="section-title flex items-center gap-2"><Edit2 size={16} className="text-volt" /> Plant details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Common name *"><input className="input" value={form.common_name || ''} onChange={setE('common_name')} placeholder="e.g. Monstera" /></Field>
              <Field label="Scientific name"><input className="input" value={form.scientific_name || ''} onChange={setE('scientific_name')} placeholder="e.g. Monstera deliciosa" /></Field>
              <Field label="Plant family"><input className="input" value={form.family || ''} onChange={setE('family')} placeholder="e.g. Araceae" /></Field>
              <Field label="Room">
                <select className="input bg-surface" value={form.room || 'Living Room'} onChange={setE('room')}>
                  {ROOMS.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
            <hr className="border-white/[0.06]" />
            <p className="font-sans text-xs font-bold text-white/30 uppercase tracking-wider">Care requirements</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Watering every (days)"><input type="number" min="1" max="365" className="input" value={form.watering_frequency_days || 7} onChange={setE('watering_frequency_days')} /></Field>
              <Field label="Sunlight"><input className="input" value={form.sunlight || ''} onChange={setE('sunlight')} placeholder="e.g. Bright indirect" /></Field>
              <Field label="Min temp (°C)"><input type="number" className="input" value={form.temp_min || ''} onChange={setE('temp_min')} placeholder="15" /></Field>
              <Field label="Max temp (°C)"><input type="number" className="input" value={form.temp_max || ''} onChange={setE('temp_max')} placeholder="30" /></Field>
              <Field label="Humidity">
                <select className="input bg-surface" value={form.humidity || 'Medium'} onChange={setE('humidity')}>
                  {['Low', 'Medium', 'High'].map(h => <option key={h}>{h}</option>)}
                </select>
              </Field>
              <Field label="Difficulty">
                <select className="input bg-surface" value={form.difficulty || 'Easy'} onChange={setE('difficulty')}>
                  {DIFFICULTY.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set('toxic', !form.toxic)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.toxic ? 'bg-ember' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.toxic ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm font-sans text-white/50">Toxic to pets / children</span>
            </div>

            {Array.isArray(form.care_tips) && form.care_tips.length > 0 && (
              <div>
                <p className="label">Care tips</p>
                <ul className="space-y-2">
                  {form.care_tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/50 font-sans">
                      <span className="text-volt mt-0.5 flex-shrink-0">✓</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Field label="Personal notes (optional)">
              <textarea className="input resize-none" rows={2} value={form.notes || ''} onChange={setE('notes')} placeholder="Where you got it, special memories…" />
            </Field>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('upload')} className="btn-ghost py-3 px-5">← Back</button>
            <button onClick={handleSave} disabled={saving || !form.common_name?.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {saving ? 'Saving…' : <><Check size={15} /> Save to collection</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
