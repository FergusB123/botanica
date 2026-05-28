import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Droplets, Heart, Bell, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

const TYPE_ICONS = {
  watering_reminder: <Droplets size={15} className="text-volt" />,
  health_alert:      <Heart size={15} className="text-ember" />,
}

export default function NotificationPanel({ notifications, unreadCount, onClose, onUpdate }) {
  const panelRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); onUpdate() } catch { }
  }

  const markAllRead = async () => {
    try { await api.put('/notifications/read-all'); onUpdate(); toast.success('All read') } catch { toast.error('Failed') }
  }

  const markWatered = async (plantId, notifId) => {
    try {
      await api.post(`/plants/${plantId}/water`)
      await api.put(`/notifications/${notifId}/read`)
      onUpdate()
      toast.success('Plant watered 💧')
    } catch { toast.error('Failed') }
  }

  return (
    <div ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-surface border border-white/[0.08] rounded-2xl shadow-lifted z-50 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-volt" />
          <h3 className="font-display text-base font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="badge bg-volt/10 text-volt border border-volt/20 text-xs">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
            <X size={15} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-sm text-white/30 font-sans">All caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id}
              className={`px-5 py-4 border-b border-white/[0.04] last:border-0 transition-colors ${!n.read ? 'bg-volt/[0.03]' : ''}`}>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || <Bell size={14} className="text-white/30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-sans leading-snug">{n.message}</p>
                  <p className="text-xs text-white/25 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                  {n.type === 'watering_reminder' && n.plant_id && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => markWatered(n.plant_id, n.id)}
                        className="text-xs bg-volt/10 text-volt border border-volt/20 px-3 py-1 rounded-full hover:bg-volt/20 transition-colors font-semibold">
                        💧 Mark watered
                      </button>
                      <Link to={`/plants/${n.plant_id}`} onClick={onClose}
                        className="text-xs text-white/30 hover:text-white/60 px-3 py-1 rounded-full hover:bg-white/5 transition-colors">
                        View plant
                      </Link>
                    </div>
                  )}
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0" title="Mark as read">
                    <Check size={13} className="text-white/25" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
