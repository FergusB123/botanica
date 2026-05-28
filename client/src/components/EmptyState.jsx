import { Link } from 'react-router-dom'

export default function EmptyState({ icon = '🌱', title, description, action, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-volt/10 border border-volt/20 flex items-center justify-center mb-5 text-3xl">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-white/40 font-sans text-sm max-w-xs mb-6">{description}</p>}
      {actionTo && <Link to={actionTo} className="btn-primary">{actionLabel || 'Get started'}</Link>}
      {action && !actionTo && <button onClick={action} className="btn-primary">{actionLabel || 'Get started'}</button>}
    </div>
  )
}
