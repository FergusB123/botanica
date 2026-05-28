import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { PlantCardGrid, PlantCardList } from '../components/PlantCard'
import EmptyState from '../components/EmptyState'
import api from '../api/client'
import toast from 'react-hot-toast'

const ROOMS = ['All rooms', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Outdoors', 'Balcony', 'Hallway', 'Unassigned']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard', 'Expert']
const SORT_OPTIONS = [
  { value: 'recently_added', label: 'Recently added' },
  { value: 'next_watering',  label: 'Next watering'  },
  { value: 'name',           label: 'Name A–Z'       },
  { value: 'health',         label: 'Health score'   },
]

export default function MyPlants() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [filterRoom, setFilterRoom] = useState('All rooms')
  const [filterDiff, setFilterDiff] = useState('All')
  const [sort, setSort] = useState('recently_added')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const params = { sort }
      if (filterRoom !== 'All rooms') params.room = filterRoom
      if (filterDiff !== 'All') params.difficulty = filterDiff
      const res = await api.get('/plants', { params })
      setPlants(res.data.plants)
    } catch { toast.error('Failed to load plants') }
    finally { setLoading(false) }
  }, [filterRoom, filterDiff, sort])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? plants.filter(p => p.common_name.toLowerCase().includes(search.toLowerCase()) || p.scientific_name?.toLowerCase().includes(search.toLowerCase()))
    : plants

  const hasFilters = filterRoom !== 'All rooms' || filterDiff !== 'All'
  const resetFilters = () => { setFilterRoom('All rooms'); setFilterDiff('All') }

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-surface rounded-xl w-48" />
      <div className="h-12 bg-surface rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-surface rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">My Plants</h1>
          <p className="text-sm text-white/30 font-sans mt-0.5">{plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your collection</p>
        </div>
        <Link to="/plants/add" className="btn-primary flex items-center gap-2">
          <Plus size={15} strokeWidth={2.5} /> Add plant
        </Link>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input pl-10 py-2.5" placeholder="Search plants…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={13} />
            </button>
          )}
        </div>

        <button onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${hasFilters ? 'border-volt bg-volt/10 text-volt' : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'}`}>
          <SlidersHorizontal size={14} /> Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-volt" />}
        </button>

        <select className="input w-auto py-2.5 text-sm bg-surface" value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          <button onClick={() => setView('grid')}
            className={`px-3 py-2.5 transition-colors ${view === 'grid' ? 'bg-volt text-[#070A07]' : 'text-white/30 hover:bg-white/5'}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setView('list')}
            className={`px-3 py-2.5 transition-colors ${view === 'list' ? 'bg-volt text-[#070A07]' : 'text-white/30 hover:bg-white/5'}`}>
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card border-volt/10 flex gap-6 flex-wrap items-end animate-slide-up"
          style={{ background: 'rgba(74,222,128,0.03)' }}>
          <div>
            <label className="label">Room</label>
            <select className="input py-2 text-sm w-44 bg-surface" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
              {ROOMS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input py-2 text-sm w-36 bg-surface" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-ember font-semibold hover:underline mb-px">
              <X size={13} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        plants.length === 0 ? (
          <EmptyState icon="🌱" title="No plants yet"
            description="Add your first plant to start building your collection"
            actionTo="/plants/add" actionLabel="Add your first plant" />
        ) : (
          <EmptyState icon="🔍" title="No results"
            description={`Nothing matches "${search || 'the selected filters'}"`}
            action={hasFilters ? resetFilters : () => setSearch('')} actionLabel="Clear" />
        )
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <PlantCardGrid key={p.id} plant={p} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => <PlantCardList key={p.id} plant={p} />)}
        </div>
      )}
    </div>
  )
}
