import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, AlertCircle, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

function WaterItem({ plant, onWatered }) {
  const [loading, setLoading] = useState(false)
  const go = async () => {
    setLoading(true)
    try { await api.post(`/plants/${plant.id}/water`); toast.success(`${plant.common_name} watered`); onWatered() }
    catch { toast.error('Failed') } finally { setLoading(false) }
  }
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg overflow-hidden bg-card flex-shrink-0 border border-border">
        {plant.cover_photo_path
          ? <img src={plant.cover_photo_path} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">🌿</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium text-jet truncate">{plant.common_name}</p>
        {plant.room && <p className="text-xs text-dust">{plant.room}</p>}
      </div>
      <button onClick={go} disabled={loading}
        className="flex-shrink-0 text-xs text-cerulean border border-cerulean/25 hover:bg-cerulean-bg px-3 py-1.5 rounded-full transition-colors font-medium disabled:opacity-40">
        {loading ? '…' : 'Water'}
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
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-card rounded-lg w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-card rounded-xl border border-border" />)}
      </div>
    </div>
  )

  const totalPlants  = data?.stats.totalPlants  ?? 0
  const waterToday   = data?.stats.waterToday   ?? 0
  const overdue      = data?.stats.overdue      ?? 0
  const healthAlerts = data?.stats.healthAlerts ?? 0

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="font-sans text-xs text-dust uppercase tracking-wider mb-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1 className="font-display text-5xl text-jet">{greeting}, {firstName}</h1>
        </div>
        <Link to="/plants/add" className="btn-primary gap-1.5">
          <Plus size={14} strokeWidth={2.5} /> Add plant
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Plants', value: totalPlants, to: '/plants', note: 'in your collection' },
          { label: 'Water today', value: waterToday, urgent: waterToday > 0, note: waterToday > 0 ? 'need attention' : 'all watered' },
          { label: 'Overdue', value: overdue, urgent: overdue > 0, note: overdue > 0 ? 'days behind' : 'on schedule' },
          { label: 'Health alerts', value: healthAlerts, urgent: healthAlerts > 0, note: healthAlerts > 0 ? 'need checking' : 'all healthy' },
        ].map(s => {
          const inner = (
            <div className={`bg-white border rounded-xl p-5 hover:shadow-soft transition-all ${s.urgent ? 'border-crimson/20' : 'border-border'} ${s.to ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}>
              <p className="font-display text-4xl text-jet mb-0.5">{s.value}</p>
              <p className="font-sans text-sm font-medium text-ink">{s.label}</p>
              <p className="font-sans text-xs text-dust mt-0.5">{s.note}</p>
            </div>
          )
          return s.to ? <Link key={s.label} to={s.to}>{inner}</Link> : <div key={s.label}>{inner}</div>
        })}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Left 3/5 */}
        <div className="lg:col-span-3 space-y-6">

          {/* Action lists */}
          {(overdue > 0 || waterToday > 0) && (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-5 pt-5 pb-1 flex items-center justify-between">
                <h2 className="font-display text-xl text-jet">
                  {overdue > 0 ? 'Needs watering' : 'Water today'}
                </h2>
                {overdue > 0 && (
                  <span className="text-xs font-medium text-crimson bg-crimson-bg border border-crimson/15 px-2.5 py-1 rounded-full">
                    {overdue} overdue
                  </span>
                )}
              </div>
              <div className="px-5 pb-4">
                {[...(data?.overduePlants || []), ...(data?.waterTodayPlants || [])].map(p => (
                  <WaterItem key={p.id} plant={p} onWatered={load} />
                ))}
              </div>
            </div>
          )}

          {/* Empty onboarding */}
          {totalPlants === 0 && (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center text-2xl mx-auto mb-4">🌱</div>
              <h3 className="font-display text-2xl text-jet mb-2">Start your collection</h3>
              <p className="text-dust text-sm font-sans mb-6 max-w-xs mx-auto leading-relaxed">
                Add your first plant and let AI identify the species and generate a personalised care plan.
              </p>
              <Link to="/plants/add" className="btn-primary gap-1.5">
                <Plus size={13} /> Add your first plant
              </Link>
            </div>
          )}

          {/* Recent plants */}
          {data?.recentPlants?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-jet">Recently added</h2>
                <Link to="/plants" className="text-sm text-dust hover:text-ink flex items-center gap-1 transition-colors">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {data.recentPlants.map(p => (
                  <Link key={p.id} to={`/plants/${p.id}`} className="flex-shrink-0 w-28 group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-card border border-border mb-2 group-hover:border-border-strong group-hover:shadow-soft transition-all">
                      {p.cover_photo_path
                        ? <img src={p.cover_photo_path} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-xl opacity-15">🌿</div>
                      }
                    </div>
                    <p className="text-xs font-medium text-ink truncate text-center">{p.common_name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 2/5 */}
        <div className="lg:col-span-2 space-y-4">

          {/* Seasonal tip */}
          {data?.seasonalTip && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-dust" />
                <span className="font-sans text-xs text-dust uppercase tracking-wider">Seasonal</span>
              </div>
              <p className="text-2xl mb-2">{data.seasonalTip.emoji}</p>
              <h3 className="font-display text-lg text-jet mb-2">{data.seasonalTip.title}</h3>
              <p className="font-sans text-sm text-ink leading-relaxed">{data.seasonalTip.tip}</p>
            </div>
          )}

          {/* Quick nav */}
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {[
              { label: 'My Plants',  to: '/plants',     sub: `${totalPlants} total`,  icon: '🪴' },
              { label: 'Rooms',      to: '/rooms',      sub: 'By location',           icon: '🏠' },
              { label: 'Add plant',  to: '/plants/add', sub: 'AI identification',     icon: '✨' },
            ].map((item, i, arr) => (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-card transition-colors group ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-base">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-jet">{item.label}</p>
                  <p className="text-xs text-dust">{item.sub}</p>
                </div>
                <ArrowRight size={13} className="text-dust group-hover:text-ink transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
