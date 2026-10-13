'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Printer, Users, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'

/**
 * Hoja de trabajo: Beneficiario Ideal (versión propia de Serving).
 *
 * Vive dentro de la App de Ideas. Se llena en pantalla, sin IA y sin límite de
 * uso. Lo escrito se guarda solo en este navegador y se puede imprimir o
 * guardar como PDF.
 */

type Dificultad = { texto: string; como: string; porque: string }

type Hoja = {
  tipo: string
  edad: string
  genero: string
  donde: string
  dedica: string
  estudios: string
  recursos: string
  cuantos: string
  fuente: string
  dia: string
  dificultades: Dificultad[]
  elegidas: number[]
  seReconocen: string
  falta: string
  cambio: string
  cierre1: string
  cierre2: string
  cierre3: string
}

const VACIA: Hoja = {
  tipo: '',
  edad: '',
  genero: '',
  donde: '',
  dedica: '',
  estudios: '',
  recursos: '',
  cuantos: '',
  fuente: '',
  dia: '',
  dificultades: Array.from({ length: 10 }, () => ({ texto: '', como: '', porque: '' })),
  elegidas: [],
  seReconocen: '',
  falta: '',
  cambio: '',
  cierre1: '',
  cierre2: '',
  cierre3: '',
}

const LLAVE = 'serving_hoja_beneficiario_v1'
const MAX_ELEGIDAS = 3

const CAMPO =
  'w-full bg-color-base-content/5 border border-color-base-content/10 rounded-xl px-4 py-3 text-sm text-color-base-content focus:outline-none focus:border-color-primary/50 transition-all placeholder:text-color-base-content/30'

