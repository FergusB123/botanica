import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Settings, Plus, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'
import api from '../api/client'

// Clean geometric leaf mark
function LeafMark({ className = '' }) {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" className={className}>
      <path d="M9 19V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M9 10C9 10 3 7.5 3 2.5C3 2.5 8 1.5 12 5C13.5 6.5 13 9.5 9 10Z" fill="currentColor"/>
      <path d="M9 10C12 8 15 5.5 14 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen]   = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [userOpen, setUserOpen]     = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)

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
    { to: '/',       label: 'Home',      exact: true },
    { to: '/plants', label: 'My Plants' },
    { to: '/rooms',  label: 'Rooms'     },
  ]

  const linkClass = ({ isActive }) =>
    `text-sm font-medium font-sans transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`

  return (
    <header className="bg-jet border-b border-white/[0.07] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 flex items-center justify-center">
              <LeafMark className="text-white" />
            </div>
            <span className="font-display text-lg text-white italic tracking-tight">Botanica</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.exact} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Link to="/plants/add"
              className="hidden sm:flex items-center gap-1.5 bg-white text-jet rounded-lg px-3.5 py-1.5 text-sm font-medium hover:bg-white/90 transition-colors">
              <Plus size={14} strokeWidth={2.5} />
              Add plant
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                <Bell size={16} className="text-white/60" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-leaf rounded-full" />
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
                onClick={() => setUserOpen(o => !o)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white/60">{user?.name?.split(' ')[0]}</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-border rounded-xl shadow-lifted py-1 z-50 animate-slide-up">
                  <Link to="/settings" onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-card transition-colors">
                    <Settings size={14} className="text-dust" /> Settings
                  </Link>
                  <hr className="my-1 border-border" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-crimson hover:bg-crimson-bg transition-colors">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <X size={17} className="text-white" /> : <Menu size={17} className="text-white/60" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-jet border-t border-white/[0.07] px-4 py-3 space-y-0.5 animate-slide-up">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact} onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-white bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              {item.label}
            </NavLink>
          ))}
          <Link to="/plants/add" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">
            <Plus size={13} /> Add Plant
          </Link>
          <hr className="border-white/[0.07] my-1" />
          <Link to="/settings" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5">
            <Settings size={13} /> Settings
          </Link>
          <button onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/5">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      )}
    </header>
  )
}
