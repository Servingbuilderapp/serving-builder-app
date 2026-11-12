'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

type TipoFila = 'conocimiento' | 'capacidad' | 'interes' | 'problema_observado' | 'recurso'
type Forma = 'texto' | 'escala' | 'sino' | 'capacidad'

interface Item {
  clave: string
  texto: string
  forma: Forma
  anclajes?: string
}
interface Etapa {
  codigo: string
  nombre: string
  descripcion: string
  tipo: TipoFila
  items: Item[]
}
interface FilaGuardada {
  id: string
  tipo: string
  titulo: string
  detalle: string | null
  nivel: number | null
  ejemplo_o_evidencia: string | null
}
interface Props {
  proyecto: { id: string; nombre: string }
  filasIniciales: FilaGuardada[]
}

const t = (clave: string, texto: string): Item => ({ clave, texto, forma: 'texto' })

const CAPACIDADES = [
  'Análisis',
  'Comunicación',
  'Investigación',
  'Creatividad',
  'Organización',
  'Liderazgo',
  'Trabajo en equipo',
  'Resolver problemas',
  'Capacidad técnica',
  'Manejo de recursos',
  'Herramientas digitales',
  'Capacidad comercial',
]

const ETAPAS: Etapa[] = [
  {
    codigo: 'B1',
    nombre: 'Quién eres',
    descripcion: 'Tu formación y tu experiencia. No hay respuestas buenas o malas.',
    tipo: 'conocimiento',
    items: [
      t('B1-01', '¿Qué estudiaste o estás estudiando? ¿En qué semestre vas, o cuándo terminaste?'),
      t('B1-02', '¿Qué conocimientos dominas mejor?'),
      t('B1-03', '¿Qué materias o proyectos te han interesado más?'),
      t('B1-04', '¿Qué experiencias prácticas has tenido (prácticas, trabajos, voluntariado)?'),
      t('B1-05', '¿En qué sectores has tenido contacto?'),
      t('B1-06', '¿Qué problemas has observado durante tu formación o tu trabajo?'),
    ],
  },
  {
    codigo: 'B2',
    nombre: 'Tus capacidades',
    descripcion: 'Califícate de 1 a 5 y cuenta en qué experiencia lo has demostrado.',
    tipo: 'capacidad',
    items: CAPACIDADES.map((c, i) => ({
      clave: `B2-${String(i + 1).padStart(2, '0')}`,
      texto: c,
      forma: 'capacidad' as Forma,
    })),
  },
  {
    codigo: 'B3',
    nombre: 'Tus intereses',
    descripcion: 'Lo que te mueve y lo que no.',
    tipo: 'interes',
    items: [
      t('B3-01', '¿Qué actividades disfrutas?'),
      t('B3-02', '¿Qué sectores te llaman la atención?'),
      t('B3-03', '¿Qué problemas te gustaría ayudar a resolver?'),
      t('B3-04', '¿Qué productos o servicios te gustaría desarrollar?'),
      t('B3-05', '¿Qué temas investigarías por iniciativa propia?'),
      t('B3-06', '¿Qué actividades NO te interesan?'),
    ],
  },
  {
    codigo: 'B4',
    nombre: 'Problemas a tu alrededor',
    descripcion: 'Cosas que ves que podrían funcionar mejor.',
    tipo: 'problema_observado',
    items: [
      t('B4-01', '¿Qué dificultades ves en tu universidad o lugar de estudio?'),
      t('B4-02', '¿Qué problemas ves en tu comunidad?'),
      t('B4-03', '¿Qué necesidades ves en las empresas que conoces?'),
      t('B4-04', '¿Qué problemas tiene el sector de tu carrera?'),
      t('B4-05', '¿Qué actividades podrían hacerse más rápido o mejor?'),
      t('B4-06', '¿Qué necesidades están mal atendidas?'),
    ],
  },
  {
    codigo: 'B5',
    nombre: 'Recursos y posibilidades',
    descripcion: 'Con qué cuentas hoy para empezar a explorar.',
    tipo: 'recurso',
    items: [
      t('B5-01', '¿Qué conocimientos puedes aportar?'),
      t('B5-02', '¿Qué herramientas tienes a la mano?'),
      {
        clave: 'B5-03',
        texto: '¿Cuánto tiempo puedes dedicar?',
        forma: 'escala',
        anclajes: '1: casi nada · 3: algunas horas fijas por semana · 5: tiempo completo',
      },
      { clave: 'B5-04', texto: '¿Podrías trabajar con otras personas?', forma: 'sino' },
      t('B5-05', '¿Qué contactos o redes tienes?'),
      t('B5-06', '¿Qué recursos te faltaría conseguir?'),
    ],
  },
]

