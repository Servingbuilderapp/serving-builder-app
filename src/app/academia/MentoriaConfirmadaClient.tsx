import React from 'react'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

const TELEFONO_WHATSAPP = '573123335966'
const MENSAJE_WHATSAPP = 'Hola, ya pagué la Mentoría de Estructuración. Quiero arrancar.'
const ENLACE_WHATSAPP = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`

/**
 * Se muestra en vez del lector de curso cuando el proyecto pagado es la
 * Mentoría — no hay contenido que leer, lo que sigue es que el equipo de
 * Serving contacte al cliente para arrancar el mes de acompañamiento.
 */
export function MentoriaConfirmadaClient() {
  return (
    <div className="min-h-screen bg-color-base-100 py-16 px-4">
      <div className="max-w-xl mx-auto">
        <GlassCard className="p-7 md:p-9 text-center space-y-5">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-color-primary/10 text-color-primary">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-black text-color-base-content">¡Tu Mentoría está confirmada!</h1>
            <p className="mt-2 text-sm text-color-base-content/70 leading-relaxed">
              El equipo de Serving te va a contactar para arrancar el mes de acompañamiento: dejar tu
              proyecto estructurado, buscar una convocatoria y hacer la postulación contigo.
            </p>
          </div>
          <a
            href={ENLACE_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:brightness-95"
          >
            <MessageCircle className="h-4 w-4" />
            Escribir al equipo para arrancar ya
          </a>
        </GlassCard>
      </div>
    </div>
  )
}
