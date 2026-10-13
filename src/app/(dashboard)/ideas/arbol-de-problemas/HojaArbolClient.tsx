'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Printer, Lightbulb, Network, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'

/**
 * Hoja de trabajo: Árbol de Problemas y Objetivos (versión propia de Serving).
 *
 * Vive dentro de la App de Ideas. Se llena en pantalla, sin IA y sin límite de
 * uso. Lo escrito se guarda solo en este navegador (no en la base de datos),
 * y al final se puede imprimir o guardar como PDF.
 */

type Hoja = {
  nombre: string
  responsable: string
  fecha: string
  territorio: string
  beneficiarios: string
  problema: string
  causasInd: string[]
  causasDir: string[]
  efectosDir: string[]
  efectosInd: string[]
  objetivo: string
  mediosInd: string[]
  mediosDir: string[]
  finesDir: string[]
  finesInd: string[]
}

const tres = () => ['', '', '']

const VACIA: Hoja = {
  nombre: '',
  responsable: '',
  fecha: '',
  territorio: '',
  beneficiarios: '',
  problema: '',
  causasInd: tres(),
  causasDir: tres(),
  efectosDir: tres(),
  efectosInd: tres(),
  objetivo: '',
  mediosInd: tres(),
  mediosDir: tres(),
  finesDir: tres(),
  finesInd: tres(),
}

const LLAVE = 'serving_hoja_arbol_v1'

type Parte = 0 | 1 | 2

const CAMPO =
  'w-full bg-color-base-content/5 border border-color-base-content/10 rounded-xl px-4 py-3 text-sm text-color-base-content focus:outline-none focus:border-color-primary/50 transition-all placeholder:text-color-base-content/30'

