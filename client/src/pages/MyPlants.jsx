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
  { value: 'next_watering', label: 'Next watering' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'health', label: 'Health score' },
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
    } catch {
      toast.error('Failed to load plants')
    } finally {
      setLoading(false)
    }
  }, [filterRoom, filterDiff, sort])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? plants.filter(p =>
        p.common_name.toLowerCase().includes(search.toLowerCase()) ||
        p.scientific_name?.toLowerCase().includes(search.toLowerCase())
      )
    : plants

  const hasFilters = filterRoom !== 'All rooms' || filterDiff !== 'All'

  const resetFilters = () => { setFilterRoom('All rooms'); setFilterDiff('All') }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-stone-100 rounded-xl w-48" />
        <div className="h-12 bg-stone-100 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-stone-100 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">My Plants</h1>
          <p className="text-sm text-bark/50 font-sans mt-0.5">{plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your collection</p>
        </div>
        <Link to="/plants/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add plant
        </Link>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark/40" />
          <input
            className="input pl-9 py-2.5"
            placeholder="Search plants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-bark/40 hover:text-bark">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium font-sans transition-colors ${hasFilters ? 'border-forest bg-forest text-white' : 'border-stone-200 text-bark/70 hover:border-forest/40'}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-white/70" />}
        </button>

        <select
          className="input w-auto py-2.5 text-sm"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* View toggle */}
        <div className="flex rounded-xl border border-stone-200 overflow-hidden">
          <button onClick={() => setView('grid')} className={`px-3 py-2.5 transition-colors ${view === 'grid' ? 'bg-forest text-white' : 'text-bark/50 hover:bg-stone-50'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView('list')} className={`px-3 py-2.5 transition-colors ${view === 'list' ? 'bg-forest text-white' : 'text-bark/50 hover:bg-stone-50'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card border-forest-100 bg-forest-50/50 flex gap-6 flex-wrap items-end animate-slide-up">
          <div>
            <label className="label">Room</label>
            <select className="input py-2 text-sm w-44" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
              {ROOMS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input py-2 text-sm w-36" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-terra font-medium hover:underline mb-px">
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        plants.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="No plants yet"
            description="Add your first plant to start building your collection"
            actionTo="/plants/add"
            actionLabel="Add your first plant"
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No results found"
            description={`No plants match "${search || 'the selected filters'}"`}
            action={hasFilters ? resetFilters : () => setSearch('')}
            actionLabel="Clear search"
          />
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
