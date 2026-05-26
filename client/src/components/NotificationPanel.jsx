import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Droplets, Heart, Bell, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

const TYPE_ICONS = {
  watering_reminder: <Droplets size={16} className="text-sage-500" />,
  health_alert: <Heart size={16} className="text-terra-500" />,
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
    try {
      await api.put(`/notifications/${id}/read`)
      onUpdate()
    } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      onUpdate()
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to update notifications')
    }
  }

  const markWatered = async (plantId, notifId) => {
    try {
      await api.post(`/plants/${plantId}/water`)
      await api.put(`/notifications/${notifId}/read`)
      onUpdate()
      toast.success('Plant marked as watered 💧')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-lifted border border-stone-100 z-50 overflow-hidden animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-forest" />
          <h3 className="font-serif text-lg font-semibold text-bark">Notifications</h3>
          {unreadCount > 0 && (
            <span className="badge bg-terra-100 text-terra-700">{unreadCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-bark/50 hover:text-bark flex items-center gap-1 transition-colors">
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors">
            <X size={16} className="text-bark/50" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[440px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-sm text-bark/50 font-sans">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`px-5 py-4 border-b border-stone-50 last:border-0 transition-colors ${!n.read ? 'bg-forest-50/40' : ''}`}
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || <Bell size={16} className="text-bark/50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bark font-sans leading-snug">{n.message}</p>
                  <p className="text-xs text-bark/40 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                  {n.type === 'watering_reminder' && n.plant_id && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => markWatered(n.plant_id, n.id)}
                        className="text-xs bg-sage-100 text-sage-700 px-3 py-1 rounded-full hover:bg-sage-200 transition-colors font-medium"
                      >
                        💧 Mark watered
                      </button>
                      {n.plant_id && (
                        <Link
                          to={`/plants/${n.plant_id}`}
                          onClick={onClose}
                          className="text-xs text-bark/50 hover:text-bark px-3 py-1 rounded-full hover:bg-stone-100 transition-colors"
                        >
                          View plant
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="p-1 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check size={14} className="text-bark/40" />
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