interface Dato {
  id?: string
  detalle: string
  nivel: number | null
  ejemplo: string
}

const SI_NO = ['Sí', 'En parte', 'No']

export function DescubrimientoClient({ proyecto, filasIniciales }: Props) {
  const [datos, setDatos] = useState<Record<string, Dato>>(() => {
    const inicial: Record<string, Dato> = {}
    for (const f of filasIniciales) {
      const clave = f.titulo.split(' ')[0]
      inicial[clave] = {
        id: f.id,
        detalle: f.detalle ?? '',
        nivel: f.nivel,
        ejemplo: f.ejemplo_o_evidencia ?? '',
      }
    }
    return inicial
  })
  const [indice, setIndice] = useState(0)
  const [terminado, setTerminado] = useState(false)
  const [error, setError] = useState('')
  // Una cola por pregunta: evita que dos guardados seguidos creen dos filas.
  const colas = useRef<Record<string, Promise<void>>>({})
  // Id de la fila ya creada para cada pregunta (así se actualiza en vez de duplicar).
  const ids = useRef<Record<string, string>>(
    Object.fromEntries(filasIniciales.map((f) => [f.titulo.split(' ')[0], f.id])),
  )

  const etapa = ETAPAS[indice]
  const esUltima = indice === ETAPAS.length - 1
  const totalItems = ETAPAS.reduce((n, e) => n + e.items.length, 0)
  const contestadas = ETAPAS.reduce(
    (n, e) =>
      n +
      e.items.filter((it) => {
        const d = datos[it.clave]
        return d && (d.detalle.trim() || d.nivel !== null)
      }).length,
    0,
  )

  function guardar(tipo: TipoFila, item: Item, nuevo: Dato) {
    setError('')
    setDatos((d) => ({ ...d, [item.clave]: { ...d[item.clave], ...nuevo } }))
    const anterior = colas.current[item.clave] ?? Promise.resolve()
    colas.current[item.clave] = anterior.then(async () => {
      try {
        const supabase = createClient()
        const fila = {
          proyecto_id: proyecto.id,
          tipo,
          titulo: `${item.clave} ${item.texto}`,
          detalle: nuevo.detalle.trim() || null,
          nivel: nuevo.nivel,
          ejemplo_o_evidencia: nuevo.ejemplo.trim() || null,
        }
        const id = ids.current[item.clave]
        if (id) {
          const { error: e } = await supabase.from('sfpe_descubrimiento').update(fila).eq('id', id)
          if (e) throw e
        } else {
          const { data, error: e } = await supabase.from('sfpe_descubrimiento').insert(fila).select('id').single()
          if (e || !data) throw e ?? new Error('No se pudo guardar')
          ids.current[item.clave] = data.id as string
        }
      } catch (err) {
        setError((err as { message?: string } | null)?.message || 'No se pudo guardar tu respuesta. Intenta de nuevo.')
      }
    })
  }

  const vacio: Dato = { detalle: '', nivel: null, ejemplo: '' }
  const get = (clave: string) => datos[clave] ?? vacio

  const botonOro = `h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo text-base font-extrabold disabled:opacity-50 ${RELIEVE_BOTON}`
  const botonSuave = `h-14 px-6 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`
  const claseOpcion = (activa: boolean) =>
    `rounded-xl border px-1 py-2.5 text-center transition-all ${
      activa
        ? 'border-ca-oro bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo'
        : 'border-ca-oro/50 bg-ca-fondo hover:bg-ca-suave'
    }`
  const claseTexto =
    'mt-3 w-full rounded-xl border border-ca-oro/50 bg-ca-fondo p-3 text-sm text-ca-vino placeholder:text-ca-vino/65 focus:border-ca-oro focus:outline-none'

  /* ----------------------------- FINAL ----------------------------- */
  if (terminado) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
        <div className="max-w-[720px] mx-auto px-5 lg:px-8 py-14 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Tu ruta de descubrimiento</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">Quedó guardado todo lo que contaste</h1>
          <div className={`mt-8 rounded-3xl border border-ca-oro/45 bg-ca-tarjeta p-8 ${RELIEVE_TARJETA}`}>
            <p className="text-lg">
              Respondiste {contestadas} de {totalItems} preguntas.
            </p>
            <p className="mt-3 text-sm text-ca-vino/75">
              Aquí no hay nota ni puntaje: lo que contaste es la materia prima para explorar ideas contigo. En el
              siguiente paso te mostraremos ideas posibles a partir de tus conocimientos, intereses y problemas. Serán
              hipótesis para explorar, no oportunidades comprobadas, y tú decides cuáles guardar. No estás obligado a
              crear una empresa ni a continuar.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" className={botonSuave} onClick={() => setTerminado(false)}>
              Revisar mis respuestas
            </button>
            <Link href="/dashboard" className={botonOro}>
              Ir a mi panel
            </Link>
          </div>
        </div>
      </main>
    )
  }

  /* ----------------------------- PREGUNTAS ----------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[820px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href="/empresarial" className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Salir (tu avance queda guardado)
        </Link>

        <div className="mt-6">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Descubrimiento · {proyecto.nombre}</div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-ca-vino/75">
            <span>
              Parte {indice + 1} de {ETAPAS.length}
            </span>
            <span>
              {contestadas} de {totalItems} preguntas
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-ca-fondo overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ca-oro-claro to-ca-oro transition-all"
              style={{ width: `${(contestadas / totalItems) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold">{etapa.nombre}</h1>
        <p className="mt-2 text-ca-vino/75">{etapa.descripcion}</p>
        <p className="mt-2 text-sm text-ca-vino/75">
          Responde solo lo que quieras; puedes dejar preguntas en blanco y volver después.
        </p>

        <div className="mt-6 space-y-5">
          {etapa.items.map((it, i) => {
            const d = get(it.clave)
            return (
              <div key={it.clave} className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
                <div className="font-bold leading-snug">
                  {i + 1}. {it.texto}
                </div>

                {it.forma === 'texto' && (
                  <textarea
                    rows={3}
                    value={d.detalle}
                    onChange={(e) => setDatos((x) => ({ ...x, [it.clave]: { ...get(it.clave), detalle: e.target.value } }))}
                    onBlur={() => guardar(etapa.tipo, it, get(it.clave))}
                    placeholder="Escribe aquí con tus palabras"
                    className={claseTexto}
                  />
                )}

                {it.forma === 'sino' && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {SI_NO.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => guardar(etapa.tipo, it, { ...d, detalle: o })}
                        className={claseOpcion(d.detalle === o)}
                      >
                        <div className="py-1 text-base font-extrabold">{o}</div>
                      </button>
                    ))}
                  </div>
                )}

                {(it.forma === 'escala' || it.forma === 'capacidad') && (
                  <>
                    {it.anclajes && <p className="mt-2 text-xs text-ca-vino/75">{it.anclajes}</p>}
                    {it.forma === 'capacidad' && (
                      <p className="mt-1 text-xs text-ca-vino/75">1: apenas empiezo · 3: me defiendo · 5: lo hago muy bien</p>
                    )}
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => guardar(etapa.tipo, it, { ...d, nivel: n })}
                          className={claseOpcion(d.nivel === n)}
                        >
                          <div className="text-lg font-extrabold">{n}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {it.forma === 'capacidad' && (
                  <textarea
                    rows={2}
                    value={d.ejemplo}
                    onChange={(e) => setDatos((x) => ({ ...x, [it.clave]: { ...get(it.clave), ejemplo: e.target.value } }))}
                    onBlur={() => {
                      const actual = get(it.clave)
                      if (actual.nivel !== null || actual.ejemplo.trim()) guardar(etapa.tipo, it, actual)
                    }}
                    placeholder="¿En qué experiencia puedes demostrarlo?"
                    className={claseTexto}
                  />
                )}
              </div>
            )
          })}
        </div>

        {error && <p className="mt-6 text-center text-sm text-ca-rojo">{error}</p>}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" className={botonSuave} disabled={indice === 0} onClick={() => setIndice(indice - 1)}>
            <ArrowLeft className="h-5 w-5" /> Anterior
          </button>
          {esUltima ? (
            <button type="button" className={botonOro} onClick={() => setTerminado(true)}>
              Terminé <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button type="button" className={botonOro} onClick={() => setIndice(indice + 1)}>
              Siguiente <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
