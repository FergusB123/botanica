import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Droplets, Heart, Bell, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function NotificationPanel({ notifications, unreadCount, onClose, onUpdate }) {
  const ref = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose])

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); onUpdate() } catch { }
  }
  const markAllRead = async () => {
    try { await api.put('/notifications/read-all'); onUpdate(); toast.success('All read') } catch { }
  }
  const markWatered = async (plantId, notifId) => {
    try {
      await api.post(`/plants/${plantId}/water`)
      await api.put(`/notifications/${notifId}/read`)
      onUpdate(); toast.success('Plant watered 💧')
    } catch { toast.error('Failed') }
  }

  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-2 w-88 bg-white border border-border rounded-xl shadow-lifted z-50 overflow-hidden animate-slide-up"
      style={{ width: 368 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-display text-base text-jet">Notifications</span>
          {unreadCount > 0 && (
            <span className="badge bg-jet text-white text-xs">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-dust hover:text-ink flex items-center gap-1 transition-colors">
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-ghost rounded-lg transition-colors">
            <X size={14} className="text-dust" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={24} className="text-ghost mx-auto mb-2" />
            <p className="text-sm text-dust font-sans">You're all caught up</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`px-5 py-3.5 border-b border-border last:border-0 ${!n.read ? 'bg-card' : ''}`}>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-ghost flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n.type === 'watering_reminder' ? <Droplets size={13} className="text-cerulean" /> : <Heart size={13} className="text-crimson" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-sans leading-snug">{n.message}</p>
                  <p className="text-xs text-dust mt-0.5">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  {n.type === 'watering_reminder' && n.plant_id && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => markWatered(n.plant_id, n.id)}
                        className="text-xs bg-cerulean-bg text-cerulean border border-cerulean/20 px-2.5 py-1 rounded-full hover:bg-cerulean/10 transition-colors font-medium">
                        💧 Mark watered
                      </button>
                      <Link to={`/plants/${n.plant_id}`} onClick={onClose}
                        className="text-xs text-dust hover:text-ink px-2.5 py-1 rounded-full hover:bg-ghost transition-colors">
                        View
                      </Link>
                    </div>
                  )}
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="p-1 hover:bg-ghost rounded transition-colors flex-shrink-0" title="Mark read">
                    <Check size={12} className="text-dust" />
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
