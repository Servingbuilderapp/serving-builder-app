'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(26,77,104,0.06),0_10px_28px_-14px_rgba(26,77,104,0.22)]'

/** Etapa → punto de partida que ya usa el resto del camino (A idea, C negocio en marcha, D empresa consolidada). */
const ETAPAS = [
  { clave: 'idea', texto: 'Solo tengo la idea', perfil: 'A' },
  { clave: 'armando', texto: 'Ya empecé a armarlo, pero aún no vendo', perfil: 'A' },
  { clave: 'vendiendo', texto: 'Ya vendo y quiero fortalecerlo o crecer', perfil: 'C' },
  { clave: 'consolidada', texto: 'Es una empresa consolidada', perfil: 'D' },
] as const

const TIPOS_NEGOCIO = [
  'Comercio (vender productos)',
  'Servicios',
  'Producción o manufactura',
  'Alimentos y bebidas',
  'Tecnología o aplicación digital',
  'Agro o campo',
  'Turismo',
  'Educación o formación',
  'Otro',
]

const DINERO = [
  { clave: 'nada', texto: 'Todavía nada' },
  { clave: 'hasta_5', texto: 'Hasta $5 millones' },
  { clave: '5_20', texto: 'Entre $5 y $20 millones' },
  { clave: '20_100', texto: 'Entre $20 y $100 millones' },
  { clave: 'mas_100', texto: 'Más de $100 millones' },
]

const TIEMPO = [
  { clave: 'poco', texto: 'Menos de 10 horas a la semana' },
  { clave: 'medio', texto: 'Entre 10 y 30 horas a la semana' },
  { clave: 'completo', texto: 'Tiempo completo' },
]

const campo = 'mt-2 w-full h-12 rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 text-ca-vino placeholder:text-ca-vino/65'

