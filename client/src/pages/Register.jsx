import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(form.email, form.name, form.password)
      toast.success('Welcome to Botanica! 🌿')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'AI plant identification from photos',
    'Personalised watering reminders',
    'Health diagnostics & care guides',
    'Growth journal & progress tracking',
  ]

  return (
    <div className="min-h-screen bg-void flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #050D05 0%, #070A07 50%, #060E06 100%)' }}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#4ADE80 1px, transparent 1px), linear-gradient(90deg, #4ADE80 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10"
          style={{ background: 'radial-gradient(circle, #4ADE80 0%, transparent 70%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-volt flex items-center justify-center shadow-volt">
            <span className="text-xl">🌿</span>
          </div>
          <span className="font-display text-2xl font-bold text-white">Botanica</span>
        </div>

        <div className="relative z-10">
          <p className="font-sans text-sm text-volt/80 font-semibold tracking-widest uppercase mb-4">Free forever</p>
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-8">
            Start your<br />plant journey.
          </h2>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 font-sans text-sm text-white/60">
                <div className="w-5 h-5 rounded-full bg-volt/10 border border-volt/30 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-volt" strokeWidth={3} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 font-sans text-white/20 text-xs">No credit card required.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-void">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-volt flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <span className="font-display text-xl font-bold text-white">Botanica</span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white mb-1">Create account</h1>
          <p className="font-sans text-white/40 text-sm mb-8">Join and start caring for your plants</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your name</label>
              <input type="text" className="input" placeholder="Alex Green"
                value={form.name} onChange={set('name')} required autoComplete="name" />
            </div>
            <div>
              <label className="label">Email address</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 mt-2">
              {loading ? 'Creating account…' : <><span>Get started</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-white/30 font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-volt font-semibold hover:text-volt-dim transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
