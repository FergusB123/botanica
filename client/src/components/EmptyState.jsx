import { Link } from 'react-router-dom'

export default function EmptyState({ icon = '🌱', title, description, action, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 text-3xl">
        {icon}
      </div>
      <h3 className="font-display text-2xl text-jet mb-2">{title}</h3>
      {description && <p className="text-dust font-sans text-sm max-w-xs mb-6 leading-relaxed">{description}</p>}
      {actionTo   && <Link to={actionTo} className="btn-primary">{actionLabel || 'Get started'}</Link>}
      {action && !actionTo && <button onClick={action} className="btn-primary">{actionLabel || 'Get started'}</button>}
    </div>
  )
}
