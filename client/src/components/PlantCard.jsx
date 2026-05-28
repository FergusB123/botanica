import { Link } from 'react-router-dom'
import { Droplets, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, isPast, isToday } from 'date-fns'
import HealthBadge from './HealthBadge'

function WateringStatus({ nextWateringAt }) {
  if (!nextWateringAt) return null
  const date = new Date(nextWateringAt)
  const overdue = isPast(date) && !isToday(date)
  const dueToday = isToday(date)
  if (overdue) return (
    <span className="flex items-center gap-1 text-xs text-ember font-semibold">
      <AlertCircle size={11} /> Overdue
    </span>
  )
  if (dueToday) return (
    <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
      <Droplets size={11} /> Water today
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs text-white/30">
      <Droplets size={11} /> {formatDistanceToNow(date, { addSuffix: true })}
    </span>
  )
}

export function PlantCardGrid({ plant }) {
  const overdue = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))
  const dueToday = plant.next_watering_at && isToday(new Date(plant.next_watering_at))

  return (
    <Link to={`/plants/${plant.id}`} className="group block">
      <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden hover:border-volt/20 hover:shadow-volt transition-all duration-300 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] bg-raised overflow-hidden">
          {plant.cover_photo_path ? (
            <img src={plant.cover_photo_path} alt={plant.common_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🌿</div>
          )}
          {(overdue || dueToday) && (
            <div className="absolute top-2.5 right-2.5">
              <span className={`badge text-xs font-bold ${overdue ? 'bg-ember/90 text-white' : 'bg-yellow-400/90 text-[#070A07]'}`}>
                <Droplets size={9} /> {overdue ? 'Overdue' : 'Today'}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display text-base font-bold text-white leading-tight mb-0.5 truncate">
            {plant.common_name}
          </h3>
          {plant.scientific_name && (
            <p className="text-xs font-sans italic text-white/30 mb-2.5 truncate">{plant.scientific_name}</p>
          )}
          <div className="flex items-center justify-between">
            <WateringStatus nextWateringAt={plant.next_watering_at} />
            {plant.health_score != null && <HealthBadge score={plant.health_score} />}
          </div>
          {plant.room && plant.room !== 'Unassigned' && (
            <p className="text-xs text-white/25 font-sans mt-1.5">{plant.room}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export function PlantCardList({ plant }) {
  const overdue = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))

  return (
    <Link to={`/plants/${plant.id}`} className="group block">
      <div className="bg-surface border border-white/[0.06] rounded-2xl p-4 flex gap-4 items-center hover:border-volt/20 transition-all duration-200">
        <div className="w-14 h-14 rounded-xl bg-raised overflow-hidden flex-shrink-0">
          {plant.cover_photo_path
            ? <img src={plant.cover_photo_path} alt={plant.common_name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🌿</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-white truncate">{plant.common_name}</h3>
              {plant.scientific_name && <p className="text-xs italic text-white/30 truncate">{plant.scientific_name}</p>}
            </div>
            {plant.health_score != null && <HealthBadge score={plant.health_score} />}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <WateringStatus nextWateringAt={plant.next_watering_at} />
            {plant.room && plant.room !== 'Unassigned' && (
              <span className="text-xs text-white/25">{plant.room}</span>
            )}
            {plant.difficulty && <span className="text-xs text-white/25">{plant.difficulty}</span>}
          </div>
        </div>
        {overdue && <div className="w-2 h-2 rounded-full bg-ember flex-shrink-0 self-start mt-2" />}
      </div>
    </Link>
  )
}
