import React from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CURSOS_ACADEMIA, precioUSDTexto } from '@/lib/academia/cursos'

export const dynamic = 'force-dynamic'

export default async function AcademiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let cursosComprados = new Set<string>()
  if (user?.email) {
    const { data: compras } = await supabase
      .from('academia_compras')
      .select('curso')
      .eq('correo_cliente', user.email)
      .eq('estado', 'pagado')
    cursosComprados = new Set((compras || []).map((c) => c.curso))
  }

  return (
    <div className="min-h-screen bg-color-base-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-color-base-content">
            Academia
          </h1>
          <p className="text-color-base-content/60 text-sm max-w-xl mx-auto">
            Cursos para entender, a tu ritmo, las dos partes que sostienen cualquier
            proyecto que busca financiación: cómo se estructura y cómo se formula.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {CURSOS_ACADEMIA.map((curso) => {
            const yaEsTuyo = cursosComprados.has(curso.slug)
            return (
              <div
                key={curso.slug}
                className="glass-card overflow-hidden p-7 flex flex-col gap-5"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-color-base-content">{curso.nombre}</h2>
                  <p className="text-color-base-content/60 text-sm">{curso.resumen}</p>
                </div>

                {!yaEsTuyo && (
                  <div className="text-2xl font-black text-color-primary">
                    {precioUSDTexto(curso)}
                    <span className="text-xs font-bold text-color-base-content/50 ml-1">pago único</span>
                  </div>
                )}

                <ul className="space-y-2 flex-1">
                  {curso.incluye.map((linea) => (
                    <li key={linea} className="flex items-start gap-2 text-sm text-color-base-content/80">
                      <CheckCircle2 className="h-4 w-4 text-color-accent-pink shrink-0 mt-0.5" />
                      <span>{linea}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/academia/${curso.slug}`}
                  className="relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200 active:scale-[0.98] bg-gradient-to-b from-[#C39F68] to-[#A8804B] text-[#3A1420] border border-[#8A6636] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_-10px_rgba(0,0,0,0.5)] hover:from-[#CDAC79] hover:to-[#B08D57] w-full"
                >
                  {yaEsTuyo ? 'Ya es tuyo — entrar al curso' : 'Ver curso'}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
