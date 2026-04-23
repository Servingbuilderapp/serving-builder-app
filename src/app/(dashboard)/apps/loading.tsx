import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-2 border-color-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-black text-color-primary text-2xl italic">S</span>
        </div>
      </div>
      <p className="text-white/40 font-black uppercase tracking-[0.3em] animate-pulse">
        Cargando Motores...
      </p>
    </div>
  )
}
