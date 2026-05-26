import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, AlertCircle, Leaf, Heart, Plus, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

function StatCard({ icon, label, value, color, to }) {
  const content = (
    <div className={`card hover:shadow-card transition-all duration-200 ${to ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-sm text-bark/50 mb-1">{label}</p>
          <p className={`font-serif text-4xl font-semibold ${color}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('forest', 'forest-50').replace('terra', 'terra-50').replace('amber', 'amber-50').replace('sage', 'sage-50')}`}>
          {icon}
        </div>
      </div>
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
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 hover:border-forest/20 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-forest-50 overflow-hidden flex-shrink-0">
        {plant.cover_photo_path
          ? <img src={plant.cover_photo_path} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium text-bark truncate">{plant.common_name}</p>
        {plant.room && <p className="text-xs text-bark/40">{plant.room}</p>}
      </div>
      <button
        onClick={handleWater}
        disabled={loading}
        className="flex-shrink-0 text-xs bg-sage-100 text-sage-700 hover:bg-sage-200 px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50"
      >
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
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0]

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-stone-100 rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-stone-100 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-bark">
            {greeting}, {firstName} 👋
          </h1>
          <p className="font-sans text-bark/50 text-sm mt-1">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        <Link to="/plants/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add plant
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Leaf size={20} className="text-forest" />}
          label="Total plants"
          value={data?.stats.totalPlants ?? 0}
          color="text-forest"
          to="/plants"
        />
        <StatCard
          icon={<Droplets size={20} className="text-sage" />}
          label="Water today"
          value={data?.stats.waterToday ?? 0}
          color="text-sage"
        />
        <StatCard
          icon={<AlertCircle size={20} className="text-terra" />}
          label="Overdue"
          value={data?.stats.overdue ?? 0}
          color="text-terra"
        />
        <StatCard
          icon={<Heart size={20} className="text-amber-600" />}
          label="Health alerts"
          value={data?.stats.healthAlerts ?? 0}
          color="text-amber-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Water today */}
        <div className="lg:col-span-2 space-y-4">
          {data?.waterTodayPlants?.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2">
                  <Droplets size={20} className="text-sage" /> Water today
                </h2>
                <span className="badge bg-sage-100 text-sage-700">{data.waterTodayPlants.length} plants</span>
              </div>
              <div className="space-y-2">
                {data.waterTodayPlants.map(p => (
                  <WaterItem key={p.id} plant={p} onWatered={load} />
                ))}
              </div>
            </div>
          )}

          {data?.overduePlants?.length > 0 && (
            <div className="card border-terra-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2 text-terra">
                  <AlertCircle size={20} /> Overdue
                </h2>
                <span className="badge bg-terra-100 text-terra-700">{data.overduePlants.length} plants</span>
              </div>
              <div className="space-y-2">
                {data.overduePlants.map(p => (
                  <WaterItem key={p.id} plant={p} onWatered={load} />
                ))}
              </div>
            </div>
          )}

          {data?.stats.totalPlants === 0 && (
            <div className="card text-center py-12">
              <p className="text-5xl mb-4">🌱</p>
              <h3 className="section-title mb-2">Your garden awaits</h3>
              <p className="text-bark/50 text-sm mb-6 font-sans">Add your first plant to get started</p>
              <Link to="/plants/add" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Add your first plant
              </Link>
            </div>
          )}

          {/* Recent plants */}
          {data?.recentPlants?.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Recently added</h2>
                <Link to="/plants" className="text-sm text-forest hover:underline font-medium flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.recentPlants.map(p => (
                  <Link key={p.id} to={`/plants/${p.id}`} className="group text-center">
                    <div className="aspect-square rounded-xl overflow-hidden bg-forest-50 mb-2">
                      {p.cover_photo_path
                        ? <img src={p.cover_photo_path} alt={p.common_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🌿</div>
                      }
                    </div>
                    <p className="text-xs font-medium text-bark truncate font-sans">{p.common_name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seasonal tip */}
        <div className="space-y-4">
          {data?.seasonalTip && (
            <div className="card bg-forest text-white border-0">
              <p className="text-3xl mb-3">{data.seasonalTip.emoji}</p>
              <h3 className="font-serif text-xl font-semibold mb-2 text-white">{data.seasonalTip.title}</h3>
              <p className="font-sans text-white/70 text-sm leading-relaxed">{data.seasonalTip.tip}</p>
            </div>
          )}

          <div className="card">
            <h3 className="section-title mb-4">Quick links</h3>
            <div className="space-y-2">
              {[
                { label: 'Add a new plant', to: '/plants/add', icon: '🌱' },
                { label: 'Browse my plants', to: '/plants', icon: '🪴' },
                { label: 'View rooms', to: '/rooms', icon: '🏠' },
                { label: 'Settings', to: '/settings', icon: '⚙️' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-bark/80 font-sans">{item.label}</span>
                  <ArrowRight size={14} className="text-bark/30 ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
