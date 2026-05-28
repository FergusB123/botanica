import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => setForm({ email: 'demo@botanica.app', password: 'demo1234' })

  return (
    <div className="min-h-screen bg-void flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0A1A0A 0%, #050805 50%, #0A120A 100%)' }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#4ADE80 1px, transparent 1px), linear-gradient(90deg, #4ADE80 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4ADE80 0%, transparent 70%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-volt flex items-center justify-center shadow-volt">
            <span className="text-xl">🌿</span>
          </div>
          <span className="font-display text-2xl font-bold text-white">Botanica</span>
        </div>

        <div className="relative z-10">
          <p className="font-sans text-sm text-volt/80 font-semibold tracking-widest uppercase mb-4">Plant Care Companion</p>
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Your plants,<br />thriving.
          </h2>
          <p className="font-sans text-white/40 text-base leading-relaxed max-w-sm">
            AI-powered identification, personalised care schedules, and health diagnostics — all in one place.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {['🌵 Identify', '💧 Reminders', '🩺 Health checks', '📖 Journal'].map((item, i) => (
            <span key={i} className="text-xs font-semibold text-white/30 font-sans">{item}</span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-void">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-volt flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <span className="font-display text-xl font-bold text-white">Botanica</span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white mb-1">Welcome back</h1>
          <p className="font-sans text-white/40 text-sm mb-8">Sign in to check on your plants</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="••••••••"
                  value={form.password} onChange={set('password')} required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 mt-2">
              {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <button type="button" onClick={fillDemo}
            className="w-full mt-3 py-2.5 border border-white/[0.06] rounded-xl text-sm text-white/25 hover:text-white/50 hover:border-white/10 transition-colors font-sans">
            Use demo account
          </button>

          <p className="mt-7 text-center text-sm text-white/30 font-sans">
            New here?{' '}
            <Link to="/register" className="text-volt font-semibold hover:text-volt-dim transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
