import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Settings, Plus, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'
import api from '../api/client'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
    } catch { }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { to: '/', label: 'Home', exact: true },
    { to: '/plants', label: 'My Plants' },
    { to: '/rooms', label: 'Rooms' },
  ]

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold font-sans transition-colors duration-150 ${isActive ? 'text-volt' : 'text-white/50 hover:text-white'}`

  return (
    <header className="sticky top-0 z-40 bg-void/80 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center shadow-volt">
              <span className="text-[#070A07] text-base">🌿</span>
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">Botanica</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.exact} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/plants/add"
              className="hidden sm:flex items-center gap-1.5 bg-volt text-[#070A07] rounded-xl px-4 py-2 text-sm font-bold hover:bg-volt-dim transition-colors">
              <Plus size={14} strokeWidth={2.5} />
              Add plant
            </Link>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
                <Bell size={18} className="text-white/50" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-volt rounded-full" />
                )}
              </button>
              {notifOpen && (
                <NotificationPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onClose={() => setNotifOpen(false)}
                  onUpdate={fetchNotifications}
                />
              )}
            </div>

            {/* User menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-full bg-volt flex items-center justify-center text-[#070A07] text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-white/60">{user?.name?.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-white/[0.08] rounded-xl shadow-lifted py-1 z-50 animate-slide-up">
                  <Link to="/settings" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors">
                    <Settings size={15} /> Settings
                  </Link>
                  <hr className="my-1 border-white/[0.06]" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ember hover:bg-ember/10 transition-colors">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white/60" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.05] bg-void py-3 px-4 space-y-1 animate-slide-up">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact} onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive ? 'bg-volt/10 text-volt' : 'text-white/50 hover:bg-white/5 hover:text-white'}`
              }>
              {item.label}
            </NavLink>
          ))}
          <Link to="/plants/add" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white">
            <Plus size={14} /> Add Plant
          </Link>
          <hr className="border-white/[0.06] my-1" />
          <Link to="/settings" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white">
            <Settings size={14} /> Settings
          </Link>
          <button onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ember hover:bg-ember/10">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </header>
  )
}
