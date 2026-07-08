import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-2 border-color-accent-pink animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-color-accent-pink animate-pulse" />
        </div>
      </div>
      <p className="text-white/40 font-black uppercase tracking-[0.3em] animate-pulse">
        Iniciando Motor de IA...
      </p>
    </div>
  )
}
