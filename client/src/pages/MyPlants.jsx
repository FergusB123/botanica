import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { PlantCardGrid, PlantCardList } from '../components/PlantCard'
import EmptyState from '../components/EmptyState'
import api from '../api/client'
import toast from 'react-hot-toast'

const ROOMS = ['All rooms','Living Room','Bedroom','Kitchen','Bathroom','Office','Outdoors','Balcony','Hallway','Unassigned']
const DIFFS = ['All','Easy','Medium','Hard','Expert']
const SORTS = [{ value:'recently_added',label:'Recently added'},{ value:'next_watering',label:'Next watering'},{ value:'name',label:'Name A–Z'},{ value:'health',label:'Health score'}]

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
    } catch { toast.error('Failed to load plants') } finally { setLoading(false) }
  }, [filterRoom, filterDiff, sort])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? plants.filter(p => p.common_name.toLowerCase().includes(search.toLowerCase()) || p.scientific_name?.toLowerCase().includes(search.toLowerCase()))
    : plants
  const hasFilters = filterRoom !== 'All rooms' || filterDiff !== 'All'

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-card rounded-lg w-48 border border-border" />
      <div className="h-11 bg-card rounded-lg border border-border" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-card rounded-xl border border-border" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl text-jet">My Plants</h1>
          <p className="font-sans text-sm text-dust mt-1">{plants.length} {plants.length === 1 ? 'plant' : 'plants'}</p>
        </div>
        <Link to="/plants/add" className="btn-primary gap-1.5">
          <Plus size={14} strokeWidth={2.5} /> Add plant
        </Link>
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dust" />
          <input className="input pl-9 py-2.5" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dust hover:text-ink"><X size={13} /></button>}
        </div>
        <button onClick={() => setFiltersOpen(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${hasFilters ? 'bg-jet border-jet text-white' : 'bg-white border-border text-ink hover:border-border-strong'}`}>
          <SlidersHorizontal size={13} /> Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
        </button>
        <select className="input w-auto py-2.5 text-sm bg-white" value={sort} onChange={e => setSort(e.target.value)}>
          {SORTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="flex border border-border rounded-lg overflow-hidden bg-white">
          <button onClick={() => setView('grid')} className={`px-3 py-2.5 transition-colors ${view==='grid' ? 'bg-jet text-white' : 'text-dust hover:bg-card'}`}><LayoutGrid size={15}/></button>
          <button onClick={() => setView('list')} className={`px-3 py-2.5 transition-colors ${view==='list' ? 'bg-jet text-white' : 'text-dust hover:bg-card'}`}><List size={15}/></button>
        </div>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="flex gap-4 flex-wrap items-end bg-card border border-border rounded-xl p-4 animate-slide-up">
          <div><label className="label">Room</label>
            <select className="input py-2 text-sm w-44 bg-white" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
              {ROOMS.map(r => <option key={r}>{r}</option>)}
            </select></div>
          <div><label className="label">Difficulty</label>
            <select className="input py-2 text-sm w-36 bg-white" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              {DIFFS.map(d => <option key={d}>{d}</option>)}
            </select></div>
          {hasFilters && <button onClick={() => { setFilterRoom('All rooms'); setFilterDiff('All') }} className="text-sm text-crimson hover:underline flex items-center gap-1 mb-0.5"><X size={12}/> Clear</button>}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        plants.length === 0
          ? <EmptyState icon="🌱" title="No plants yet" description="Add your first plant to start building your collection" actionTo="/plants/add" actionLabel="Add your first plant" />
          : <EmptyState icon="🔍" title="Nothing found" description={`No plants match "${search || 'filters'}"`} action={() => { setSearch(''); setFilterRoom('All rooms'); setFilterDiff('All') }} actionLabel="Clear search" />
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
