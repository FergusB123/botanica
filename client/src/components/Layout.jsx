import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-void flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-white/[0.04] py-6 text-center">
        <p className="font-sans text-xs text-white/20">Botanica — Your personal plant care companion 🌿</p>
      </footer>
    </div>
  )
}
