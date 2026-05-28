import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Droplets, ChevronRight } from 'lucide-react'
import { isPast, isToday } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'

const ROOM_EMOJIS = {
  'Living Room': '🛋️', 'Bedroom': '🛏️', 'Kitchen': '🍳', 'Bathroom': '🚿',
  'Office': '💻', 'Outdoors': '☀️', 'Balcony': '🏠', 'Hallway': '🚪',
}

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    api.get('/rooms')
      .then(res => {
        const populated = res.data.rooms.filter(r => r.plants.length > 0)
        setRooms(populated)
        const exp = {}
        populated.forEach(r => { exp[r.name] = true })
        setExpanded(exp)
      })
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (name) => setExpanded(e => ({ ...e, [name]: !e[name] }))
  const totalOverdue = rooms.reduce((s, r) => s + r.overdueCount, 0)

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-surface rounded-xl w-40" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-surface rounded-2xl" />)}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Rooms</h1>
        <p className="text-sm text-white/30 font-sans mt-0.5">
          {rooms.reduce((s, r) => s + r.plants.length, 0)} plants across {rooms.length} rooms
          {totalOverdue > 0 && <span className="text-ember ml-2">· {totalOverdue} overdue</span>}
        </p>
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon="🏠" title="No rooms yet"
          description="Assign plants to rooms to organise your collection"
          actionTo="/plants/add" actionLabel="Add a plant" />
      ) : (
        <div className="space-y-3">
          {rooms.map(room => (
            <div key={room.name} className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
              <button onClick={() => toggle(room.name)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                <span className="text-xl opacity-70">{ROOM_EMOJIS[room.name] || '🌿'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-white">{room.name}</h2>
                    {room.overdueCount > 0 && (
                      <span className="badge bg-ember/10 text-ember border border-ember/20 text-xs">
                        <AlertCircle size={9} /> {room.overdueCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/30 font-sans">{room.plants.length} {room.plants.length === 1 ? 'plant' : 'plants'}</p>
                </div>
                <ChevronRight size={16} className={`text-white/20 transition-transform ${expanded[room.name] ? 'rotate-90' : ''}`} />
              </button>

              {expanded[room.name] && (
                <div className="border-t border-white/[0.04]">
                  {room.plants.map((plant, i) => {
                    const overdue = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))
                    const dueToday = plant.next_watering_at && isToday(new Date(plant.next_watering_at))
                    return (
                      <Link key={plant.id} to={`/plants/${plant.id}`}
                        className={`flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors ${i !== room.plants.length - 1 ? 'border-b border-white/[0.03]' : ''}`}>
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-raised flex-shrink-0">
                          {plant.cover_photo_path
                            ? <img src={plant.cover_photo_path} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">🌿</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-white/80 truncate">{plant.common_name}</p>
                          {plant.difficulty && <p className="text-xs text-white/25">{plant.difficulty}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {overdue && <span className="text-xs text-ember font-semibold flex items-center gap-1"><Droplets size={11} /> Overdue</span>}
                          {dueToday && !overdue && <span className="text-xs text-yellow-400 font-semibold flex items-center gap-1"><Droplets size={11} /> Today</span>}
                          {plant.health_score != null && (
                            <span className={`text-xs font-bold ${plant.health_score >= 8 ? 'text-volt' : plant.health_score >= 5 ? 'text-yellow-400' : 'text-ember'}`}>
                              ♥ {plant.health_score}
                            </span>
                          )}
                          <ChevronRight size={13} className="text-white/15" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
