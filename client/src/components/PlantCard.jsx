import { Link } from 'react-router-dom'
import { Droplets, Sun, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, isPast, isToday } from 'date-fns'
import HealthBadge from './HealthBadge'

function WateringStatus({ nextWateringAt }) {
  if (!nextWateringAt) return null
  const date = new Date(nextWateringAt)
  const overdue = isPast(date) && !isToday(date)
  const dueToday = isToday(date)

  if (overdue) return (
    <span className="flex items-center gap-1 text-xs text-terra-600 font-medium">
      <AlertCircle size={12} />
      Overdue
    </span>
  )
  if (dueToday) return (
    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
      <Droplets size={12} />
      Water today
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs text-bark/50">
      <Droplets size={12} />
      {formatDistanceToNow(date, { addSuffix: true })}
    </span>
  )
}

export function PlantCardGrid({ plant }) {
  const overdue = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))

  return (
    <Link to={`/plants/${plant.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-soft border border-stone-100 overflow-hidden hover:shadow-card transition-all duration-200 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] bg-forest-50 overflow-hidden">
          {plant.cover_photo_path ? (
            <img
              src={plant.cover_photo_path}
              alt={plant.common_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🌿</div>
          )}
          {overdue && (
            <div className="absolute top-2 right-2">
              <span className="badge bg-terra-500 text-white shadow-sm">
                <Droplets size={10} /> Overdue
              </span>
            </div>
          )}
          {isToday(new Date(plant.next_watering_at)) && !overdue && (
            <div className="absolute top-2 right-2">
              <span className="badge bg-amber-500 text-white shadow-sm">
                <Droplets size={10} /> Today
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-bark leading-tight mb-0.5 truncate">
            {plant.common_name}
          </h3>
          {plant.scientific_name && (
            <p className="text-xs font-sans italic text-bark/50 mb-2 truncate">{plant.scientific_name}</p>
          )}
          <div className="flex items-center justify-between">
            <WateringStatus nextWateringAt={plant.next_watering_at} />
            {plant.health_score != null && <HealthBadge score={plant.health_score} />}
          </div>
          {plant.room && plant.room !== 'Unassigned' && (
            <p className="text-xs text-bark/40 font-sans mt-1.5">{plant.room}</p>
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
      <div className="bg-white rounded-2xl shadow-soft border border-stone-100 p-4 flex gap-4 items-center hover:shadow-card transition-all duration-200">
        <div className="w-16 h-16 rounded-xl bg-forest-50 overflow-hidden flex-shrink-0">
          {plant.cover_photo_path ? (
            <img src={plant.cover_photo_path} alt={plant.common_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🌿</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-serif text-base font-semibold text-bark truncate">{plant.common_name}</h3>
              {plant.scientific_name && <p className="text-xs italic text-bark/50 truncate">{plant.scientific_name}</p>}
            </div>
            {plant.health_score != null && <HealthBadge score={plant.health_score} />}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <WateringStatus nextWateringAt={plant.next_watering_at} />
            {plant.room && plant.room !== 'Unassigned' && (
              <span className="text-xs text-bark/40">{plant.room}</span>
            )}
            {plant.difficulty && (
              <span className="text-xs text-bark/40">{plant.difficulty}</span>
            )}
          </div>
        </div>
        {overdue && (
          <div className="w-2 h-2 rounded-full bg-terra-500 flex-shrink-0 self-start mt-2" />
        )}
      </div>
    </Link>
  )
}
