import { useState, useEffect } from 'react'
import { User, Lock, Bell, Leaf, Save, Eye, EyeOff, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

function Section({ icon, title, children }) {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-volt/10 border border-volt/20 flex items-center justify-center text-volt">{icon}</div>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPws, setShowPws] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyConfigured, setApiKeyConfigured] = useState(null)
  const [apiKeyPreview, setApiKeyPreview] = useState(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [isVercel, setIsVercel] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported] = useState('Notification' in window && 'serviceWorker' in navigator)

  useEffect(() => {
    api.get('/config').then(res => {
      setApiKeyConfigured(res.data.apiKeyConfigured)
      setApiKeyPreview(res.data.apiKeyPreview)
      setIsVercel(res.data.isVercel)
    }).catch(() => {})
    if (Notification.permission === 'granted') setPushEnabled(true)
  }, [])

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    setSavingProfile(true)
    try {
      const res = await api.put('/auth/profile', { name })
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSavingProfile(false) }
  }

  const changePassword = async () => {
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 8) { toast.error('At least 8 characters'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/profile', { currentPassword: currentPw, newPassword: newPw })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      toast.success('Password changed!')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSavingPw(false) }
  }

  const saveApiKey = async () => {
    if (!apiKey.trim()) { toast.error('Please enter an API key'); return }
    setSavingKey(true)
    try {
      const res = await api.post('/config/api-key', { apiKey })
      setApiKeyConfigured(true); setApiKeyPreview(res.data.preview); setApiKey('')
      toast.success('API key saved! 🌿')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSavingKey(false) }
  }

  const requestPush = async () => {
    const perm = await Notification.requestPermission()
    if (perm === 'granted') { setPushEnabled(true); toast.success('Push notifications enabled! 🔔') }
    else toast.error('Permission denied')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-white/30 font-sans mt-0.5">Manage your account and preferences</p>
      </div>

      {/* API Key */}
      <Section icon={<Key size={15} />} title="Anthropic API Key">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${apiKeyConfigured ? 'bg-volt/[0.06] border-volt/20' : 'bg-ember/[0.06] border-ember/20'}`}>
          {apiKeyConfigured
            ? <CheckCircle size={17} className="text-volt flex-shrink-0" />
            : <AlertCircle size={17} className="text-ember flex-shrink-0" />
          }
          <div>
            <p className={`font-sans text-sm font-semibold ${apiKeyConfigured ? 'text-volt' : 'text-ember'}`}>
              {apiKeyConfigured ? 'API key configured' : 'API key not set'}
            </p>
            <p className="text-xs text-white/30 mt-0.5">
              {apiKeyConfigured
                ? <><span className="font-mono">{apiKeyPreview}</span> — AI features enabled</>
                : 'Required for plant identification, health checks & care guides'
              }
            </p>
          </div>
        </div>

        {isVercel ? (
          <div className="bg-volt/[0.04] border border-volt/10 rounded-xl p-4 text-sm font-sans text-white/50 space-y-1">
            <p className="font-bold text-volt/80">Running on Vercel</p>
            <p>Go to <strong className="text-white/70">Vercel → Project → Settings → Environment Variables</strong>, add <code className="bg-white/5 px-1.5 py-0.5 rounded text-volt/80">ANTHROPIC_API_KEY</code>, then redeploy.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="label">{apiKeyConfigured ? 'Replace API key' : 'Enter your API key'}</label>
              <div className="relative">
                <input type={showApiKey ? 'text' : 'password'} className="input pr-11 font-mono text-sm"
                  placeholder="sk-ant-api03-..." value={apiKey} onChange={e => setApiKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveApiKey()} />
                <button type="button" onClick={() => setShowApiKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-white/25 mt-1.5">Get your key at <span className="text-white/40">console.anthropic.com</span></p>
            </div>
            <button onClick={saveApiKey} disabled={savingKey || !apiKey.trim()} className="btn-primary flex items-center gap-2 py-2.5">
              <Key size={14} /> {savingKey ? 'Saving…' : apiKeyConfigured ? 'Update key' : 'Save key & enable AI'}
            </button>
          </div>
        )}
      </Section>

      {/* Profile */}
      <Section icon={<User size={15} />} title="Profile">
        <div>
          <label className="label">Display name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className="label">Email address</label>
          <input className="input opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
          <p className="text-xs text-white/25 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="label">Member since</label>
          <p className="text-sm text-white/40 font-sans">{user?.created_at ? format(new Date(user.created_at), 'PPP') : '—'}</p>
        </div>
        <button onClick={saveProfile} disabled={savingProfile} className="btn-primary flex items-center gap-2 py-2.5">
          <Save size={14} /> {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </Section>

      {/* Password */}
      <Section icon={<Lock size={15} />} title="Change password">
        <div className="space-y-3">
          {['Current password', 'New password', 'Confirm new password'].map((label, i) => (
            <div key={i}>
              <label className="label">{label}</label>
              <input type={showPws ? 'text' : 'password'} className="input" placeholder="••••••••"
                value={[currentPw, newPw, confirmPw][i]}
                onChange={e => [setCurrentPw, setNewPw, setConfirmPw][i](e.target.value)} />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-white/40 cursor-pointer select-none">
            <input type="checkbox" checked={showPws} onChange={e => setShowPws(e.target.checked)} className="rounded" />
            Show passwords
          </label>
        </div>
        <button onClick={changePassword} disabled={savingPw || !currentPw || !newPw || !confirmPw}
          className="btn-secondary flex items-center gap-2 py-2.5">
          <Lock size={14} /> {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell size={15} />} title="Notifications">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-sans text-sm font-semibold text-white/80">In-app notifications</p>
            <p className="text-xs text-white/30 mt-0.5">Watering reminders and health alerts</p>
          </div>
          <div className="w-9 h-5 rounded-full bg-volt flex items-center justify-end pr-0.5">
            <div className="w-4 h-4 rounded-full bg-[#070A07] shadow" />
          </div>
        </div>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-sans text-sm font-semibold text-white/80">Browser push notifications</p>
            <p className="text-xs text-white/30 mt-0.5">{pushSupported ? 'Receive alerts when app is closed' : 'Not supported in this browser'}</p>
          </div>
          {pushSupported && (
            pushEnabled
              ? <span className="badge bg-volt/10 text-volt border border-volt/20">Enabled</span>
              : <button onClick={requestPush} className="btn-secondary py-1.5 text-xs">Enable</button>
          )}
        </div>
      </Section>

      {/* About */}
      <Section icon={<Leaf size={15} />} title="About Botanica">
        <div className="space-y-2">
          {[['Version', '1.0.0'], ['AI powered by', 'Claude (Anthropic)'], ['Database', 'Neon PostgreSQL'], ['Storage', 'Cloudinary']].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm font-sans">
              <span className="text-white/30">{k}</span>
              <span className="text-white/70 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
