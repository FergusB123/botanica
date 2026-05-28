import { Link } from 'react-router-dom'
import { Droplets, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, isPast, isToday } from 'date-fns'
import HealthBadge from './HealthBadge'

function WateringLine({ nextWateringAt }) {
  if (!nextWateringAt) return null
  const date     = new Date(nextWateringAt)
  const overdue  = isPast(date) && !isToday(date)
  const dueToday = isToday(date)
  if (overdue)   return <span className="flex items-center gap-1 text-xs text-crimson font-medium"><AlertCircle size={11} /> Overdue</span>
  if (dueToday)  return <span className="flex items-center gap-1 text-xs text-gold font-medium"><Droplets size={11} /> Water today</span>
  return <span className="flex items-center gap-1 text-xs text-dust"><Droplets size={11} /> {formatDistanceToNow(date, { addSuffix: true })}</span>
}

// ── Grid card: square photo, clean text panel below ──────────────────────────
export function PlantCardGrid({ plant }) {
  const overdue  = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))
  const dueToday = plant.next_watering_at && isToday(new Date(plant.next_watering_at))

  return (
    <Link to={`/plants/${plant.id}`} className="group block">
      <div className={`bg-white rounded-xl border overflow-hidden hover:shadow-card transition-all duration-200 hover:-translate-y-0.5
        ${overdue ? 'border-crimson/20' : 'border-border'}`}>

        {/* Photo */}
        <div className="relative aspect-square bg-card overflow-hidden">
          {plant.cover_photo_path ? (
            <img src={plant.cover_photo_path} alt={plant.common_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-15">🌿</span>
            </div>
          )}
          {/* Urgency indicator — top left dot */}
          {(overdue || dueToday) && (
            <div className="absolute top-3 left-3">
              <span className={`w-2 h-2 rounded-full block ring-2 ring-white ${overdue ? 'bg-crimson' : 'bg-gold'}`} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-4 py-3.5">
          <h3 className="font-display text-base text-jet leading-tight mb-0.5 line-clamp-1">{plant.common_name}</h3>
          {plant.scientific_name && (
            <p className="text-xs italic text-dust font-sans mb-2.5 line-clamp-1">{plant.scientific_name}</p>
          )}
          <div className="flex items-center justify-between">
            <WateringLine nextWateringAt={plant.next_watering_at} />
            {plant.health_score != null && <HealthBadge score={plant.health_score} />}
          </div>
          {plant.room && plant.room !== 'Unassigned' && (
            <p className="text-xs text-dust/70 font-sans mt-1.5">{plant.room}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── List card: horizontal ─────────────────────────────────────────────────────
export function PlantCardList({ plant }) {
  const overdue = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))

  return (
    <Link to={`/plants/${plant.id}`} className="group block">
      <div className="bg-white border border-border rounded-xl p-4 flex gap-4 items-center hover:border-border-strong hover:shadow-soft transition-all duration-150">
        <div className="w-14 h-14 rounded-lg bg-card overflow-hidden flex-shrink-0">
          {plant.cover_photo_path
            ? <img src={plant.cover_photo_path} alt={plant.common_name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xl opacity-15">🌿</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-base text-jet truncate">{plant.common_name}</h3>
              {plant.scientific_name && <p className="text-xs italic text-dust truncate">{plant.scientific_name}</p>}
            </div>
            {plant.health_score != null && <HealthBadge score={plant.health_score} />}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <WateringLine nextWateringAt={plant.next_watering_at} />
            {plant.room && plant.room !== 'Unassigned' && <span className="text-xs text-dust">{plant.room}</span>}
            {plant.difficulty && <span className="text-xs text-dust">{plant.difficulty}</span>}
          </div>
        </div>
        {overdue && <div className="w-1.5 h-1.5 rounded-full bg-crimson flex-shrink-0" />}
      </div>
    </Link>
  )
}
