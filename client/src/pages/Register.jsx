import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sage flex-col justify-between p-12 relative overflow-hidden">
        <div className="text-white/10 absolute -top-10 -left-10 text-[280px] leading-none select-none pointer-events-none rotate-12">🌸</div>
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="font-serif text-2xl text-white font-semibold">Botanica</span>
        </div>
        <div className="z-10">
          <h2 className="font-serif text-4xl text-white font-semibold leading-tight mb-4">
            Your plants,<br />beautifully cared for.
          </h2>
          <ul className="space-y-3">
            {[
              'AI plant identification from photos',
              'Personalised watering reminders',
              'Health diagnostics & care guides',
              'Growth journal & progress photos',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white/80 font-sans text-sm">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-sans text-white/40 text-xs z-10">Free to use. No credit card required.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-forest rounded-xl flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-serif text-xl font-semibold text-bark">Botanica</span>
          </div>

          <h1 className="font-serif text-4xl font-semibold text-bark mb-2">Create account</h1>
          <p className="font-sans text-bark/60 text-sm mb-8">Start your plant care journey today 🌱</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your name</label>
              <input
                type="text"
                className="input"
                placeholder="Alex Green"
                value={form.name}
                onChange={set('name')}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bark/40 hover:text-bark/70 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account…' : 'Get started'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-bark/50 font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-forest font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
