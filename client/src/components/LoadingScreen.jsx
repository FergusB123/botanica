export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-forest/20 animate-spin border-t-forest" />
        <div className="absolute inset-3 flex items-center justify-center text-2xl animate-pulse-gentle">
          🌿
        </div>
      </div>
      <p className="font-serif text-lg text-bark/60 italic">{message}</p>
    </div>
  )
}
