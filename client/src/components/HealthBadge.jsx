export default function HealthBadge({ score, urgency, size = 'sm' }) {
  if (urgency) {
    const map = {
      Healthy: { bg: 'bg-sage-100 text-sage-700', dot: 'bg-sage-500', label: 'Healthy' },
      Monitor:  { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Monitor' },
      Urgent:   { bg: 'bg-terra-100 text-terra-700', dot: 'bg-terra-500', label: 'Urgent' },
    }
    const s = map[urgency] || map.Healthy
    return (
      <span className={`badge ${s.bg} ${size === 'lg' ? 'text-sm px-3 py-1.5' : ''}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    )
  }

  if (score != null) {
    const color = score >= 8 ? 'bg-sage-100 text-sage-700' : score >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-terra-100 text-terra-700'
    return (
      <span className={`badge ${color} ${size === 'lg' ? 'text-sm px-3 py-1.5' : ''}`}>
        ♥ {score}/10
      </span>
    )
  }

  return null
}
