export default function HealthBadge({ score, urgency, size = 'sm' }) {
  const lg = size === 'lg'
  if (urgency) {
    const map = {
      Healthy: { cls: 'bg-leaf-bg text-grove border border-leaf/20',     label: 'Healthy' },
      Monitor: { cls: 'bg-gold-bg text-gold border border-gold/20',       label: 'Monitor' },
      Urgent:  { cls: 'bg-crimson-bg text-crimson border border-crimson/20', label: 'Urgent' },
    }
    const s = map[urgency] || map.Healthy
    return (
      <span className={`badge ${s.cls} ${lg ? 'text-sm px-3 py-1' : ''}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${urgency === 'Healthy' ? 'bg-leaf' : urgency === 'Urgent' ? 'bg-crimson' : 'bg-gold'}`} />
        {s.label}
      </span>
    )
  }
  if (score != null) {
    const cls = score >= 8 ? 'bg-leaf-bg text-grove border border-leaf/20'
      : score >= 5 ? 'bg-gold-bg text-gold border border-gold/20'
      : 'bg-crimson-bg text-crimson border border-crimson/20'
    return <span className={`badge ${cls} ${lg ? 'text-sm px-3 py-1' : ''}`}>♥ {score}/10</span>
  }
  return null
}
