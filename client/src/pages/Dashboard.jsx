import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, AlertCircle, Leaf, Heart, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

function StatCard({ icon, label, value, accent, to }) {
  const content = (
    <div className={`bg-surface border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all duration-200 ${to ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-white mb-0.5">{value}</p>
      <p className="font-sans text-xs text-white/40 font-medium">{label}</p>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

function WaterItem({ plant, onWatered }) {
  const [loading, setLoading] = useState(false)
  const handleWater = async () => {
    setLoading(true)
    try {
      await api.post(`/plants/${plant.id}/water`)
      toast.success(`${plant.common_name} watered 💧`)
      onWatered()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }
  return (
    <div className="flex items-center gap-3 p-3 bg-raised border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors">
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-void">
        {plant.cover_photo_path
          ? <img src={plant.cover_photo_path} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-base opacity-20">🌿</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-semibold text-white truncate">{plant.common_name}</p>
        {plant.room && <p className="text-xs text-white/30">{plant.room}</p>}
      </div>
      <button onClick={handleWater} disabled={loading}
        className="flex-shrink-0 text-xs bg-volt/10 text-volt border border-volt/20 hover:bg-volt/20 px-3 py-1.5 rounded-full font-bold transition-colors disabled:opacity-40">
        {loading ? '…' : '💧 Water'}
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await api.get('/dashboard')
      setData(res.data)
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0]

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-surface rounded-xl w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-sans text-sm text-white/30 font-medium mb-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1 className="font-display text-4xl font-bold text-white">
            {greeting}, {firstName} 👋
          </h1>
        </div>
        <Link to="/plants/add" className="btn-primary flex items-center gap-2">
          <Plus size={15} strokeWidth={2.5} /> Add plant
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Leaf size={18} className="text-volt" />} label="Total plants"
          value={data?.stats.totalPlants ?? 0} accent="bg-volt/10" to="/plants" />
        <StatCard icon={<Droplets size={18} className="text-[#38BDF8]" />} label="Water today"
          value={data?.stats.waterToday ?? 0} accent="bg-[#38BDF8]/10" />
        <StatCard icon={<AlertCircle size={18} className="text-ember" />} label="Overdue"
          value={data?.stats.overdue ?? 0} accent="bg-ember/10" />
        <StatCard icon={<Heart size={18} className="text-yellow-400" />} label="Health alerts"
          value={data?.stats.healthAlerts ?? 0} accent="bg-yellow-400/10" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* Water today */}
          {data?.waterTodayPlants?.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2">
                  <Droplets size={18} className="text-[#38BDF8]" /> Water today
                </h2>
                <span className="badge bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                  {data.waterTodayPlants.length}
                </span>
              </div>
              <div className="space-y-2">
                {data.waterTodayPlants.map(p => <WaterItem key={p.id} plant={p} onWatered={load} />)}
              </div>
            </div>
          )}

          {/* Overdue */}
          {data?.overduePlants?.length > 0 && (
            <div className="card border-ember/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2 text-ember">
                  <AlertCircle size={18} /> Overdue
                </h2>
                <span className="badge bg-ember/10 text-ember border border-ember/20">{data.overduePlants.length}</span>
              </div>
              <div className="space-y-2">
                {data.overduePlants.map(p => <WaterItem key={p.id} plant={p} onWatered={load} />)}
              </div>
            </div>
          )}

          {/* Empty */}
          {data?.stats.totalPlants === 0 && (
            <div className="card text-center py-14">
              <div className="w-16 h-16 rounded-2xl bg-volt/10 border border-volt/20 flex items-center justify-center text-3xl mx-auto mb-4">🌱</div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Your garden awaits</h3>
              <p className="text-white/40 text-sm mb-6 font-sans">Add your first plant to get started</p>
              <Link to="/plants/add" className="btn-primary inline-flex items-center gap-2">
                <Plus size={15} /> Add your first plant
              </Link>
            </div>
          )}

          {/* Recent plants */}
          {data?.recentPlants?.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Recently added</h2>
                <Link to="/plants" className="text-sm text-volt font-semibold hover:text-volt-dim flex items-center gap-1 transition-colors">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.recentPlants.map(p => (
                  <Link key={p.id} to={`/plants/${p.id}`} className="group text-center">
                    <div className="aspect-square rounded-xl overflow-hidden bg-raised mb-2 border border-white/[0.04] group-hover:border-volt/20 transition-colors">
                      {p.cover_photo_path
                        ? <img src={p.cover_photo_path} alt={p.common_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🌿</div>
                      }
                    </div>
                    <p className="text-xs font-semibold text-white/70 truncate font-sans">{p.common_name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {data?.seasonalTip && (
            <div className="rounded-2xl border border-volt/20 p-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(74,222,128,0.03) 100%)' }}>
              <div className="absolute top-4 right-4 text-volt/20 text-5xl">{data.seasonalTip.emoji}</div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-volt" />
                <span className="text-xs font-bold text-volt/80 uppercase tracking-wider font-sans">Seasonal tip</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{data.seasonalTip.title}</h3>
              <p className="font-sans text-white/50 text-sm leading-relaxed">{data.seasonalTip.tip}</p>
            </div>
          )}

          <div className="card">
            <h3 className="section-title mb-4">Quick links</h3>
            <div className="space-y-1">
              {[
                { label: 'Add a new plant', to: '/plants/add', icon: '🌱' },
                { label: 'Browse my plants', to: '/plants', icon: '🪴' },
                { label: 'View rooms', to: '/rooms', icon: '🏠' },
                { label: 'Settings', to: '/settings', icon: '⚙️' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                  <span className="text-base opacity-60">{item.icon}</span>
                  <span className="text-sm font-medium text-white/60 group-hover:text-white/80 font-sans transition-colors">{item.label}</span>
                  <ArrowRight size={13} className="text-white/20 ml-auto group-hover:text-white/40 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
