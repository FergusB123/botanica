import { Link } from 'react-router-dom'
import { Droplets, AlertCircle, Zap } from 'lucide-react'
import { formatDistanceToNow, isPast, isToday } from 'date-fns'
import HealthBadge from './HealthBadge'

// Full-bleed grid card — photo IS the card, text floats over it
export function PlantCardGrid({ plant }) {
  const overdue  = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))
  const dueToday = plant.next_watering_at && isToday(new Date(plant.next_watering_at))

  let waterLabel = null
  if (overdue)   waterLabel = { text: 'Overdue',    bg: 'bg-ember',      textCol: 'text-white'         }
  if (dueToday)  waterLabel = { text: 'Water today', bg: 'bg-yellow-400', textCol: 'text-[#070A07]'     }

  const nextStr = plant.next_watering_at && !overdue && !dueToday
    ? formatDistanceToNow(new Date(plant.next_watering_at), { addSuffix: true })
    : null

  return (
    <Link to={`/plants/${plant.id}`} className="group block">
      {/* Card = photo only, info overlaid */}
      <div className="relative rounded-2xl overflow-hidden bg-surface border border-white/[0.05]"
           style={{ aspectRatio: '3/4' }}>

        {/* Photo layer */}
        {plant.cover_photo_path ? (
          <img src={plant.cover_photo_path} alt={plant.common_name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#0D1A0D,#131A13)' }}>
            <span className="text-6xl opacity-10">🌿</span>
          </div>
        )}

        {/* Gradient scrim — bottom */}
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)' }} />

        {/* Top right — urgency pill */}
        {waterLabel && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${waterLabel.bg} ${waterLabel.textCol}`}>
              <Droplets size={9} strokeWidth={2.5} /> {waterLabel.text}
            </span>
          </div>
        )}

        {/* Top left — health score */}
        {plant.health_score != null && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border
              ${plant.health_score >= 8 ? 'bg-volt/20 text-volt border-volt/30'
                : plant.health_score >= 5 ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30'
                : 'bg-ember/20 text-ember border-ember/30'}`}>
              ♥ {plant.health_score}
            </span>
          </div>
        )}

        {/* Bottom overlay — plant info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {plant.room && plant.room !== 'Unassigned' && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 font-sans">{plant.room}</p>
          )}
          <h3 className="font-display font-bold text-white leading-tight text-lg mb-1.5 line-clamp-2">
            {plant.common_name}
          </h3>
          <div className="flex items-center justify-between">
            {nextStr ? (
              <span className="text-xs text-white/40 font-sans flex items-center gap-1">
                <Droplets size={10} /> {nextStr}
              </span>
            ) : (
              <span />
            )}
            {plant.difficulty && (
              <span className="text-[10px] font-bold text-white/30 font-sans uppercase tracking-wider">{plant.difficulty}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// List card — horizontal, more info visible
export function PlantCardList({ plant }) {
  const overdue  = plant.next_watering_at && isPast(new Date(plant.next_watering_at)) && !isToday(new Date(plant.next_watering_at))
  const dueToday = plant.next_watering_at && isToday(new Date(plant.next_watering_at))

  return (
    <Link to={`/plants/${plant.id}`} className="group block">
      <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/[0.05] hover:border-volt/20 transition-all duration-200 bg-surface">
        {/* Square photo */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-raised">
          {plant.cover_photo_path
            ? <img src={plant.cover_photo_path} alt={plant.common_name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl opacity-15">🌿</div>
          }
          {overdue  && <div className="absolute inset-0 ring-2 ring-ember/60 ring-inset rounded-xl" />}
          {dueToday && <div className="absolute inset-0 ring-2 ring-yellow-400/60 ring-inset rounded-xl" />}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-white text-base leading-tight truncate">{plant.common_name}</h3>
          <p className="text-xs italic text-white/30 font-sans truncate mt-0.5">{plant.scientific_name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {plant.room && plant.room !== 'Unassigned' && (
              <span className="text-[10px] text-white/25 font-sans">{plant.room}</span>
            )}
            {plant.difficulty && (
              <span className="text-[10px] text-white/25 font-sans">{plant.difficulty}</span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {overdue  && <span className="text-xs text-ember font-bold flex items-center gap-1"><AlertCircle size={11} /> Overdue</span>}
          {dueToday && <span className="text-xs text-yellow-400 font-bold flex items-center gap-1"><Droplets size={11} /> Today</span>}
          {!overdue && !dueToday && plant.next_watering_at && (
            <span className="text-xs text-white/25 font-sans">{formatDistanceToNow(new Date(plant.next_watering_at), { addSuffix: true })}</span>
          )}
          {plant.health_score != null && <HealthBadge score={plant.health_score} />}
        </div>
      </div>
    </Link>
  )
}
