import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, AlertCircle, Plus, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

function WaterItem({ plant, onWatered }) {
  const [loading, setLoading] = useState(false)
  const handleWater = async () => {
    setLoading(true)
    try { await api.post(`/plants/${plant.id}/water`); toast.success(`${plant.common_name} watered 💧`); onWatered() }
    catch { toast.error('Failed') } finally { setLoading(false) }
  }
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-raised border border-white/[0.05]">
        {plant.cover_photo_path
          ? <img src={plant.cover_photo_path} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center opacity-20 text-sm">🌿</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white/80 truncate font-sans">{plant.common_name}</p>
        {plant.room && <p className="text-xs text-white/25 font-sans">{plant.room}</p>}
      </div>
      <button onClick={handleWater} disabled={loading}
        className="text-xs font-bold text-volt border border-volt/25 px-3 py-1.5 rounded-full hover:bg-volt/10 transition-colors disabled:opacity-40 flex-shrink-0">
        {loading ? '…' : '💧'}
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try { const res = await api.get('/dashboard'); setData(res.data) }
    catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
  const firstName = user?.name?.split(' ')[0]

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-surface rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface rounded-2xl" />)}
      </div>
    </div>
  )

  const totalPlants   = data?.stats.totalPlants ?? 0
  const waterToday    = data?.stats.waterToday ?? 0
  const overdue       = data?.stats.overdue ?? 0
  const healthAlerts  = data?.stats.healthAlerts ?? 0

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Hero greeting bar ─────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden px-7 py-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0F1F0F 0%, #0A0F0A 100%)', border: '1px solid rgba(74,222,128,0.08)' }}>
        {/* Glow blob */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4ADE80, transparent 70%)' }} />

        <div className="relative z-10">
          <p className="font-sans text-xs font-bold text-volt/60 uppercase tracking-widest mb-1">
            {format(new Date(), 'EEEE, d MMMM')}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            {greeting}, {firstName} 👋
          </h1>
        </div>

        <Link to="/plants/add"
          className="relative z-10 hidden sm:flex items-center gap-2 bg-volt text-[#070A07] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-volt-dim transition-colors shadow-volt flex-shrink-0">
          <Plus size={15} strokeWidth={2.5} /> Add plant
        </Link>
      </div>

      {/* ── Bento stats grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Total plants — big feature cell */}
        <Link to="/plants" className="col-span-2 lg:col-span-1 relative rounded-2xl p-5 overflow-hidden hover:-translate-y-0.5 transition-transform duration-200 group"
          style={{ background: 'linear-gradient(135deg,#0F1F0F,#0A0F0A)', border: '1px solid rgba(74,222,128,0.12)' }}>
          <div className="absolute bottom-2 right-3 font-display text-[5rem] font-bold leading-none text-volt/[0.07] select-none pointer-events-none group-hover:text-volt/[0.12] transition-colors">
            {totalPlants}
          </div>
          <p className="relative font-display text-5xl font-bold text-volt">{totalPlants}</p>
          <p className="relative text-xs font-bold uppercase tracking-widest text-white/30 mt-1 font-sans">Plants</p>
          <ArrowUpRight size={14} className="relative text-volt/40 mt-3" />
        </Link>

        {/* Water today */}
        <div className={`rounded-2xl p-5 relative overflow-hidden ${waterToday > 0 ? 'border border-[#38BDF8]/20' : 'border border-white/[0.05]'}`}
          style={{ background: waterToday > 0 ? 'rgba(56,189,248,0.06)' : '#0D130D' }}>
          <Droplets size={18} className={waterToday > 0 ? 'text-[#38BDF8]' : 'text-white/15'} />
          <p className="font-display text-4xl font-bold text-white mt-2">{waterToday}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-0.5 font-sans">Water today</p>
        </div>

        {/* Overdue */}
        <div className={`rounded-2xl p-5 relative overflow-hidden ${overdue > 0 ? 'border border-ember/20' : 'border border-white/[0.05]'}`}
          style={{ background: overdue > 0 ? 'rgba(251,146,60,0.07)' : '#0D130D' }}>
          <AlertCircle size={18} className={overdue > 0 ? 'text-ember' : 'text-white/15'} />
          <p className={`font-display text-4xl font-bold mt-2 ${overdue > 0 ? 'text-ember' : 'text-white'}`}>{overdue}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-0.5 font-sans">Overdue</p>
        </div>

        {/* Health alerts */}
        <div className={`rounded-2xl p-5 relative overflow-hidden ${healthAlerts > 0 ? 'border border-yellow-400/20' : 'border border-white/[0.05]'}`}
          style={{ background: healthAlerts > 0 ? 'rgba(250,204,21,0.06)' : '#0D130D' }}>
          <span className={`text-lg ${healthAlerts > 0 ? 'opacity-100' : 'opacity-20'}`}>🩺</span>
          <p className={`font-display text-4xl font-bold mt-2 ${healthAlerts > 0 ? 'text-yellow-400' : 'text-white'}`}>{healthAlerts}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-0.5 font-sans">Alerts</p>
        </div>
      </div>

      {/* ── Main content: actions + sidebar ───────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Left: action lists */}
        <div className="lg:col-span-2 space-y-4">

          {(waterToday > 0 || overdue > 0) && (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#0D130D' }}>
              {/* Section header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h2 className="font-display text-lg font-bold text-white">
                  {overdue > 0 ? 'Needs water' : 'Water today'}
                </h2>
                {overdue > 0 && (
                  <span className="text-xs font-bold text-ember bg-ember/10 border border-ember/20 px-2.5 py-1 rounded-full">
                    {overdue} overdue
                  </span>
                )}
              </div>
              <div className="px-5 pb-5 space-y-3">
                {[...(data?.overduePlants || []), ...(data?.waterTodayPlants || [])].map(p => (
                  <WaterItem key={p.id} plant={p} onWatered={load} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalPlants === 0 && (
            <div className="rounded-3xl border border-volt/10 p-10 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.04), transparent)' }}>
              <p className="text-5xl mb-4">🌱</p>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Start your collection</h3>
              <p className="text-white/30 text-sm mb-6 font-sans">Add your first plant and let AI identify it for you</p>
              <Link to="/plants/add" className="btn-primary inline-flex items-center gap-2">
                <Plus size={14} /> Add your first plant
              </Link>
            </div>
          )}

          {/* Recent plants */}
          {data?.recentPlants?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-white">Recently added</h2>
                <Link to="/plants" className="text-xs font-bold text-volt/70 hover:text-volt flex items-center gap-1 transition-colors">
                  All plants <ArrowRight size={12} />
                </Link>
              </div>
              {/* Horizontal scroll strip */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                {data.recentPlants.map(p => (
                  <Link key={p.id} to={`/plants/${p.id}`}
                    className="flex-shrink-0 w-28 group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-surface border border-white/[0.05] mb-2 group-hover:border-volt/20 transition-colors">
                      {p.cover_photo_path
                        ? <img src={p.cover_photo_path} alt={p.common_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center text-xl opacity-15">🌿</div>
                      }
                    </div>
                    <p className="text-xs font-bold text-white/60 truncate font-sans text-center">{p.common_name}</p>
                  </Link>
                ))}
                {/* Add more CTA */}
                <Link to="/plants/add"
                  className="flex-shrink-0 w-28 flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-white/[0.08] hover:border-volt/30 transition-colors group">
                  <Plus size={20} className="text-white/20 group-hover:text-volt/50 transition-colors mb-1" />
                  <span className="text-[10px] text-white/20 group-hover:text-volt/50 font-sans font-bold transition-colors">Add plant</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">

          {/* Seasonal tip */}
          {data?.seasonalTip && (
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0F1F0F, #0A1200)', border: '1px solid rgba(74,222,128,0.10)' }}>
              <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.07] select-none pointer-events-none">
                {data.seasonalTip.emoji}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-volt" />
                <span className="text-[10px] font-bold text-volt/60 uppercase tracking-widest font-sans">Seasonal</span>
              </div>
              <h3 className="font-display text-base font-bold text-white mb-2 leading-snug">{data.seasonalTip.title}</h3>
              <p className="font-sans text-xs text-white/40 leading-relaxed">{data.seasonalTip.tip}</p>
            </div>
          )}

          {/* Quick links */}
          <div className="rounded-2xl border border-white/[0.05] overflow-hidden" style={{ background: '#0D130D' }}>
            {[
              { label: 'My Plants',  sub: `${totalPlants} total`,    to: '/plants',    icon: '🪴' },
              { label: 'Rooms',      sub: 'By location',             to: '/rooms',     icon: '🏠' },
              { label: 'Add plant',  sub: 'Identify with AI',        to: '/plants/add', icon: '✨' },
              { label: 'Settings',   sub: 'Account & API',           to: '/settings',  icon: '⚙️' },
            ].map((item, i, arr) => (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors group ${i < arr.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                <span className="text-base opacity-50 group-hover:opacity-80 transition-opacity">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/70 font-sans group-hover:text-white/90 transition-colors">{item.label}</p>
                  <p className="text-[10px] text-white/25 font-sans">{item.sub}</p>
                </div>
                <ArrowRight size={12} className="text-white/15 group-hover:text-white/40 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
