import { useState, useEffect } from 'react'
import { User, Lock, Bell, Leaf, Save, Eye, EyeOff, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

function Section({ icon, title, children }) {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
        <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center text-forest">{icon}</div>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuth()

  // ── API Key ───────────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState('')
  const [apiKeyConfigured, setApiKeyConfigured] = useState(null)
  const [apiKeyPreview, setApiKeyPreview] = useState(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [isVercel, setIsVercel] = useState(false)

  useEffect(() => {
    api.get('/config').then(res => {
      setApiKeyConfigured(res.data.apiKeyConfigured)
      setApiKeyPreview(res.data.apiKeyPreview)
      setIsVercel(res.data.isVercel)
    }).catch(() => {})
  }, [])

  const saveApiKey = async () => {
    if (!apiKey.trim()) { toast.error('Please enter an API key'); return }
    setSavingKey(true)
    try {
      const res = await api.post('/config/api-key', { apiKey })
      setApiKeyConfigured(true)
      setApiKeyPreview(res.data.preview)
      setApiKey('')
      toast.success('API key saved! AI features are now enabled 🌿')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save API key')
    } finally {
      setSavingKey(false)
    }
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPws, setShowPws] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported] = useState('Notification' in window && 'serviceWorker' in navigator)

  useEffect(() => {
    if (Notification.permission === 'granted') setPushEnabled(true)
  }, [])

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    setSavingProfile(true)
    try {
      const res = await api.put('/auth/profile', { name })
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async () => {
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/profile', { currentPassword: currentPw, newPassword: newPw })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      toast.success('Password changed!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  const requestPushPermission = async () => {
    if (!pushSupported) { toast.error('Push notifications not supported in this browser'); return }
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPushEnabled(true)
        toast.success('Push notifications enabled! 🔔')
      } else {
        toast.error('Permission denied. Enable notifications in your browser settings.')
      }
    } catch {
      toast.error('Failed to request permission')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-bark/50 font-sans mt-0.5">Manage your account and preferences</p>
      </div>

      {/* API Key */}
      <Section icon={<Key size={16} />} title="Anthropic API Key">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${apiKeyConfigured ? 'bg-sage-50 border-sage-200' : 'bg-terra-50 border-terra-200'}`}>
          {apiKeyConfigured
            ? <CheckCircle size={18} className="text-sage-600 flex-shrink-0" />
            : <AlertCircle size={18} className="text-terra-600 flex-shrink-0" />
          }
          <div>
            <p className={`font-sans text-sm font-semibold ${apiKeyConfigured ? 'text-sage-700' : 'text-terra-700'}`}>
              {apiKeyConfigured ? 'API key configured' : 'API key not set'}
            </p>
            <p className="text-xs text-bark/50 mt-0.5">
              {apiKeyConfigured
                ? <>Current key: <span className="font-mono">{apiKeyPreview}</span> — AI features enabled</>
                : 'Required for plant identification, health checks, and care guides'
              }
            </p>
          </div>
        </div>

        {isVercel ? (
          <div className="bg-forest-50 border border-forest-100 rounded-xl p-4 text-sm font-sans text-bark/70 space-y-1">
            <p className="font-semibold text-forest">Running on Vercel</p>
            <p>Go to your <strong>Vercel dashboard → Project → Settings → Environment Variables</strong>, add <code className="bg-white px-1 rounded">ANTHROPIC_API_KEY</code>, then redeploy.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="label">
                {apiKeyConfigured ? 'Replace API key' : 'Enter your Anthropic API key'}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="input pr-11 font-mono text-sm"
                  placeholder="sk-ant-api03-..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveApiKey()}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bark/40 hover:text-bark/70 transition-colors"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-bark/40 mt-1.5">
                Get your key at <span className="font-medium">console.anthropic.com</span> → API Keys.
              </p>
            </div>
            <button onClick={saveApiKey} disabled={savingKey || !apiKey.trim()} className="btn-primary flex items-center gap-2 py-2.5">
              <Key size={15} />
              {savingKey ? 'Saving…' : apiKeyConfigured ? 'Update key' : 'Save key & enable AI'}
            </button>
          </div>
        )}
      </Section>

      {/* Profile */}
      <Section icon={<User size={16} />} title="Profile">
        <div>
          <label className="label">Display name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className="label">Email address</label>
          <input className="input bg-stone-50 text-bark/60" value={user?.email || ''} disabled />
          <p className="text-xs text-bark/40 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="label">Member since</label>
          <p className="text-sm text-bark/60 font-sans">{user?.created_at ? format(new Date(user.created_at), 'PPP') : '—'}</p>
        </div>
        <button onClick={saveProfile} disabled={savingProfile} className="btn-primary flex items-center gap-2 py-2.5">
          <Save size={15} />
          {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </Section>

      {/* Password */}
      <Section icon={<Lock size={16} />} title="Change password">
        <div className="space-y-3">
          <div>
            <label className="label">Current password</label>
            <div className="relative">
              <input
                type={showPws ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
              />
              <button type="button" onClick={() => setShowPws(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-bark/40 hover:text-bark/70">
                {showPws ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">New password</label>
            <input type={showPws ? 'text' : 'password'} className="input" placeholder="At least 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input type={showPws ? 'text' : 'password'} className="input" placeholder="Repeat new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </div>
        </div>
        <button
          onClick={changePassword}
          disabled={savingPw || !currentPw || !newPw || !confirmPw}
          className="btn-secondary flex items-center gap-2 py-2.5"
        >
          <Lock size={15} />
          {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell size={16} />} title="Notifications">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-sans text-sm font-medium text-bark">In-app notifications</p>
            <p className="text-xs text-bark/50 mt-0.5">Watering reminders and health alerts in the notification centre</p>
          </div>
          <div className="w-9 h-5 rounded-full bg-forest flex items-center justify-end pr-0.5">
            <div className="w-4 h-4 rounded-full bg-white shadow" />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-sans text-sm font-medium text-bark">Browser push notifications</p>
            <p className="text-xs text-bark/50 mt-0.5">
              {pushSupported ? 'Receive alerts even when the app is closed' : 'Not supported in this browser'}
            </p>
          </div>
          {pushSupported && (
            pushEnabled ? (
              <span className="badge bg-sage-100 text-sage-700">Enabled</span>
            ) : (
              <button onClick={requestPushPermission} className="btn-secondary py-1.5 text-xs">
                Enable
              </button>
            )
          )}
        </div>

        <div className="bg-forest-50 rounded-xl p-4">
          <p className="text-sm font-medium text-forest mb-1 flex items-center gap-2">
            <Bell size={14} /> Daily watering check
          </p>
          <p className="text-xs text-bark/60">
            A cron job runs every day at 8:00 AM and creates notifications for any plants that are due or overdue for watering.
          </p>
        </div>
      </Section>

      {/* About */}
      <Section icon={<Leaf size={16} />} title="About Botanica">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-sans">
            <span className="text-bark/60">Version</span>
            <span className="text-bark font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm font-sans">
            <span className="text-bark/60">AI powered by</span>
            <span className="text-bark font-medium">Claude (Anthropic)</span>
          </div>
          <div className="flex justify-between text-sm font-sans">
            <span className="text-bark/60">Database</span>
            <span className="text-bark font-medium">SQLite (local)</span>
          </div>
        </div>
        <p className="text-xs text-bark/40 font-sans leading-relaxed">
          Botanica is a personal plant care companion. Your data is stored locally on your device and never shared with third parties beyond the Claude API for plant identification and health checks.
        </p>
      </Section>
    </div>
  )
}