export default function HojaArbolClient() {
  const [hoja, setHoja] = useState<Hoja>(VACIA)
  const [parte, setParte] = useState<Parte>(0)
  const [listo, setListo] = useState(false)

  // Recuperar lo escrito antes (solo en este navegador).
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const guardado = window.localStorage.getItem(LLAVE)
        if (guardado) setHoja({ ...VACIA, ...JSON.parse(guardado) })
      } catch {
        /* si el navegador no deja guardar, la hoja funciona igual */
      }
      setListo(true)
    })
  }, [])

  // Guardar cada cambio.
  useEffect(() => {
    if (!listo) return
    try {
      window.localStorage.setItem(LLAVE, JSON.stringify(hoja))
    } catch {
      /* igual que arriba */
    }
  }, [hoja, listo])

  const texto = (campo: keyof Hoja, valor: string) => setHoja((h) => ({ ...h, [campo]: valor }))
  const lista = (campo: keyof Hoja, i: number, valor: string) =>
    setHoja((h) => {
      const copia = [...(h[campo] as string[])]
      copia[i] = valor
      return { ...h, [campo]: copia }
    })

  const empezarDeNuevo = () => {
    if (window.confirm('¿Borrar todo lo escrito y empezar de nuevo?')) {
      setHoja(VACIA)
      setParte(0)
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 py-12 px-6">
      {/* Encabezado */}
      <div className="space-y-4 print:hidden">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-color-base-content/50 hover:text-color-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a la App de Ideas
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-color-primary ml-3">
          <Network className="h-3 w-3" />
          Hoja de trabajo
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-color-base-content tracking-tight">
          Árbol de Problemas y Objetivos
        </h1>
        <p className="text-color-base-content/60 max-w-2xl font-medium">
          Una guía práctica de Serving para estructurar tu proyecto. Antes de dibujar el árbol, mira el panorama completo:
          el territorio, las personas y organizaciones que intervienen y lo que ya está pasando ahí. Los buenos proyectos
          nacen de entender el entorno, no solo la idea.
        </p>
      </div>

      {/* Título solo para la impresión */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-black">Árbol de Problemas y Objetivos — Serving</h1>
      </div>

      {/* Pestañas */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {['Datos y árbol de problemas', 'Árbol de objetivos', 'Resumen de tu proyecto'].map((t, i) => (
          <button
            key={t}
            onClick={() => setParte(i as Parte)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              parte === i
                ? 'bg-color-primary/15 border-color-primary/50 text-color-primary'
                : 'border-color-base-content/10 text-color-base-content/50 hover:text-color-base-content'
            }`}
          >
            {i + 1}. {t}
          </button>
        ))}
      </div>

      {/* PARTE 1 */}
      <div className={parte === 0 ? '' : 'hidden print:block'}>
        <GlassCard className="p-6 md:p-8 border-color-base-content/10 space-y-8">
          <Seccion titulo="Datos del proyecto">
            <div className="grid md:grid-cols-2 gap-4">
              <Etiquetado etiqueta="Nombre del proyecto">
                <input className={CAMPO} value={hoja.nombre} onChange={(e) => texto('nombre', e.target.value)} />
              </Etiquetado>
              <Etiquetado etiqueta="Responsable del proyecto">
                <input className={CAMPO} value={hoja.responsable} onChange={(e) => texto('responsable', e.target.value)} />
              </Etiquetado>
              <Etiquetado etiqueta="Fecha">
                <input type="date" className={CAMPO} value={hoja.fecha} onChange={(e) => texto('fecha', e.target.value)} />
              </Etiquetado>
              <Etiquetado etiqueta="Territorio o sector">
                <input className={CAMPO} value={hoja.territorio} onChange={(e) => texto('territorio', e.target.value)} />
              </Etiquetado>
            </div>
            <Etiquetado etiqueta="Beneficiarios (a quién ayuda tu proyecto)">
              <input className={CAMPO} value={hoja.beneficiarios} onChange={(e) => texto('beneficiarios', e.target.value)} />
            </Etiquetado>
          </Seccion>

          <Seccion titulo="Parte 1. Árbol de Problemas">
            <Ayuda>
              Muestra la situación negativa que existe hoy. El <strong>tronco</strong> es el problema central, las{' '}
              <strong>raíces</strong> son las causas (directas e indirectas) y las <strong>ramas</strong> son los efectos
              (directos e indirectos).
            </Ayuda>

            <Paso n={1} titulo="Define el problema central">
              <p className="text-xs text-color-base-content/60">
                Escribe en una frase clara qué está pasando, a quién y dónde. Ejemplo:{' '}
                <em>&ldquo;Pocos jóvenes participan en las actividades culturales de su comunidad.&rdquo;</em>
              </p>
            </Paso>

            <Paso n={2} titulo="Identifica causas y efectos">
              <p className="text-xs text-color-base-content/60">
                Llena el árbol de arriba hacia abajo: tres consecuencias a largo plazo, tres consecuencias inmediatas,
                el problema central, tres causas inmediatas y tres causas de fondo.
              </p>
            </Paso>

            <div className="space-y-3">
              <FilaArbol titulo="Efectos indirectos (consecuencias a largo plazo)" valores={hoja.efectosInd} onCambio={(i, v) => lista('efectosInd', i, v)} />
              <FilaArbol titulo="Efectos directos (consecuencias inmediatas)" valores={hoja.efectosDir} onCambio={(i, v) => lista('efectosDir', i, v)} />
              <div className="rounded-2xl border-2 border-color-primary/50 bg-color-primary/[0.06] p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">Problema central</p>
                <textarea
                  rows={2}
                  className={CAMPO + ' resize-none'}
                  value={hoja.problema}
                  onChange={(e) => texto('problema', e.target.value)}
                  placeholder="Qué está pasando, a quién y dónde"
                />
              </div>
              <FilaArbol titulo="Causas directas (causas inmediatas)" valores={hoja.causasDir} onCambio={(i, v) => lista('causasDir', i, v)} />
              <FilaArbol titulo="Causas indirectas (causas de fondo)" valores={hoja.causasInd} onCambio={(i, v) => lista('causasInd', i, v)} />
            </div>

            <Ayuda>
              <strong>Revisa la coherencia:</strong> cada causa debe llevar directamente al problema central, y cada
              efecto debe ser una consecuencia lógica de ese mismo problema. Si algo no conecta, no va en este árbol.
            </Ayuda>

            <div className="print:hidden">
              <GlowButton onClick={() => setParte(1)} className="gap-2 text-xs">
                Seguir al árbol de objetivos
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </Seccion>
        </GlassCard>
      </div>

      {/* PARTE 2 */}
      <div className={parte === 1 ? '' : 'hidden print:block'}>
        <GlassCard className="p-6 md:p-8 border-color-base-content/10 space-y-8">
          <Seccion titulo="Parte 2. Árbol de Objetivos">
            <Ayuda>
              Es el mismo árbol, pero en positivo: lo negativo se convierte en meta. Debajo de cada casilla te dejamos
              lo que escribiste en el árbol de problemas, para que lo pases a positivo.
            </Ayuda>

            <Paso n={3} titulo="Redacta los objetivos">
              <p className="text-xs text-color-base-content/60">
                <strong>Cómo se redacta el objetivo general:</strong> es el problema central dicho en positivo,
                empezando con un verbo en infinitivo (mejorar, fortalecer, promover, aumentar…). Ejemplo: de{' '}
                <em>&ldquo;Pocos jóvenes participan en las actividades culturales de su comunidad&rdquo;</em> a{' '}
                <em>&ldquo;Aumentar la participación de los jóvenes en las actividades culturales de su comunidad.&rdquo;</em>
              </p>
            </Paso>

            <div className="space-y-3">
              <FilaArbol titulo="Fines indirectos (impactos a largo plazo)" valores={hoja.finesInd} origen={hoja.efectosInd} onCambio={(i, v) => lista('finesInd', i, v)} />
              <FilaArbol titulo="Fines directos (resultados inmediatos)" valores={hoja.finesDir} origen={hoja.efectosDir} onCambio={(i, v) => lista('finesDir', i, v)} />
              <div className="rounded-2xl border-2 border-color-primary/50 bg-color-primary/[0.06] p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">Objetivo general</p>
                {hoja.problema.trim() && (
                  <p className="text-[11px] text-color-base-content/45">Tu problema central: {hoja.problema}</p>
                )}
                <textarea
                  rows={2}
                  className={CAMPO + ' resize-none'}
                  value={hoja.objetivo}
                  onChange={(e) => texto('objetivo', e.target.value)}
                  placeholder="Empieza con un verbo en infinitivo: aumentar, mejorar, fortalecer…"
                />
              </div>
              <FilaArbol titulo="Medios directos (objetivos específicos)" valores={hoja.mediosDir} origen={hoja.causasDir} onCambio={(i, v) => lista('mediosDir', i, v)} />
              <FilaArbol titulo="Medios indirectos (actividades principales)" valores={hoja.mediosInd} origen={hoja.causasInd} onCambio={(i, v) => lista('mediosInd', i, v)} />
            </div>

            <div className="rounded-2xl border border-color-base-content/10 p-4 space-y-1.5">
              <p className="text-xs font-black text-color-base-content">Cómo se pasa de un árbol al otro</p>
              <ul className="text-xs text-color-base-content/60 space-y-1 list-disc pl-5">
                <li>El problema central pasa a ser el objetivo general.</li>
                <li>Cada causa directa pasa a ser un medio directo (objetivo específico).</li>
                <li>Cada causa indirecta pasa a ser un medio indirecto (actividad).</li>
                <li>Cada efecto directo pasa a ser un fin directo (resultado inmediato).</li>
                <li>Cada efecto indirecto pasa a ser un fin indirecto (impacto a largo plazo).</li>
              </ul>
            </div>

            <div className="flex gap-3 print:hidden">
              <GlowButton variant="ghost" onClick={() => setParte(0)} className="gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </GlowButton>
              <GlowButton onClick={() => setParte(2)} className="gap-2 text-xs">
                Ver el resumen de mi proyecto
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </Seccion>
        </GlassCard>
      </div>

      {/* PARTE 3 */}
      <div className={parte === 2 ? '' : 'hidden print:block'}>
        <GlassCard className="p-6 md:p-8 border-color-base-content/10 space-y-6">
          <Seccion titulo="Parte 3. Cadena de valor del proyecto">
            <Ayuda>
              Con los dos árboles listos, tu proyecto queda resumido así. Esto lo armamos solo con lo que escribiste.
            </Ayuda>
            <div className="rounded-2xl border border-color-base-content/10 divide-y divide-color-base-content/10 overflow-hidden">
              <FilaResumen etiqueta="Título del proyecto" ayuda="Debe apuntar al problema central" valor={hoja.nombre} />
              <FilaResumen etiqueta="Objetivo general" ayuda="El problema central, escrito en positivo" valor={hoja.objetivo} />
              <FilaResumen etiqueta="Medios directos (objetivos específicos)" ayuda="Las grandes metas que dan estructura al proyecto" valor={hoja.mediosDir} />
              <FilaResumen etiqueta="Medios indirectos (actividades)" ayuda="Las acciones concretas para cumplir cada objetivo" valor={hoja.mediosInd} />
              <FilaResumen etiqueta="Fines directos" ayuda="Resultados inmediatos de las acciones" valor={hoja.finesDir} />
              <FilaResumen etiqueta="Fines indirectos" ayuda="Impactos duraderos y de largo alcance" valor={hoja.finesInd} />
            </div>

            <div className="rounded-2xl border border-color-primary/25 bg-color-primary/[0.06] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-color-primary shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">Para cerrar, tres preguntas</p>
              </div>
              <ol className="text-xs text-color-base-content/70 space-y-1 list-decimal pl-5">
                <li>¿Qué descubriste sobre las causas reales del problema?</li>
                <li>¿Qué efectos esperas transformar con tu proyecto?</li>
                <li>¿Cómo te ayudó este ejercicio a definir tu estrategia y a escoger a qué convocatorias postular?</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-color-base-content/10 p-4 space-y-1.5">
              <p className="text-xs font-black text-color-base-content">Cómo usar esta hoja</p>
              <ul className="text-xs text-color-base-content/60 space-y-1 list-disc pl-5">
                <li>Define la base lógica de tu proyecto.</li>
                <li>Es el punto de partida de la Estructuración dentro de Serving.</li>
                <li>Facilita que tus aliados y socios revisen el proyecto con claridad.</li>
                <li>Guárdala en la carpeta de tu proyecto para tus próximas postulaciones.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 print:hidden">
              <GlowButton variant="ghost" onClick={() => setParte(1)} className="gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </GlowButton>
              <GlowButton onClick={() => window.print()} className="gap-2 text-xs">
                <Printer className="h-4 w-4" />
                Imprimir o guardar en PDF
              </GlowButton>
              <GlowButton variant="ghost" onClick={empezarDeNuevo} className="gap-2 text-xs">
                <RotateCcw className="h-4 w-4" />
                Empezar de nuevo
              </GlowButton>
            </div>
            <p className="text-[11px] text-color-base-content/40 print:hidden">
              Lo que escribes se guarda solo en este navegador. Si cambias de computador o de navegador, imprime o guarda el PDF antes.
            </p>
          </Seccion>
        </GlassCard>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-color-base-content">{titulo}</h2>
      {children}
    </section>
  )
}

function Etiquetado({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-bold text-color-base-content/70">{etiqueta}</span>
      {children}
    </label>
  )
}

function Ayuda({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-color-base-content/60 leading-relaxed rounded-xl bg-color-base-content/[0.04] px-4 py-3">
      {children}
    </p>
  )
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-black text-color-base-content">
        Paso {n}. {titulo}
      </p>
      {children}
    </div>
  )
}

/** Una fila de tres casillas del árbol. Si hay `origen`, muestra debajo lo escrito en el otro árbol. */
function FilaArbol({
  titulo,
  valores,
  origen,
  onCambio,
}: {
  titulo: string
  valores: string[]
  origen?: string[]
  onCambio: (i: number, v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-color-base-content/45">{titulo}</p>
      <div className="grid md:grid-cols-3 gap-3">
        {valores.map((v, i) => (
          <div key={i} className="space-y-1">
            <textarea
              rows={2}
              className={CAMPO + ' resize-none'}
              value={v}
              onChange={(e) => onCambio(i, e.target.value)}
              placeholder={`${i + 1}.`}
            />
            {origen && origen[i]?.trim() ? (
              <p className="text-[11px] text-color-base-content/40 leading-snug">Antes: {origen[i]}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function FilaResumen({ etiqueta, ayuda, valor }: { etiqueta: string; ayuda: string; valor: string | string[] }) {
  const items = Array.isArray(valor) ? valor.filter((x) => x.trim()) : valor.trim() ? [valor] : []
  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-2 md:gap-4 p-4">
      <div>
        <p className="text-xs font-black text-color-base-content">{etiqueta}</p>
        <p className="text-[11px] text-color-base-content/40">{ayuda}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-color-base-content/30 italic">Aún sin llenar</p>
      ) : (
        <ul className="text-sm text-color-base-content/80 space-y-1 list-disc pl-5">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
