import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Droplets, ChevronRight, Home } from 'lucide-react'
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
        // Auto-expand all rooms with plants
        const exp = {}
        populated.forEach(r => { exp[r.name] = true })
        setExpanded(exp)
      })
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (name) => setExpanded(e => ({ ...e, [name]: !e[name] }))

  const totalPlants = rooms.reduce((s, r) => s + r.plants.length, 0)
  const totalOverdue = rooms.reduce((s, r) => s + r.overdueCount, 0)

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-stone-100 rounded-xl w-40" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-stone-100 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Rooms</h1>
        <p className="text-sm text-bark/50 font-sans mt-0.5">
          {totalPlants} {totalPlants === 1 ? 'plant' : 'plants'} across {rooms.length} rooms
          {totalOverdue > 0 && <span className="text-terra-600 ml-2">· {totalOverdue} overdue</span>}
        </p>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="No rooms yet"
          description="Add plants and assign them to rooms to organise your collection"
          actionTo="/plants/add"
          actionLabel="Add a plant"
        />
      ) : (
        <div className="space-y-4">
          {rooms.map(room => (
            <div key={room.name} className="card overflow-hidden p-0">
              {/* Room header */}
              <button
                onClick={() => toggle(room.name)}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-stone-50 transition-colors text-left"
              >
                <span className="text-2xl">{ROOM_EMOJIS[room.name] || '🌿'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl font-semibold text-bark">{room.name}</h2>
                    {room.overdueCount > 0 && (
                      <span className="badge bg-terra-100 text-terra-700">
                        <AlertCircle size={10} /> {room.overdueCount} overdue
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-bark/50 font-sans">{room.plants.length} {room.plants.length === 1 ? 'plant' : 'plants'}</p>
                </div>
                <ChevronRight size={18} className={`text-bark/30 transition-transform ${expanded[room.name] ? 'rotate-90' : ''}`} />
              </button>

              {/* Plant list */}
              {expanded[room.name] && (
                <div className="border-t border-stone-100">
                  {room.plants.map((plant, i) => {
                    const overdue = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))
                    const dueToday = plant.next_watering_at && isToday(new Date(plant.next_watering_at))

                    return (
                      <Link
                        key={plant.id}
                        to={`/plants/${plant.id}`}
                        className={`flex items-center gap-4 px-6 py-3 hover:bg-stone-50 transition-colors ${i !== room.plants.length - 1 ? 'border-b border-stone-50' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-forest-50 flex-shrink-0">
                          {plant.cover_photo_path
                            ? <img src={plant.cover_photo_path} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-medium text-bark truncate">{plant.common_name}</p>
                          {plant.difficulty && <p className="text-xs text-bark/40">{plant.difficulty}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {overdue && (
                            <span className="flex items-center gap-1 text-xs text-terra-600 font-medium">
                              <Droplets size={12} /> Overdue
                            </span>
                          )}
                          {dueToday && !overdue && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <Droplets size={12} /> Today
                            </span>
                          )}
                          {plant.health_score != null && (
                            <span className={`text-xs font-medium ${plant.health_score >= 8 ? 'text-sage-600' : plant.health_score >= 5 ? 'text-amber-600' : 'text-terra-600'}`}>
                              ♥ {plant.health_score}
                            </span>
                          )}
                          <ChevronRight size={14} className="text-bark/20" />
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
