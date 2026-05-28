import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function LeafMark() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path d="M10 21V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M10 12C10 12 4 9 4 3.5C4 3.5 9 2.5 13 6.5C14.5 8 14 11 10 12Z" fill="currentColor"/>
      <path d="M10 12C13 10 16 7 15 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try { await register(form.email, form.name, form.password); toast.success('Welcome to Botanica'); navigate('/') }
    catch (err) { toast.error(err.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-jet flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative flex items-center gap-3">
          <LeafMark className="text-white" />
          <span className="font-display text-xl italic text-white">Botanica</span>
        </div>

        <div className="relative">
          <p className="font-sans text-xs text-white/30 uppercase tracking-widest mb-4">Free forever</p>
          <h2 className="font-display text-4xl text-white italic leading-tight mb-8">
            Your plants,<br />beautifully cared for.
          </h2>
          <ul className="space-y-3.5">
            {['AI plant identification from photos', 'Personalised watering schedules', 'Health checks & diagnostics', 'Growth journal & progress tracking'].map(f => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white/60" strokeWidth={2.5} />
                </div>
                <span className="font-sans text-sm text-white/50">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-sans text-xs text-white/20">No credit card required.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 bg-white">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="text-jet"><LeafMark /></div>
            <span className="font-display text-xl italic text-jet">Botanica</span>
          </div>

          <h1 className="font-display text-4xl text-jet mb-1">Create account</h1>
          <p className="font-sans text-sm text-dust mb-8">Start your plant care journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input" placeholder="Alex Green"
                value={form.name} onChange={set('name')} required autoComplete="name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11"
                  placeholder="At least 8 characters"
                  value={form.password} onChange={set('password')} required minLength={8} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dust hover:text-ink transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account…' : 'Get started'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-dust font-sans">
            Already have an account? <Link to="/login" className="text-jet font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
