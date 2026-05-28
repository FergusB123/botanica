import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Droplets, ChevronRight } from 'lucide-react'
import { isPast, isToday } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'

const ROOM_EMOJIS = { 'Living Room':'🛋️','Bedroom':'🛏️','Kitchen':'🍳','Bathroom':'🚿','Office':'💻','Outdoors':'☀️','Balcony':'🏠','Hallway':'🚪' }

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    api.get('/rooms')
      .then(res => {
        const r = res.data.rooms.filter(r => r.plants.length > 0)
        setRooms(r)
        const e = {}; r.forEach(x => { e[x.name] = true }); setExpanded(e)
      })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-card rounded-lg w-40 border border-border" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-card rounded-xl border border-border" />)}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl text-jet">Rooms</h1>
        <p className="font-sans text-sm text-dust mt-1">
          {rooms.reduce((s,r) => s+r.plants.length,0)} plants across {rooms.length} rooms
          {rooms.reduce((s,r) => s+r.overdueCount,0) > 0 && (
            <span className="text-crimson ml-1">· {rooms.reduce((s,r) => s+r.overdueCount,0)} overdue</span>
          )}
        </p>
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon="🏠" title="No rooms yet" description="Assign plants to rooms to organise your collection" actionTo="/plants/add" actionLabel="Add a plant" />
      ) : (
        <div className="space-y-3">
          {rooms.map(room => (
            <div key={room.name} className="bg-white border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors">
              <button onClick={() => setExpanded(e => ({ ...e, [room.name]: !e[room.name] }))}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-card transition-colors text-left">
                <span className="text-xl">{ROOM_EMOJIS[room.name] || '🌿'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg text-jet">{room.name}</h2>
                    {room.overdueCount > 0 && (
                      <span className="badge bg-crimson-bg text-crimson border border-crimson/15">
                        <AlertCircle size={9}/> {room.overdueCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dust font-sans">{room.plants.length} plant{room.plants.length !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight size={15} className={`text-dust transition-transform ${expanded[room.name] ? 'rotate-90' : ''}`} />
              </button>

              {expanded[room.name] && (
                <div className="border-t border-border">
                  {room.plants.map((plant, i) => {
                    const overdue  = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))
                    const dueToday = plant.next_watering_at && isToday(new Date(plant.next_watering_at))
                    return (
                      <Link key={plant.id} to={`/plants/${plant.id}`}
                        className={`flex items-center gap-3 px-5 py-3 hover:bg-card transition-colors ${i < room.plants.length-1 ? 'border-b border-border' : ''}`}>
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-card flex-shrink-0 border border-border">
                          {plant.cover_photo_path
                            ? <img src={plant.cover_photo_path} alt="" className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">🌿</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-jet truncate">{plant.common_name}</p>
                          {plant.difficulty && <p className="text-xs text-dust">{plant.difficulty}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {overdue  && <span className="text-xs text-crimson font-medium flex items-center gap-1"><Droplets size={10}/> Overdue</span>}
                          {dueToday && <span className="text-xs text-gold font-medium flex items-center gap-1"><Droplets size={10}/> Today</span>}
                          {plant.health_score != null && (
                            <span className={`text-xs font-medium ${plant.health_score>=8?'text-grove':plant.health_score>=5?'text-gold':'text-crimson'}`}>♥ {plant.health_score}</span>
                          )}
                          <ChevronRight size={13} className="text-dust" />
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
