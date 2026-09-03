'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Landmark,
  MessageCircle,
  Sparkles,
  HeartHandshake,
  FileSearch,
  Layers,
  Target,
  Send,
  Check,
  ShieldCheck,
} from 'lucide-react'

/* Mismo relieve que el website: nada plano, todo con volumen. */
const RELIEVE_BOTON =
  'shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200'
const RELIEVE_BOTON_SUAVE =
  'shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200'
const RELIEVE_TARJETA =
  'shadow-[0_2px_6px_rgba(11,42,74,0.08),0_18px_44px_-18px_rgba(29,78,216,0.35)] hover:shadow-[0_4px_12px_rgba(11,42,74,0.12),0_28px_60px_-20px_rgba(29,78,216,0.5)] hover:-translate-y-1.5 transition-all duration-300'

const TELEFONO_WHATSAPP = '573227008727'
const WHATSAPP = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(
  'Hola, quiero saber cómo conseguir financiación para mi proyecto.',
)}`

interface EmpezarClientProps {
  user: unknown
}

export function EmpezarClient({ user }: EmpezarClientProps) {
  return (
    <div className="min-h-screen bg-white text-[#0B2A4A]">
      {/* ================================================================ */}
      {/* BARRA                                                            */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#081F3F]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D4ED8] via-[#4F46E5] to-[#06B6D4] shadow-lg shadow-[#4F46E5]/40">
              <Layers className="h-[18px] w-[18px] text-white" />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-bold tracking-tight text-white">
                Arquitectura Digital
              </span>
              <span className="block text-[11px] text-[#8FB3E8]">
                Tu camino directo a la financiación
              </span>
            </span>
          </Link>

          {user ? (
            <Link
              href="/mi-proyecto"
              className={`inline-flex h-10 items-center rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#4F46E5] px-5 text-[13px] font-semibold text-white ${RELIEVE_BOTON}`}
            >
              Ir a mi panel
            </Link>
          ) : (
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-[13px] font-semibold text-white hover:bg-white/[0.16] ${RELIEVE_BOTON_SUAVE}`}
            >
              <MessageCircle className="h-4 w-4 text-[#5EEAD4]" />
              Hablar con nosotros
            </a>
          )}
        </div>
      </header>

      {/* ================================================================ */}
      {/* HERO — oscuro, con color y con la ilusión por delante            */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-[#081F3F]">
        {/* Manchas de color que le dan vida al fondo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-24 h-[460px] w-[460px] rounded-full bg-[#1D4ED8] opacity-40 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-10 h-[420px] w-[420px] rounded-full bg-[#7C3AED] opacity-40 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-140px] left-1/3 h-[380px] w-[380px] rounded-full bg-[#06B6D4] opacity-30 blur-[120px]"
        />

        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[12px] font-semibold text-[#A5F3FC] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Diagnóstico gratuito, hoy mismo
          </span>

          <h1 className="mt-7 text-[36px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[54px]">
            Ese proyecto que llevas años
            <br className="hidden sm:block" /> cargando{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-[#5EEAD4] bg-clip-text text-transparent">
                merece salir adelante
              </span>
              <span
                aria-hidden
                className="absolute -bottom-1.5 left-0 h-[8px] w-full rounded-full bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-[#5EEAD4] opacity-70 blur-[1px]"
              />
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-[18px] leading-relaxed text-[#C7DBF7]">
            Estructuramos tu proyecto, buscamos las convocatorias que encajan con
            lo tuyo y te acompañamos hasta que la postulación queda enviada. Tú
            decides cuánto quieres meterte:
          </p>

          {/* Los tres caminos: aprender, hacerlo juntos, o delegarlo. */}
          <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              {
                titulo: 'Te enseñamos',
                texto: 'Aprendes el método y lo aplicas tú mismo',
                acento: 'from-[#60A5FA] to-[#3B82F6]',
              },
              {
                titulo: 'Lo hacemos contigo',
                texto: 'Avanzas de la mano, paso a paso',
                acento: 'from-[#A78BFA] to-[#7C3AED]',
              },
              {
                titulo: 'Lo hacemos por ti',
                texto: 'Nos encargamos de todo y tú apruebas',
                acento: 'from-[#5EEAD4] to-[#06B6D4]',
              },
            ].map((c) => (
              <div
                key={c.titulo}
                className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.08] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
              >
                <div className={`h-1 w-full bg-gradient-to-r ${c.acento}`} />
                <div className="px-4 py-4">
                  <p className="text-[14.5px] font-bold text-white">
                    {c.titulo}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#A8C6EE]">
                    {c.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-[16px] font-semibold leading-relaxed text-white">
            Empieza sabiendo qué tan cerca estás. Es gratis y no te compromete a
            nada.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/diagnostico"
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#4F46E5] to-[#06B6D4] px-8 py-4 text-[15px] font-bold text-white ${RELIEVE_BOTON}`}
            >
              Quiero mi diagnóstico gratuito
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-4 text-[15px] font-semibold text-white hover:bg-white/[0.18] ${RELIEVE_BOTON_SUAVE}`}
            >
              <MessageCircle className="h-4 w-4 text-[#5EEAD4]" />
              Prefiero que me expliquen
            </a>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-[#8FB3E8]">
            <ShieldCheck className="h-4 w-4 text-[#5EEAD4]" />
            Sin tarjeta, sin compromiso, sin letra menuda
          </p>
        </div>

        {/* Onda de transición hacia la sección clara */}
        <div
          aria-hidden
          className="h-16 bg-gradient-to-b from-transparent to-[#F3F7FD]"
        />
      </section>

      {/* ================================================================ */}
      {/* LAS DOS PUERTAS                                                  */}
      {/* ================================================================ */}
      <section className="bg-[#F3F7FD] pb-20 pt-4">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-[26px] font-extrabold tracking-tight sm:text-[32px]">
            Cuéntanos quién eres y empezamos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-[#475569]">
            El camino es el mismo. Lo que cambia es cómo te hablamos.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <PuertaEntrada
              icono={Building2}
              gradiente="from-[#1D4ED8] to-[#4F46E5]"
              tinte="from-[#EEF4FF] to-white"
              etiqueta="Tengo una empresa o una idea"
              titulo="Para empresarios y emprendedores"
              descripcion="Sabes que lo tuyo funciona. Lo que te falta es el capital para montar la planta, comprar el equipo o salir por fin al mercado. Y no tienes por qué saber dónde se busca esa plata: para eso estamos."
              puntos={[
                'Tu idea queda convertida en un proyecto que un evaluador entiende y respeta',
                'Te mostramos las convocatorias abiertas que de verdad encajan contigo',
                'Te decimos de frente dónde compites fuerte y dónde no vale la pena gastar energía',
              ]}
            />

            <PuertaEntrada
              icono={Landmark}
              gradiente="from-[#7C3AED] to-[#06B6D4]"
              tinte="from-[#F5F0FF] to-white"
              etiqueta="Represento una entidad u organización"
              titulo="Para entidades y organizaciones"
              descripcion="Conoces tu territorio, conoces a tu gente y sabes exactamente qué problema hay que resolver. Lo que falta es traducirlo al lenguaje que la cooperación y las convocatorias públicas exigen. Eso lo ponemos nosotros."
              puntos={[
                'Estructuramos con el rigor que la cooperación internacional exige',
                'Ordenamos el problema, la población y los indicadores como los piden',
                'Preparamos la postulación y te acompañamos en el seguimiento',
              ]}
            />
          </div>

          <p className="mt-8 text-center text-[13.5px] text-[#5B6B84]">
            ¿No sabes en cuál encajas? Entra por cualquiera. El diagnóstico se
            encarga de ubicarte.
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* EMPATÍA — nombrar lo que siente, y devolverle la confianza       */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B2A4A] via-[#1E3A8A] to-[#4C1D95] py-20 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-[#06B6D4] opacity-25 blur-[130px]"
        />

        <div className="relative mx-auto max-w-5xl px-5">
          <h2 className="text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]">
            Sabemos exactamente lo que se siente
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[15.5px] leading-relaxed text-[#C7DBF7]">
            Porque nos lo cuentan todos los días, con las mismas palabras.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <TarjetaSentir
              acento="from-[#60A5FA] to-[#3B82F6]"
              texto="«Yo sé que mi proyecto sirve. Lo que no sé es cómo demostrarlo en un papel.»"
            />
            <TarjetaSentir
              acento="from-[#A78BFA] to-[#7C3AED]"
              texto="«Me enteré de la convocatoria por un conocido, y ya había cerrado hacía dos semanas.»"
            />
            <TarjetaSentir
              acento="from-[#5EEAD4] to-[#06B6D4]"
              texto="«Llené el formulario completo, lo mandé, y nunca supe por qué me dijeron que no.»"
            />
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/15 bg-white/[0.08] p-8 text-center backdrop-blur">
            <p className="text-[19px] font-bold leading-relaxed sm:text-[22px]">
              Nada de eso significa que tu proyecto no sirva.
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-[#C7DBF7]">
              Significa que lo estabas haciendo solo. Y eso es justamente lo que
              cambia desde el día que empiezas con nosotros.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ACOMPAÑAMIENTO                                                   */}
      {/* ================================================================ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#EEF4FF] to-[#F5F0FF] px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#4F46E5] ring-1 ring-[#4F46E5]/15">
              <HeartHandshake className="h-3.5 w-3.5" />
              No lo haces solo
            </span>
            <h2 className="mt-5 text-[28px] font-extrabold tracking-tight sm:text-[36px]">
              Desde el primer día tienes un equipo detrás
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-[#475569]">
              La plataforma trabaja por dentro, sin descanso, armando tu
              proyecto pieza por pieza. Y por fuera hay personas que te
              responden, te explican en palabras normales y te avisan cuando
              algo necesita de ti.
            </p>
          </div>

          <div className="mt-14">
            <h3 className="text-center text-[20px] font-bold tracking-tight sm:text-[24px]">
              Tu recorrido con nosotros
            </h3>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <TarjetaMomento
                icono={FileSearch}
                gradiente="from-[#1D4ED8] to-[#3B82F6]"
                titulo="Nos conocemos"
                texto="Cuentas qué tienes en mente. En minutos sabes qué tan cerca estás y qué te falta. Gratis y sin compromiso."
              />
              <TarjetaMomento
                icono={Layers}
                gradiente="from-[#4F46E5] to-[#7C3AED]"
                titulo="Le damos forma"
                texto="Tu proyecto se arma completo: el problema, la gente a la que sirve, los objetivos, el presupuesto, el cronograma."
              />
              <TarjetaMomento
                icono={Target}
                gradiente="from-[#7C3AED] to-[#A78BFA]"
                titulo="Buscamos tu oportunidad"
                texto="Rastreamos las convocatorias abiertas y medimos cuáles encajan de verdad con lo tuyo. Con franqueza."
              />
              <TarjetaMomento
                icono={Send}
                gradiente="from-[#06B6D4] to-[#5EEAD4]"
                titulo="Te acompañamos hasta el final"
                texto="Preparamos lo que cada convocatoria pide y seguimos contigo hasta que hay respuesta."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* LO QUE VAS A TENER                                               */}
      {/* ================================================================ */}
      <section className="bg-[#F3F7FD] py-20">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]">
            Lo que vas a tener en tus manos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[15.5px] leading-relaxed text-[#475569]">
            Tu proyecto deja de vivir en tu cabeza y pasa a existir de verdad:
            escrito, sustentado y listo para tocar puertas.
          </p>

          <div className="relative mt-10 rounded-3xl bg-gradient-to-br from-[#1D4ED8] via-[#4F46E5] to-[#06B6D4] p-[2px] shadow-[0_28px_70px_-24px_rgba(79,70,229,0.6)]">
            <div className="rounded-[22px] bg-white p-8 sm:p-10">
              <ul className="grid gap-5 sm:grid-cols-2">
                {[
                  'Tu proyecto escrito completo, con el rigor que piden las convocatorias',
                  'El problema sustentado y tu población bien caracterizada',
                  'Presupuesto y cronograma que se sostienen entre sí',
                  'La lista de convocatorias hechas a la medida de tu perfil',
                  'El análisis honesto de qué tan fuerte compites en cada una',
                  'Acompañamiento hasta que la postulación queda enviada',
                ].map((linea) => (
                  <li key={linea} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] shadow-sm">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-[14.5px] leading-relaxed text-[#334155]">
                      {linea}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 rounded-xl bg-gradient-to-r from-[#EEF4FF] to-[#F5F0FF] p-5 text-center text-[15px] font-semibold leading-relaxed text-[#0B2A4A]">
                Y queda tuyo para siempre. Sirve para esta convocatoria, para la
                siguiente, para el banco y para cualquier aliado que toque tu
                puerta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CIERRE                                                           */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-[#081F3F] py-24 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#7C3AED] to-[#06B6D4] opacity-30 blur-[130px]"
        />

        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-[30px] font-extrabold leading-tight tracking-tight sm:text-[42px]">
            Dale a tu proyecto la oportunidad
            <br className="hidden sm:block" /> que se ha ganado
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[16.5px] leading-relaxed text-[#C7DBF7]">
            Empieza por el diagnóstico gratuito. En unos minutos vas a saber
            exactamente dónde estás parado — y por primera vez, con alguien al
            lado.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/diagnostico"
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#4F46E5] to-[#06B6D4] px-9 py-4.5 text-[16px] font-bold text-white ${RELIEVE_BOTON}`}
            >
              Empezar mi diagnóstico gratuito
              <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-4.5 text-[16px] font-semibold text-white hover:bg-white/[0.18] ${RELIEVE_BOTON_SUAVE}`}
            >
              <MessageCircle className="h-[18px] w-[18px] text-[#5EEAD4]" />
              Escríbenos por WhatsApp
            </a>
          </div>

          <p className="mt-7 text-[13px] text-[#8FB3E8]">
            Estamos del otro lado, listos para leer tu proyecto completo.
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      <footer className="border-t border-[#E2E8F0] bg-white py-9">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 text-center">
          <p className="text-[13.5px] font-bold">
            Serving Proyectos Estratégicos S.A.S.
          </p>
          <p className="text-[12.5px] text-[#5B6B84]">
            servingproyectosgi@gmail.com · 322 700 8727
          </p>
          <div className="mt-2 flex gap-4 text-[12px] text-[#5B6B84]">
            <Link href="/" className="hover:text-[#4F46E5]">
              Sitio principal
            </Link>
            <Link href="/terms" className="hover:text-[#4F46E5]">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-[#4F46E5]">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Piezas                                                              */
/* ------------------------------------------------------------------ */

function PuertaEntrada({
  icono: Icono,
  gradiente,
  tinte,
  etiqueta,
  titulo,
  descripcion,
  puntos,
}: {
  icono: React.ElementType
  gradiente: string
  tinte: string
  etiqueta: string
  titulo: string
  descripcion: string
  puntos: string[]
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-white bg-gradient-to-b ${tinte} ${RELIEVE_TARJETA}`}
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradiente}`} />

      <div className="flex flex-1 flex-col p-7">
        <span
          className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradiente} shadow-lg`}
        >
          <Icono className="h-[22px] w-[22px] text-white" />
        </span>

        <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#4F46E5]">
          {etiqueta}
        </p>
        <h3 className="mt-2 text-[21px] font-extrabold leading-snug tracking-tight">
          {titulo}
        </h3>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[#475569]">
          {descripcion}
        </p>

        <ul className="mt-5 flex-1 space-y-3">
          {puntos.map((p) => (
            <li key={p} className="flex gap-2.5">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradiente}`}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              <span className="text-[13.5px] leading-relaxed text-[#334155]">
                {p}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/diagnostico"
          className={`mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${gradiente} text-[14.5px] font-bold text-white ${RELIEVE_BOTON}`}
        >
          Empezar por aquí
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function TarjetaSentir({ acento, texto }: { acento: string; texto: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.13]">
      <div className={`h-1.5 w-full bg-gradient-to-r ${acento}`} />
      <p className="p-6 text-[15px] font-medium italic leading-relaxed text-white">
        {texto}
      </p>
    </div>
  )
}

function TarjetaMomento({
  icono: Icono,
  gradiente,
  titulo,
  texto,
}: {
  icono: React.ElementType
  gradiente: string
  titulo: string
  texto: string
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E7EEFA] bg-white p-6 ${RELIEVE_TARJETA}`}
    >
      <span
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradiente} shadow-lg`}
      >
        <Icono className="h-5 w-5 text-white" />
      </span>
      <h4 className="text-[15.5px] font-bold tracking-tight">{titulo}</h4>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[#475569]">
        {texto}
      </p>
    </div>
  )
}
