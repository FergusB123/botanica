import { useState, useEffect } from 'react'
import { User, Lock, Bell, Leaf, Save, Eye, EyeOff, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

function Section({ icon, title, children }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-dust">{icon}</div>
        <h2 className="font-display text-xl text-jet">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name||'')
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPws, setShowPws] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyConfigured, setApiKeyConfigured] = useState(null)
  const [apiKeyPreview, setApiKeyPreview] = useState(null)
  const [showKey, setShowKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [isVercel, setIsVercel] = useState(false)

  useEffect(() => {
    api.get('/config').then(r => { setApiKeyConfigured(r.data.apiKeyConfigured); setApiKeyPreview(r.data.apiKeyPreview); setIsVercel(r.data.isVercel) }).catch(()=>{})
  }, [])

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name required'); return }
    setSavingProfile(true)
    try { const r=await api.put('/auth/profile',{name}); updateUser(r.data.user); toast.success('Updated!') }
    catch(err) { toast.error(err.response?.data?.error||'Failed') } finally { setSavingProfile(false) }
  }
  const changePw = async () => {
    if (newPw!==confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length<8) { toast.error('Min 8 characters'); return }
    setSavingPw(true)
    try { await api.put('/auth/profile',{currentPassword:currentPw,newPassword:newPw}); setCurrentPw(''); setNewPw(''); setConfirmPw(''); toast.success('Password changed!') }
    catch(err) { toast.error(err.response?.data?.error||'Failed') } finally { setSavingPw(false) }
  }
  const saveKey = async () => {
    if (!apiKey.trim()) { toast.error('Enter API key'); return }
    setSavingKey(true)
    try { const r=await api.post('/config/api-key',{apiKey}); setApiKeyConfigured(true); setApiKeyPreview(r.data.preview); setApiKey(''); toast.success('API key saved!') }
    catch(err) { toast.error(err.response?.data?.error||'Failed') } finally { setSavingKey(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="pb-4 border-b border-border">
        <h1 className="font-display text-4xl text-jet">Settings</h1>
        <p className="font-sans text-sm text-dust mt-1">Manage your account and preferences</p>
      </div>

      {/* API Key */}
      <Section icon={<Key size={14}/>} title="API Key">
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${apiKeyConfigured?'bg-leaf-bg border-leaf/20':'bg-crimson-bg border-crimson/20'}`}>
          {apiKeyConfigured ? <CheckCircle size={16} className="text-grove mt-0.5 flex-shrink-0"/> : <AlertCircle size={16} className="text-crimson mt-0.5 flex-shrink-0"/>}
          <div>
            <p className={`text-sm font-medium ${apiKeyConfigured?'text-grove':'text-crimson'}`}>{apiKeyConfigured?'Configured':'Not set'}</p>
            <p className="text-xs text-dust mt-0.5">{apiKeyConfigured?<><span className="font-mono">{apiKeyPreview}</span> — AI features enabled</>:'Required for plant identification, health checks & care guides'}</p>
          </div>
        </div>
        {isVercel ? (
          <div className="bg-card border border-border rounded-lg p-4 text-sm font-sans text-ink">
            <p className="font-medium mb-1">Running on Vercel</p>
            <p className="text-dust text-xs">Go to <strong>Vercel → Project → Settings → Environment Variables</strong>, add <code className="bg-white border border-border px-1.5 py-0.5 rounded text-xs">ANTHROPIC_API_KEY</code>, then redeploy.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div><label className="label">{apiKeyConfigured?'Replace key':'Enter key'}</label>
              <div className="relative">
                <input type={showKey?'text':'password'} className="input pr-11 font-mono text-sm" placeholder="sk-ant-api03-..."
                  value={apiKey} onChange={e=>setApiKey(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveKey()}/>
                <button type="button" onClick={()=>setShowKey(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dust hover:text-ink">
                  {showKey?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              <p className="text-xs text-dust mt-1.5">Get your key at <span className="text-ink">console.anthropic.com</span></p>
            </div>
            <button onClick={saveKey} disabled={savingKey||!apiKey.trim()} className="btn-primary gap-2">
              <Key size={13}/> {savingKey?'Saving…':apiKeyConfigured?'Update key':'Save & enable AI'}
            </button>
          </div>
        )}
      </Section>

      {/* Profile */}
      <Section icon={<User size={14}/>} title="Profile">
        <div><label className="label">Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div><label className="label">Email</label><input className="input opacity-50 cursor-not-allowed" value={user?.email||''} disabled/><p className="text-xs text-dust mt-1">Cannot be changed</p></div>
        <div><label className="label">Member since</label><p className="text-sm text-ink">{user?.created_at?format(new Date(user.created_at),'PPP'):'—'}</p></div>
        <button onClick={saveProfile} disabled={savingProfile} className="btn-primary gap-2"><Save size={13}/>{savingProfile?'Saving…':'Save changes'}</button>
      </Section>

      {/* Password */}
      <Section icon={<Lock size={14}/>} title="Password">
        <div className="space-y-3">
          {[['Current password',currentPw,setCurrentPw],['New password',newPw,setNewPw],['Confirm new password',confirmPw,setConfirmPw]].map(([l,v,s])=>(
            <div key={l}><label className="label">{l}</label><input type={showPws?'text':'password'} className="input" placeholder="••••••••" value={v} onChange={e=>s(e.target.value)}/></div>
          ))}
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
            <input type="checkbox" checked={showPws} onChange={e=>setShowPws(e.target.checked)}/> Show passwords
          </label>
        </div>
        <button onClick={changePw} disabled={savingPw||!currentPw||!newPw||!confirmPw} className="btn-secondary gap-2"><Lock size={13}/>{savingPw?'Updating…':'Update password'}</button>
      </Section>

      {/* About */}
      <Section icon={<Leaf size={14}/>} title="About">
        <div className="space-y-2">
          {[['Version','1.0.0'],['AI','Claude by Anthropic'],['Database','Neon PostgreSQL'],['Storage','Cloudinary']].map(([k,v])=>(
            <div key={k} className="flex justify-between text-sm"><span className="text-dust">{k}</span><span className="font-medium text-jet">{v}</span></div>
          ))}
        </div>
      </Section>
    </div>
  )
}
