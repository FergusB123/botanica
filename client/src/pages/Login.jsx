import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
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

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await login(form.email, form.password); toast.success('Welcome back'); navigate('/') }
    catch (err) { toast.error(err.response?.data?.error || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left — black panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-jet flex-col justify-between p-14 relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <LeafMark className="text-white" />
          <span className="font-display text-xl italic text-white tracking-tight">Botanica</span>
        </div>

        {/* Quote */}
        <div className="relative">
          <p className="font-display text-4xl text-white leading-tight italic mb-8">
            "To plant a garden is to believe in tomorrow."
          </p>
          <p className="font-sans text-sm text-white/30">— Audrey Hepburn</p>
        </div>

        {/* Feature list */}
        <div className="relative space-y-3">
          {['AI plant identification', 'Watering reminders', 'Health diagnostics', 'Growth journal'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <span className="font-sans text-sm text-white/40">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — white form */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 bg-white">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="text-jet"><LeafMark /></div>
            <span className="font-display text-xl italic text-jet">Botanica</span>
          </div>

          <h1 className="font-display text-4xl text-jet mb-1">Welcome back</h1>
          <p className="font-sans text-sm text-dust mb-8">Sign in to your plant collection</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="••••••••"
                  value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dust hover:text-ink transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <button onClick={() => setForm({ email: 'demo@botanica.app', password: 'demo1234' })}
            className="w-full mt-3 py-2.5 border border-dashed border-border rounded-lg text-xs text-dust hover:text-ink hover:border-border-strong transition-colors font-sans">
            Use demo account
          </button>

          <p className="mt-8 text-center text-sm text-dust font-sans">
            New here? <Link to="/register" className="text-jet font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