export default function HojaBeneficiarioClient() {
  const [hoja, setHoja] = useState<Hoja>(VACIA)
  const [listo, setListo] = useState(false)

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

  useEffect(() => {
    if (!listo) return
    try {
      window.localStorage.setItem(LLAVE, JSON.stringify(hoja))
    } catch {
      /* igual que arriba */
    }
  }, [hoja, listo])

  const texto = (campo: keyof Hoja, valor: string) => setHoja((h) => ({ ...h, [campo]: valor }))

  const dificultad = (i: number, campo: keyof Dificultad, valor: string) =>
    setHoja((h) => {
      const copia = h.dificultades.map((d) => ({ ...d }))
      copia[i][campo] = valor
      return { ...h, dificultades: copia }
    })

  const alternarElegida = (i: number) =>
    setHoja((h) => {
      if (h.elegidas.includes(i)) return { ...h, elegidas: h.elegidas.filter((x) => x !== i) }
      if (h.elegidas.length >= MAX_ELEGIDAS) return h
      return { ...h, elegidas: [...h.elegidas, i] }
    })

  const empezarDeNuevo = () => {
    if (window.confirm('¿Borrar todo lo escrito y empezar de nuevo?')) setHoja(VACIA)
  }

  const llenas = hoja.dificultades
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => d.texto.trim())

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 py-12 px-6">
      <div className="space-y-4 print:hidden">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-color-base-content/50 hover:text-color-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a la App de Ideas
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-color-primary ml-3">
          <Users className="h-3 w-3" />
          Hoja de trabajo
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-color-base-content tracking-tight">Beneficiario Ideal</h1>
        <p className="text-color-base-content/60 max-w-2xl font-medium">
          Define a quién ayuda tu proyecto antes de armar tus árboles. Un proyecto que quiere ayudar &ldquo;a todo el
          mundo&rdquo; no convence a nadie. Cuanto más claro lo tengas, más fuerte te queda el árbol de problemas y más
          fácil es que un evaluador entienda por qué tu proyecto importa.
        </p>
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-black">Beneficiario Ideal — Serving</h1>
      </div>

      <GlassCard className="p-6 md:p-8 border-color-base-content/10 space-y-10">
        {/* Paso 1 */}
        <Seccion titulo="Paso 1. ¿Quién es?" ayuda="Descríbelo como si lo estuvieras presentando a alguien que no lo conoce.">
          <div className="grid md:grid-cols-2 gap-4">
            <Etiquetado etiqueta="¿Es una persona, un grupo, una organización o una comunidad?">
              <input className={CAMPO} value={hoja.tipo} onChange={(e) => texto('tipo', e.target.value)} />
            </Etiquetado>
            <Etiquetado etiqueta="Edad o rango de edad">
              <input className={CAMPO} value={hoja.edad} onChange={(e) => texto('edad', e.target.value)} />
            </Etiquetado>
            <Etiquetado etiqueta="Género (si es relevante para el proyecto)">
              <input className={CAMPO} value={hoja.genero} onChange={(e) => texto('genero', e.target.value)} />
            </Etiquetado>
            <Etiquetado etiqueta="Dónde vive o trabaja (barrio, vereda, municipio, región)">
              <input className={CAMPO} value={hoja.donde} onChange={(e) => texto('donde', e.target.value)} />
            </Etiquetado>
            <Etiquetado etiqueta="A qué se dedica o de qué vive">
              <input className={CAMPO} value={hoja.dedica} onChange={(e) => texto('dedica', e.target.value)} />
            </Etiquetado>
            <Etiquetado etiqueta="Nivel de estudios o formación">
              <input className={CAMPO} value={hoja.estudios} onChange={(e) => texto('estudios', e.target.value)} />
            </Etiquetado>
          </div>
          <Etiquetado etiqueta="Con qué recursos y servicios cuenta hoy (internet, transporte, ingresos…)">
            <textarea rows={2} className={CAMPO + ' resize-none'} value={hoja.recursos} onChange={(e) => texto('recursos', e.target.value)} />
          </Etiquetado>
          <div className="grid md:grid-cols-2 gap-4">
            <Etiquetado etiqueta="Cuántos son: estima cuántas personas tienen estas características en tu territorio">
              <input className={CAMPO} value={hoja.cuantos} onChange={(e) => texto('cuantos', e.target.value)} />
            </Etiquetado>
            <Etiquetado etiqueta="De dónde sale el dato (censo, alcaldía, encuesta, tu observación)">
              <input className={CAMPO} value={hoja.fuente} onChange={(e) => texto('fuente', e.target.value)} />
            </Etiquetado>
          </div>
        </Seccion>

        {/* Paso 2 */}
        <Seccion
          titulo="Paso 2. ¿Qué vive hoy?"
          ayuda="Escribe en pocas líneas un día normal de esta persona o comunidad, y qué la frena o la afecta en relación con el tema de tu proyecto."
        >
          <textarea rows={5} className={CAMPO + ' resize-none'} value={hoja.dia} onChange={(e) => texto('dia', e.target.value)} />
        </Seccion>

        {/* Paso 3 */}
        <Seccion
          titulo="Paso 3. Sus diez dificultades principales"
          ayuda="Anota diez dificultades que esa persona o comunidad reconocería como suyas. Escríbelas con el lenguaje de ellos, no con el tuyo."
        >
          <div className="space-y-3">
            {hoja.dificultades.map((d, i) => (
              <div key={i} className="grid md:grid-cols-[32px_1fr_1fr] gap-3 items-start">
                <span className="text-sm font-black text-color-primary pt-3">{i + 1}</span>
                <input
                  className={CAMPO}
                  placeholder="Dificultad"
                  value={d.texto}
                  onChange={(e) => dificultad(i, 'texto', e.target.value)}
                />
                <input
                  className={CAMPO}
                  placeholder="¿Cómo lo sé? (conversación, dato, observación)"
                  value={d.como}
                  onChange={(e) => dificultad(i, 'como', e.target.value)}
                />
              </div>
            ))}
          </div>
          <Nota>
            <strong>Revisa:</strong>{' '}que cada dificultad se pueda observar o medir, que no sea una carencia vaga
            (&ldquo;falta de apoyo&rdquo;) y que tenga que ver con el tema de tu proyecto.
          </Nota>
        </Seccion>

        {/* Paso 4 */}
        <Seccion
          titulo="Paso 4. Escoge lo más importante"
          ayuda="De las diez, marca las tres más graves o más frecuentes. Estas son las que más probablemente den origen a tu problema central."
        >
          {llenas.length === 0 ? (
            <p className="text-xs text-color-base-content/40 italic">Primero escribe tus dificultades en el paso 3.</p>
          ) : (
            <div className="space-y-3">
              {llenas.map(({ d, i }) => {
                const marcada = hoja.elegidas.includes(i)
                const bloqueada = !marcada && hoja.elegidas.length >= MAX_ELEGIDAS
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 space-y-2 ${
                      marcada ? 'border-color-primary/50 bg-color-primary/[0.06]' : 'border-color-base-content/10'
                    }`}
                  >
                    <label className={`flex items-start gap-3 text-sm ${bloqueada ? 'opacity-40' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={marcada}
                        disabled={bloqueada}
                        onChange={() => alternarElegida(i)}
                        className="mt-1"
                      />
                      <span className="text-color-base-content">
                        <strong>{i + 1}.</strong> {d.texto}
                      </span>
                    </label>
                    {marcada && (
                      <input
                        className={CAMPO}
                        placeholder="Por qué es de las más importantes"
                        value={d.porque}
                        onChange={(e) => dificultad(i, 'porque', e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
              <p className="text-[11px] text-color-base-content/40">
                Escogidas: {hoja.elegidas.length} de {MAX_ELEGIDAS}
              </p>
            </div>
          )}
        </Seccion>

        {/* Paso 5 */}
        <Seccion
          titulo="Paso 5. Confírmalo con personas reales"
          ayuda="Antes de seguir, habla con al menos algunas personas que encajen con tu beneficiario ideal, o con alguien que las conozca bien (un líder comunitario, una profesora, un funcionario local)."
        >
          <Etiquetado etiqueta="¿Se reconocen en la descripción?">
            <textarea rows={2} className={CAMPO + ' resize-none'} value={hoja.seReconocen} onChange={(e) => texto('seReconocen', e.target.value)} />
          </Etiquetado>
          <Etiquetado etiqueta="¿Falta alguna dificultad importante, o alguna de las que anotaste no es de ellos?">
            <textarea rows={2} className={CAMPO + ' resize-none'} value={hoja.falta} onChange={(e) => texto('falta', e.target.value)} />
          </Etiquetado>
          <Etiquetado etiqueta="Anota qué cambió después de esa conversación">
            <textarea rows={2} className={CAMPO + ' resize-none'} value={hoja.cambio} onChange={(e) => texto('cambio', e.target.value)} />
          </Etiquetado>
        </Seccion>

        {/* Paso 6 */}
        <Seccion titulo="Paso 6. Pásalo a tu árbol">
          <ul className="text-xs text-color-base-content/60 space-y-1 list-disc pl-5">
            <li>Las dificultades escogidas alimentan las causas y el problema central del Árbol de Problemas.</li>
            <li>El beneficiario ideal va en la sección &ldquo;Beneficiarios&rdquo; de los datos del proyecto.</li>
            <li>El número de personas va en &ldquo;Beneficiarios y metas&rdquo; de tu proyecto.</li>
          </ul>

          {hoja.elegidas.length > 0 && (
            <div className="rounded-2xl border border-color-primary/25 bg-color-primary/[0.06] p-4 space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">
                Tus dificultades más importantes
              </p>
              <ul className="text-sm text-color-base-content/80 space-y-1 list-disc pl-5">
                {hoja.elegidas.map((i) => (
                  <li key={i}>{hoja.dificultades[i].texto}</li>
                ))}
              </ul>
            </div>
          )}
        </Seccion>

        {/* Cierre */}
        <Seccion titulo="Para cerrar">
          <Etiquetado etiqueta="1. ¿Qué descubriste de tu beneficiario que no tenías claro?">
            <textarea rows={2} className={CAMPO + ' resize-none'} value={hoja.cierre1} onChange={(e) => texto('cierre1', e.target.value)} />
          </Etiquetado>
          <Etiquetado etiqueta="2. ¿Hay algo que pensabas que él necesitaba y que en realidad no es así?">
            <textarea rows={2} className={CAMPO + ' resize-none'} value={hoja.cierre2} onChange={(e) => texto('cierre2', e.target.value)} />
          </Etiquetado>
          <Etiquetado etiqueta="3. ¿Tu proyecto sigue siendo la mejor respuesta a lo que viven?">
            <textarea rows={2} className={CAMPO + ' resize-none'} value={hoja.cierre3} onChange={(e) => texto('cierre3', e.target.value)} />
          </Etiquetado>
        </Seccion>

        <div className="flex flex-wrap gap-3 print:hidden">
          <GlowButton onClick={() => window.print()} className="gap-2 text-xs">
            <Printer className="h-4 w-4" />
            Imprimir o guardar en PDF
          </GlowButton>
          <Link href="/ideas/arbol-de-problemas">
            <GlowButton variant="ghost" className="gap-2 text-xs">
              Seguir al Árbol de Problemas
              <ArrowRight className="h-4 w-4" />
            </GlowButton>
          </Link>
          <GlowButton variant="ghost" onClick={empezarDeNuevo} className="gap-2 text-xs">
            <RotateCcw className="h-4 w-4" />
            Empezar de nuevo
          </GlowButton>
        </div>
        <p className="text-[11px] text-color-base-content/40 print:hidden">
          Lo que escribes se guarda solo en este navegador. Si cambias de computador o de navegador, imprime o guarda el PDF antes.
        </p>
      </GlassCard>
    </div>
  )
}

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-color-base-content">{titulo}</h2>
      {ayuda ? <p className="text-xs text-color-base-content/60 leading-relaxed">{ayuda}</p> : null}
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

function Nota({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-color-base-content/60 leading-relaxed rounded-xl bg-color-base-content/[0.04] px-4 py-3">
      {children}
    </p>
  )
}
