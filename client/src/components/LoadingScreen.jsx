export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-border animate-spin border-t-jet" />
      </div>
      <p className="font-display text-base text-dust italic">{message}</p>
    </div>
  )
}