export function ProyectoHechoClient({ userId }: { userId: string }) {
  const [nombre, setNombre] = useState('')
  const [idea, setIdea] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [tipo, setTipo] = useState('')
  const [etapa, setEtapa] = useState('')
  const [dinero, setDinero] = useState('')
  const [tiempo, setTiempo] = useState('')
  const [yaVendio, setYaVendio] = useState<boolean | null>(null)
  const [aQuien, setAQuien] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [pais, setPais] = useState('Colombia')
  const [personas, setPersonas] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const tieneContenido = idea.trim().length >= 30 || archivo !== null
  // Solo se pregunta cuántas personas trabajan cuando ya hay ventas: de eso depende el precio.
  const vende = etapa === 'vendiendo' || etapa === 'consolidada' || yaVendio === true
  const personasValidas = !vende || (personas !== '' && Number(personas) >= 0)
  const completo =
    nombre.trim() &&
    tieneContenido &&
    tipo &&
    etapa &&
    dinero &&
    tiempo &&
    yaVendio !== null &&
    aQuien.trim() &&
    ciudad.trim() &&
    personasValidas

  async function guardar() {
    if (!completo) return
    setGuardando(true)
    setError('')
    try {
      const supabase = createClient()
      const perfil = ETAPAS.find((e) => e.clave === etapa)?.perfil ?? 'A'

      // 1) El documento (si lo subió) va a la carpeta de documentos de proyectos.
      let rutaDocumento: string | null = null
      if (archivo) {
        const limpio = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        rutaDocumento = `${userId}/empresarial/${Date.now()}-${limpio}`
        const { error: errorSubida } = await supabase.storage.from('documentos-proyectos').upload(rutaDocumento, archivo)
        if (errorSubida) throw new Error('No se pudo subir el documento. Revisa que sea PDF o Word e intenta de nuevo.')
      }

      // 2) El proyecto, igual que lo crea la entrada de siempre.
      const { data: proyecto, error: errorProyecto } = await supabase
        .from('sfpe_proyectos')
        .insert({
          user_id: userId,
          nombre: nombre.trim(),
          pais: pais.trim() || null,
          perfil_sugerido: perfil,
          perfil_confirmado: perfil,
          estado: 'Borrador',
        })
        .select('id')
        .single()
      if (errorProyecto || !proyecto) throw errorProyecto ?? new Error('No se pudo guardar')

      // 3) Lo que la persona contó, para que la IA lo lea después.
      const { error: errorEntrada } = await supabase.from('sfpe_entrada').insert({
        proyecto_id: proyecto.id,
        user_id: userId,
        idea: idea.trim() || null,
        documento_ruta: rutaDocumento,
        documento_nombre: archivo?.name ?? null,
        tipo_negocio: tipo,
        etapa,
        dinero_inicial: dinero,
        tiempo_dedicado: tiempo,
        ya_vendio: yaVendio,
        a_quien_vende: aQuien.trim(),
        ciudad: ciudad.trim(),
        personas: vende ? Math.round(Number(personas)) : null,
      })
      if (errorEntrada) throw errorEntrada

      // Sigue la muestra gratis.
      router.push(`/empresarial/proyecto-hecho?proyecto=${proyecto.id as string}`)
    } catch (err) {
      const mensaje = (err as { message?: string } | null)?.message || ''
      setError(mensaje || 'No se pudo guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const botonOro = `h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo text-base font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const opcion = (activa: boolean) =>
    `w-full text-left rounded-xl border px-4 py-3 text-sm transition-all ${
      activa ? 'border-ca-oro bg-ca-suave ring-2 ring-ca-oro-claro/60 font-bold' : 'border-ca-oro/50 bg-ca-tarjeta hover:bg-ca-suave'
    }`

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[820px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href="/empresarial" className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <>
            <div className="mt-8 text-center">
              <div className="text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Serving</div>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-balance">
                Que la IA formule tu proyecto
              </h1>
              <p className="mt-4 text-ca-vino/80">
                Sube lo que ya tengas o cuéntanos tu idea. Luego responde unas preguntas básicas, las que casi nunca trae un documento.
              </p>
            </div>

            <section className="mt-10 space-y-8">
              {/* ---------------- 1. EL PROYECTO ---------------- */}
              <div className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-6 ${RELIEVE_TARJETA}`}>
                <h2 className="text-xl font-extrabold">1. Tu proyecto o idea</h2>
                <label className="block mt-4">
                  <span className="text-sm font-semibold">Nombre de tu proyecto o empresa</span>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Por ejemplo: Mi panadería" className={campo} />
                </label>

                <label className="block mt-5">
                  <span className="text-sm font-semibold">Cuéntanos tu idea con tus palabras</span>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={5}
                    placeholder="Qué quieres hacer, para quién y por qué crees que va a funcionar."
                    className="mt-2 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo p-4 text-ca-vino placeholder:text-ca-vino/65"
                  />
                </label>

                <div className="mt-5">
                  <span className="text-sm font-semibold">O sube tu documento (PDF o Word .docx)</span>
                  <label
                    className={`mt-2 flex items-center gap-3 rounded-xl border border-dashed border-ca-oro/60 bg-ca-fondo p-4 cursor-pointer hover:bg-ca-suave ${RELIEVE_BOTON}`}
                  >
                    <FileText className="h-6 w-6 text-ca-oro-texto shrink-0" />
                    <span className="text-sm">{archivo ? archivo.name : 'Elegir archivo de tu computador'}</span>
                    <input type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
                  </label>
                  <p className="mt-2 text-xs text-ca-vino/75">Con una de las dos basta: el documento o tu idea escrita (mínimo unas dos frases).</p>
                </div>
              </div>

              {/* ---------------- 2. LO BÁSICO ---------------- */}
              <div className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-6 ${RELIEVE_TARJETA}`}>
                <h2 className="text-xl font-extrabold">2. Lo básico</h2>

                <div className="mt-4">
                  <span className="text-sm font-semibold">¿En qué etapa estás?</span>
                  <div className="mt-2 grid sm:grid-cols-2 gap-3">
                    {ETAPAS.map((e) => (
                      <button key={e.clave} type="button" className={opcion(etapa === e.clave)} onClick={() => setEtapa(e.clave)}>
                        {e.texto}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block mt-5">
                  <span className="text-sm font-semibold">¿Qué tipo de negocio quieres?</span>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={campo}>
                    <option value="">Elige una opción</option>
                    {TIPOS_NEGOCIO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-5">
                  <span className="text-sm font-semibold">¿Con cuánto dinero cuentas para empezar o crecer?</span>
                  <div className="mt-2 grid sm:grid-cols-2 gap-3">
                    {DINERO.map((d) => (
                      <button key={d.clave} type="button" className={opcion(dinero === d.clave)} onClick={() => setDinero(d.clave)}>
                        {d.texto}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="text-sm font-semibold">¿Cuánto tiempo le dedicas?</span>
                  <div className="mt-2 grid sm:grid-cols-3 gap-3">
                    {TIEMPO.map((t) => (
                      <button key={t.clave} type="button" className={opcion(tiempo === t.clave)} onClick={() => setTiempo(t.clave)}>
                        {t.texto}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <span className="text-sm font-semibold">¿Ya le has vendido a alguien?</span>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={opcion(yaVendio === true)} onClick={() => setYaVendio(true)}>
                      Sí
                    </button>
                    <button type="button" className={opcion(yaVendio === false)} onClick={() => setYaVendio(false)}>
                      Todavía no
                    </button>
                  </div>
                </div>

                {vende && (
                  <label className="block mt-5">
                    <span className="text-sm font-semibold">¿Cuántas personas trabajan hoy en el negocio? (cuéntate a ti también)</span>
                    <input
                      type="number"
                      min={0}
                      value={personas}
                      onChange={(e) => setPersonas(e.target.value)}
                      placeholder="Por ejemplo: 4"
                      className={campo}
                    />
                  </label>
                )}

                <label className="block mt-5">
                  <span className="text-sm font-semibold">¿A quién le vendes (o le venderías)?</span>
                  <input value={aQuien} onChange={(e) => setAQuien(e.target.value)} placeholder="Por ejemplo: familias de Cali, restaurantes, colegios" className={campo} />
                </label>

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-semibold">Ciudad</span>
                    <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Por ejemplo: Cali" className={campo} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">País</span>
                    <input value={pais} onChange={(e) => setPais(e.target.value)} className={campo} />
                  </label>
                </div>
              </div>

              {error && <p className="text-center text-sm text-ca-rojo">{error}</p>}

              <div className="text-center">
                <button type="button" className={botonOro} disabled={!completo || guardando} onClick={guardar}>
                  {guardando ? 'Guardando…' : 'Enviar'} <ArrowRight className="h-5 w-5" />
                </button>
                {!completo && <p className="mt-3 text-xs text-ca-vino/75">Responde todo lo anterior para poder enviar.</p>}
              </div>
            </section>
        </>
      </div>
    </main>
  )
}
