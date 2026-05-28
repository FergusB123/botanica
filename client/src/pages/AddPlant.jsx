import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Check, Edit2 } from 'lucide-react'
import PhotoUpload from '../components/PhotoUpload'
import api from '../api/client'
import toast from 'react-hot-toast'

const ROOMS = ['Living Room','Bedroom','Kitchen','Bathroom','Office','Outdoors','Balcony','Hallway','Unassigned']
const DIFFS = ['Easy','Medium','Hard','Expert']

function Field({ label, children }) {
  return <div><label className="label">{label}</label>{children}</div>
}

export default function AddPlant() {
  const navigate = useNavigate()
  const [step, setStep] = useState('upload')
  const [photos, setPhotos] = useState([])
  const [existingPaths, setExistingPaths] = useState([])
  const [identification, setIdentification] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const set  = (k,v) => setForm(f => ({ ...f, [k]: v }))
  const setE = k     => e => set(k, e.target.value)

  const handleIdentify = async () => {
    if (!photos.length) { toast.error('Add at least one photo'); return }
    setStep('identifying')
    try {
      const fd = new FormData(); photos.forEach(f => fd.append('photos', f))
      const res = await api.post('/plants/identify', fd)
      const ai = res.data.identification
      setIdentification(ai); setExistingPaths(res.data.photos)
      setForm({ common_name: ai.common_name||'', scientific_name: ai.scientific_name||'', family: ai.family||'', room: 'Living Room',
        watering_frequency_days: ai.watering_frequency_days||7, sunlight: ai.sunlight||'', temp_min: ai.temp_min||'', temp_max: ai.temp_max||'',
        humidity: ai.humidity||'', difficulty: ai.difficulty||'Easy', toxic: ai.toxic||false, growth_rate: ai.growth_rate||'',
        typical_lifespan: ai.typical_lifespan||'', care_tips: Array.isArray(ai.care_tips)?ai.care_tips:[], fun_fact: ai.fun_fact||'', notes:'' })
      setStep('review')
    } catch (err) { toast.error(err.response?.data?.error||'Identification failed'); setStep('upload') }
  }

  const skipIdentify = () => {
    setForm({ common_name:'', scientific_name:'', family:'', room:'Living Room', watering_frequency_days:7, sunlight:'', temp_min:'',
      temp_max:'', humidity:'Medium', difficulty:'Easy', toxic:false, growth_rate:'', typical_lifespan:'', care_tips:[], fun_fact:'', notes:'' })
    setExistingPaths([]); setStep('review')
  }

  const handleSave = async () => {
    if (!form.common_name?.trim()) { toast.error('Plant name is required'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => { if (v!=null) fd.append(k, Array.isArray(v)?JSON.stringify(v):String(v)) })
      existingPaths.forEach(p => fd.append('existing_photos', p))
      const res = await api.post('/plants', fd)
      toast.success(`${form.common_name} added!`); navigate(`/plants/${res.data.plant.id}`)
    } catch (err) { toast.error(err.response?.data?.error||'Failed to save') }
    finally { setSaving(false) }
  }

  const steps = [{label:'Upload'},{label:'Review'},{label:'Save'}]
  const stepIdx = {upload:0,identifying:0,review:1}[step]??0

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors">
          <ChevronLeft size={18} className="text-dust"/>
        </button>
        <div>
          <h1 className="font-display text-3xl text-jet">Add a plant</h1>
          <p className="text-xs text-dust font-sans mt-0.5">
            {step==='upload' && 'Upload a photo to identify your plant'}
            {step==='identifying' && 'Claude is analysing your photo…'}
            {step==='review' && (identification ? 'Review identification' : 'Enter plant details')}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        {steps.map((s,i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${i<=stepIdx ? 'text-jet' : 'text-dust'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${i<stepIdx ? 'bg-jet border-jet text-white' : i===stepIdx ? 'border-jet text-jet' : 'border-border text-dust'}`}>
                {i<stepIdx ? <Check size={12} strokeWidth={2.5}/> : i+1}
              </div>
              <span className="text-sm font-medium">{s.label}</span>
            </div>
            {i < steps.length-1 && <div className={`w-8 h-px ${i<stepIdx ? 'bg-jet' : 'bg-border'}`}/>}
          </div>
        ))}
      </div>

      {/* Upload */}
      {step==='upload' && (
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <PhotoUpload files={photos} onChange={setPhotos} multiple label="Drop plant photos here or click to browse" hint="Better photos = more accurate identification · JPG, PNG, WEBP · Max 10 MB"/>
          <div className="flex gap-3">
            <button onClick={handleIdentify} disabled={!photos.length} className="btn-primary flex-1 py-3 gap-2">
              <Sparkles size={14}/> Identify with AI
            </button>
            <button onClick={skipIdentify} className="btn-ghost py-3 px-5">Skip</button>
          </div>
        </div>
      )}

      {/* Identifying */}
      {step==='identifying' && (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-border animate-spin border-t-jet"/>
            <div className="absolute inset-4 text-2xl animate-pulse-gentle flex items-center justify-center">🔍</div>
          </div>
          <h3 className="font-display text-2xl text-jet mb-2">Identifying your plant</h3>
          <p className="text-sm text-dust font-sans">Analysing species, care requirements, and more…</p>
        </div>
      )}

      {/* Review */}
      {step==='review' && (
        <div className="space-y-5">
          {identification && (
            <div className="bg-card border border-border rounded-xl p-5 flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-jet flex-shrink-0 flex items-center justify-center">
                <Sparkles size={16} className="text-white"/>
              </div>
              <div>
                <p className="font-sans text-xs text-dust uppercase tracking-wider mb-1">AI Identification · {identification.confidence} confidence</p>
                <p className="font-display text-xl text-jet">{identification.common_name}</p>
                {identification.scientific_name && <p className="text-sm italic text-dust">{identification.scientific_name}</p>}
              </div>
            </div>
          )}

          {existingPaths.length>0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <p className="label mb-3">Photos</p>
              <div className="flex gap-2 flex-wrap">
                {existingPaths.map((p,i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden relative border border-border">
                    <img src={p} alt="" className="w-full h-full object-cover"/>
                    {i===0 && <span className="absolute bottom-1 left-1 text-[10px] bg-jet text-white px-1.5 py-0.5 rounded-full">Cover</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <h3 className="font-display text-xl text-jet flex items-center gap-2"><Edit2 size={15} className="text-dust"/> Plant details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Common name *"><input className="input" value={form.common_name||''} onChange={setE('common_name')} placeholder="e.g. Monstera"/></Field>
              <Field label="Scientific name"><input className="input" value={form.scientific_name||''} onChange={setE('scientific_name')} placeholder="e.g. Monstera deliciosa"/></Field>
              <Field label="Family"><input className="input" value={form.family||''} onChange={setE('family')} placeholder="e.g. Araceae"/></Field>
              <Field label="Room"><select className="input bg-white" value={form.room||'Living Room'} onChange={setE('room')}>{ROOMS.map(r=><option key={r}>{r}</option>)}</select></Field>
            </div>
            <hr className="border-border"/>
            <p className="label">Care requirements</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Watering every (days)"><input type="number" min="1" max="365" className="input" value={form.watering_frequency_days||7} onChange={setE('watering_frequency_days')}/></Field>
              <Field label="Sunlight"><input className="input" value={form.sunlight||''} onChange={setE('sunlight')} placeholder="e.g. Bright indirect"/></Field>
              <Field label="Min temp (°C)"><input type="number" className="input" value={form.temp_min||''} onChange={setE('temp_min')} placeholder="15"/></Field>
              <Field label="Max temp (°C)"><input type="number" className="input" value={form.temp_max||''} onChange={setE('temp_max')} placeholder="30"/></Field>
              <Field label="Humidity"><select className="input bg-white" value={form.humidity||'Medium'} onChange={setE('humidity')}>{['Low','Medium','High'].map(h=><option key={h}>{h}</option>)}</select></Field>
              <Field label="Difficulty"><select className="input bg-white" value={form.difficulty||'Easy'} onChange={setE('difficulty')}>{DIFFS.map(d=><option key={d}>{d}</option>)}</select></Field>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set('toxic',!form.toxic)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.toxic?'bg-crimson':'bg-border'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.toxic?'translate-x-5':''}`}/>
              </button>
              <span className="text-sm text-ink font-sans">Toxic to pets / children</span>
            </div>
            {Array.isArray(form.care_tips)&&form.care_tips.length>0 && (
              <div><p className="label">Care tips</p>
                <ul className="space-y-2">{form.care_tips.map((t,i)=>(
                  <li key={i} className="flex gap-2 text-sm text-ink font-sans"><span className="text-grove">✓</span>{t}</li>
                ))}</ul>
              </div>
            )}
            <Field label="Notes (optional)"><textarea className="input resize-none" rows={2} value={form.notes||''} onChange={setE('notes')} placeholder="Where you got it, special memories…"/></Field>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('upload')} className="btn-ghost py-3 px-5">← Back</button>
            <button onClick={handleSave} disabled={saving||!form.common_name?.trim()} className="btn-primary flex-1 py-3 gap-2">
              {saving ? 'Saving…' : <><Check size={14}/> Save to collection</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
