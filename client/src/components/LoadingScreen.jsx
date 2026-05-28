export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-volt/20 animate-spin border-t-volt" />
        <div className="absolute inset-3 flex items-center justify-center text-xl animate-pulse-gentle">🌿</div>
      </div>
      <p className="font-display text-base text-white/40">{message}</p>
    </div>
  )
}
