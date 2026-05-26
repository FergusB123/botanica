import { Link } from 'react-router-dom'

export default function EmptyState({
  icon = '🌱',
  title,
  description,
  action,
  actionLabel,
  actionTo,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-forest-50 flex items-center justify-center mb-5 text-4xl">
        {icon}
      </div>
      <h3 className="font-serif text-2xl font-semibold text-bark mb-2">{title}</h3>
      {description && <p className="text-bark/60 font-sans text-sm max-w-xs mb-6">{description}</p>}
      {actionTo && (
        <Link to={actionTo} className="btn-primary">
          {actionLabel || 'Get started'}
        </Link>
      )}
      {action && !actionTo && (
        <button onClick={action} className="btn-primary">
          {actionLabel || 'Get started'}
        </button>
      )}
    </div>
  )
}
