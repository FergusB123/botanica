import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff } from 'lucide-react'
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
    <div className="min-h-screen bg-cream flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest flex-col justify-between p-12 relative overflow-hidden">
        <div className="text-white/10 absolute -bottom-20 -right-20 text-[320px] leading-none select-none pointer-events-none">🌿</div>
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="font-serif text-2xl text-white font-semibold">Botanica</span>
        </div>
        <div className="z-10">
          <blockquote className="font-serif text-3xl text-white leading-relaxed mb-6">
            "To plant a garden is to believe in tomorrow."
          </blockquote>
          <p className="font-sans text-white/50 text-sm">— Audrey Hepburn</p>
        </div>
        <div className="flex gap-3 z-10">
          {['🌵', '🌺', '🍃', '🌸'].map((e, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">{e}</div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-forest rounded-xl flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-serif text-xl font-semibold text-bark">Botanica</span>
          </div>

          <h1 className="font-serif text-4xl font-semibold text-bark mb-2">Welcome back</h1>
          <p className="font-sans text-bark/60 text-sm mb-8">Sign in to check on your plants 🌱</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete="current-password"
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-2.5 border border-dashed border-stone-300 rounded-xl text-sm text-bark/50 hover:text-bark/70 hover:border-stone-400 transition-colors font-sans"
            >
              Use demo account
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-bark/50 font-sans">
            New here?{' '}
            <Link to="/register" className="text-forest font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
