export default function HealthBadge({ score, urgency, size = 'sm' }) {
  if (urgency) {
    const map = {
      Healthy: { bg: 'bg-volt/10 text-volt border border-volt/20',       dot: 'bg-volt',  label: 'Healthy' },
      Monitor: { bg: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20', dot: 'bg-yellow-400', label: 'Monitor' },
      Urgent:  { bg: 'bg-ember/10 text-ember border border-ember/20',    dot: 'bg-ember', label: 'Urgent'  },
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
    const style = score >= 8
      ? 'bg-volt/10 text-volt border border-volt/20'
      : score >= 5
        ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
        : 'bg-ember/10 text-ember border border-ember/20'
    return (
      <span className={`badge ${style} ${size === 'lg' ? 'text-sm px-3 py-1.5' : ''}`}>
        ♥ {score}/10
      </span>
    )
  }
  return null
}
