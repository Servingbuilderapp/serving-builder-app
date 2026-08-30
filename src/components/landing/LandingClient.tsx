'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Check,
  ChevronDown,
  Lightbulb,
  FileText,
  Search,
  Target,
  RefreshCw,
  Send,
  TrendingUp,
  Layers,
  Users,
  Cpu,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Handshake,
  Briefcase,
  Rocket,
  BookOpen,
  Stethoscope,
  Clock,
  Mail,
  Phone,
  Menu,
  X,
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

/* ============================================================================
   BLOQUE DE CONFIGURACIÓN
   Todo lo que hay que revisar o cambiar sin tocar el resto del código está aquí.
   ========================================================================== */

/**
 * Video de bienvenida.
 * El video vive dentro del propio proyecto (carpeta public), no en YouTube ni en
 * ningún servicio externo. Para cambiarlo basta con reemplazar el archivo en
 * public por otro con el mismo nombre.
 * Si se deja vacío, se muestra la tarjeta sin reproductor y sin errores.
 */
const VIDEO_ARCHIVO = '/video-bienvenida.mp4'
const VIDEO_PORTADA = '/video-portada.jpg'

/**
 * Logos de entidades con las que se ha trabajado.
 * IMPORTANTE: dejar vacío hasta tener autorización expresa de cada entidad para
 * usar su marca. Si el arreglo está vacío, la franja no se muestra.
 * Formato: { nombre: 'Nombre entidad', logo: '/logos/archivo.png' }
 */
const ENTIDADES_ALIADAS: { nombre: string; logo: string }[] = []

/**
 * Cifras de la franja de contexto.
 * Cada cifra debe poder respaldarse con una fuente verificable.
 * Para ocultar una, basta con borrar su línea.
 */
const CIFRAS_CONTEXTO = [
  { valor: '6', claveTexto: 'w.cifras.etapas' },
  { valor: '9', claveTexto: 'w.cifras.idiomas' },
]

const TELEFONO = '322 700 8727'
const TELEFONO_WHATSAPP = '573227008727'
const CORREO = 'servingproyectosgi@gmail.com'

/* ========================================================================== */

/* Relieve: sombras y micro-movimiento para que se sienta un portal y no un PDF */
const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_BOTON_SUAVE =
  'shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200'
const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)] hover:shadow-[0_2px_6px_rgba(11,42,74,0.10),0_20px_44px_-16px_rgba(11,42,74,0.32)] hover:-translate-y-1 transition-all duration-300'

interface LandingClientProps {
  user: unknown
  /* Propiedades que enviaba la versión anterior de la página.
     Se dejan opcionales para que el website funcione igual sin importar en qué
     orden se suban los archivos a GitHub. Ya no se usan. */
  syncPlans?: unknown[]
  trialApps?: unknown[]
  arsenalCategories?: Record<string, unknown[]>
  isEcoServing?: boolean
}

const NAV_LINKS = [
  { href: '#inicio', clave: 'w.nav.inicio' },
  { href: '#que-hacemos', clave: 'w.nav.que_hacemos' },
  { href: '#como-funciona', clave: 'w.nav.como_funciona' },
  { href: '#servicios', clave: 'w.nav.servicios' },
  { href: '#membresias', clave: 'w.nav.membresias' },
  { href: '#recursos', clave: 'w.nav.recursos' },
  { href: '#nosotros', clave: 'w.nav.nosotros' },
]

const RUTA_PROYECTO = [
  { icono: Lightbulb, clave: 'w.ruta.idea', de: 'from-[#F59E0B]', a: 'to-[#FBBF24]', tinte: 'bg-amber-50/80', borde: 'border-amber-200' },
  { icono: FileText, clave: 'w.ruta.estructuracion', de: 'from-[#2563EB]', a: 'to-[#60A5FA]', tinte: 'bg-blue-50/80', borde: 'border-blue-200' },
  { icono: Search, clave: 'w.ruta.busqueda', de: 'from-[#0891B2]', a: 'to-[#22D3EE]', tinte: 'bg-cyan-50/80', borde: 'border-cyan-200' },
  { icono: Target, clave: 'w.ruta.encaje', de: 'from-[#7C3AED]', a: 'to-[#A78BFA]', tinte: 'bg-violet-50/80', borde: 'border-violet-200' },
  { icono: RefreshCw, clave: 'w.ruta.adaptacion', de: 'from-[#DB2777]', a: 'to-[#F472B6]', tinte: 'bg-pink-50/80', borde: 'border-pink-200' },
  { icono: Send, clave: 'w.ruta.postulacion', de: 'from-[#059669]', a: 'to-[#34D399]', tinte: 'bg-emerald-50/80', borde: 'border-emerald-200' },
]

const PROPUESTA_VALOR = [
  { icono: Clock, claveTitulo: 'w.valor.rapidez.titulo', claveTexto: 'w.valor.rapidez.texto' },
  { icono: Layers, claveTitulo: 'w.valor.volumen.titulo', claveTexto: 'w.valor.volumen.texto' },
  { icono: Users, claveTitulo: 'w.valor.personas.titulo', claveTexto: 'w.valor.personas.texto' },
]

const CON_QUIEN = [
  { icono: Users, clave: 'w.quien.profesionales' },
  { icono: Briefcase, clave: 'w.quien.estructuradores' },
  { icono: Handshake, clave: 'w.quien.aliados' },
  { icono: Cpu, clave: 'w.quien.tecnologia' },
  { icono: Sparkles, clave: 'w.quien.ia' },
]

type Escalon = {
  numero: string
  claveTitulo: string
  clavePrecio: string
  claveResumen: string
  clavesItems: string[]
  claveBoton: string
  href: string
  icono: React.ElementType
  color: string
  fondo: string
  borde: string
  boton: string
}

const ESCALERA: Escalon[] = [
  {
    numero: '1',
    claveTitulo: 'w.escalera.diagnostico.titulo',
    clavePrecio: 'w.escalera.diagnostico.precio',
    claveResumen: 'w.escalera.diagnostico.resumen',
    clavesItems: [
      'w.escalera.diagnostico.i1',
      'w.escalera.diagnostico.i2',
      'w.escalera.diagnostico.i3',
      'w.escalera.diagnostico.i4',
    ],
    claveBoton: 'w.escalera.diagnostico.boton',
    href: '/diagnostico',
    icono: Stethoscope,
    color: 'text-slate-700',
    fondo: 'bg-slate-50',
    borde: 'border-slate-200',
    boton: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
  },
  {
    numero: '2',
    claveTitulo: 'w.escalera.membresia1.titulo',
    clavePrecio: 'w.escalera.membresia1.precio',
    claveResumen: 'w.escalera.membresia1.resumen',
    clavesItems: [
      'w.escalera.membresia1.i1',
      'w.escalera.membresia1.i2',
      'w.escalera.membresia1.i3',
      'w.escalera.membresia1.i4',
      'w.escalera.membresia1.i5',
    ],
    claveBoton: 'w.escalera.membresia1.boton',
    href: '#membresias',
    icono: GraduationCap,
    color: 'text-emerald-700',
    fondo: 'bg-emerald-50/70',
    borde: 'border-emerald-200',
    boton: 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-500 hover:to-emerald-700 shadow-emerald-600/25',
  },
  {
    numero: '3',
    claveTitulo: 'w.escalera.membresia2.titulo',
    clavePrecio: 'w.escalera.membresia2.precio',
    claveResumen: 'w.escalera.membresia2.resumen',
    clavesItems: [
      'w.escalera.membresia2.i1',
      'w.escalera.membresia2.i2',
      'w.escalera.membresia2.i3',
      'w.escalera.membresia2.i4',
      'w.escalera.membresia2.i5',
    ],
    claveBoton: 'w.escalera.membresia2.boton',
    href: '#membresias',
    icono: Rocket,
    color: 'text-blue-700',
    fondo: 'bg-blue-50/70',
    borde: 'border-blue-200',
    boton: 'bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 shadow-blue-700/25',
  },
  {
    numero: '4',
    claveTitulo: 'w.escalera.academia.titulo',
    clavePrecio: 'w.escalera.academia.precio',
    claveResumen: 'w.escalera.academia.resumen',
    clavesItems: [
      'w.escalera.academia.i1',
      'w.escalera.academia.i2',
      'w.escalera.academia.i3',
      'w.escalera.academia.i4',
    ],
    claveBoton: 'w.escalera.academia.boton',
    href: '#servicios',
    icono: BookOpen,
    color: 'text-amber-700',
    fondo: 'bg-amber-50/70',
    borde: 'border-amber-200',
    boton: 'bg-white border border-amber-400 text-amber-800 hover:bg-amber-50',
  },
  {
    numero: '5',
    claveTitulo: 'w.escalera.mentoria.titulo',
    clavePrecio: 'w.escalera.mentoria.precio',
    claveResumen: 'w.escalera.mentoria.resumen',
    clavesItems: [
      'w.escalera.mentoria.i1',
      'w.escalera.mentoria.i2',
      'w.escalera.mentoria.i3',
      'w.escalera.mentoria.i4',
    ],
    claveBoton: 'w.escalera.mentoria.boton',
    href: '#servicios',
    icono: Users,
    color: 'text-violet-700',
    fondo: 'bg-violet-50/70',
    borde: 'border-violet-200',
    boton: 'bg-gradient-to-b from-violet-500 to-violet-600 text-white hover:from-violet-500 hover:to-violet-700 shadow-violet-600/25',
  },
  {
    numero: '6',
    claveTitulo: 'w.escalera.estructuracion.titulo',
    clavePrecio: 'w.escalera.estructuracion.precio',
    claveResumen: 'w.escalera.estructuracion.resumen',
    clavesItems: [
      'w.escalera.estructuracion.i1',
      'w.escalera.estructuracion.i2',
      'w.escalera.estructuracion.i3',
      'w.escalera.estructuracion.i4',
    ],
    claveBoton: 'w.escalera.estructuracion.boton',
    href: '/contratar',
    icono: Briefcase,
    color: 'text-cyan-800',
    fondo: 'bg-cyan-50/70',
    borde: 'border-cyan-200',
    boton: 'bg-gradient-to-b from-cyan-600 to-cyan-700 text-white hover:from-cyan-600 hover:to-cyan-800 shadow-cyan-700/25',
  },
  {
    numero: '7',
    claveTitulo: 'w.escalera.replicas.titulo',
    clavePrecio: 'w.escalera.replicas.precio',
    claveResumen: 'w.escalera.replicas.resumen',
    clavesItems: [
      'w.escalera.replicas.i1',
      'w.escalera.replicas.i2',
      'w.escalera.replicas.i3',
      'w.escalera.replicas.i4',
    ],
    claveBoton: 'w.escalera.replicas.boton',
    href: '#replicas',
    icono: RefreshCw,
    color: 'text-rose-700',
    fondo: 'bg-rose-50/70',
    borde: 'border-rose-200',
    boton: 'bg-gradient-to-b from-rose-500 to-rose-600 text-white hover:from-rose-500 hover:to-rose-700 shadow-rose-600/25',
  },
]

const CAMINOS = [
  { icono: FileText, clave: 'w.caminos.estructurar', href: '/contratar', color: 'from-[#2563EB] to-[#60A5FA]' },
  { icono: BookOpen, clave: 'w.caminos.aprender', href: '#servicios', color: 'from-[#D97706] to-[#FBBF24]' },
  { icono: Users, clave: 'w.caminos.acompanado', href: '#servicios', color: 'from-[#7C3AED] to-[#A78BFA]' },
  { icono: Briefcase, clave: 'w.caminos.delegar', href: '/contratar', color: 'from-[#0891B2] to-[#22D3EE]' },
  { icono: GraduationCap, clave: 'w.caminos.membresias', href: '#membresias', color: 'from-[#059669] to-[#34D399]' },
  { icono: RefreshCw, clave: 'w.caminos.replica', href: '#replicas', color: 'from-[#DB2777] to-[#F472B6]' },
]

const DIAGNOSTICO_ENTREGA = [
  'w.diagnostico.entrega1',
  'w.diagnostico.entrega2',
  'w.diagnostico.entrega3',
  'w.diagnostico.entrega4',
  'w.diagnostico.entrega5',
  'w.diagnostico.entrega6',
]

const FAQ_CLAVES = [
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7',
  'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14',
]

/* ========================================================================== */

function Marca({ oscuro = false }: { oscuro?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#0C2E5C] flex items-center justify-center shrink-0">
        <span className="text-lg font-black text-white leading-none">A</span>
      </div>
      <div className="leading-tight">
        <div className={`text-[15px] font-extrabold tracking-tight ${oscuro ? 'text-white' : 'text-[#0B2A4A]'}`}>
          {t('w.marca.nombre')}
        </div>
        <div className={`text-[10px] font-medium ${oscuro ? 'text-white/60' : 'text-[#5B6B84]'}`}>
          {t('w.marca.tagline')}
        </div>
      </div>
    </div>
  )
}

/**
 * Fondo decorativo: manchas de color muy suaves, fijas detrás de todo el
 * contenido. Le quitan la sensación de hoja blanca sin robar protagonismo.
 */
function FondoDecorativo() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[620px] w-[620px] rounded-full bg-[#1D4ED8]/[0.18] blur-[120px]" />
      <div className="absolute top-[34%] -right-44 h-[640px] w-[640px] rounded-full bg-[#7C3AED]/[0.16] blur-[130px]" />
      <div className="absolute bottom-[-10%] left-[18%] h-[560px] w-[560px] rounded-full bg-[#06B6D4]/[0.15] blur-[120px]" />
    </div>
  )
}

/** Envoltorio que hace aparecer el contenido suavemente al llegar con el scroll */
function Aparece({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  // Si el navegador no soporta la detección de scroll, el contenido nace visible
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined'
  )

  useEffect(() => {
    const nodo = ref.current
    if (!nodo || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function TituloSeccion({
  eyebrow,
  titulo,
  subtitulo,
  centrado = true,
}: {
  eyebrow?: string
  titulo: string
  subtitulo?: string
  centrado?: boolean
}) {
  return (
    <Aparece className={`max-w-3xl ${centrado ? 'mx-auto text-center' : ''} mb-12`}>
      {eyebrow ? (
        <div className={`flex items-center gap-2.5 mb-3 ${centrado ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#1D4ED8]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] bg-clip-text text-transparent">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#7C3AED]" />
        </div>
      ) : null}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0B2A4A]">
        {titulo}
      </h2>
      {subtitulo ? (
        <p className="mt-4 text-base md:text-lg text-[#5B6B84] leading-relaxed">{subtitulo}</p>
      ) : null}
    </Aparece>
  )
}

function VistaPreviaPanel() {
  const { t } = useTranslation()
  const barras = [72, 88, 54, 95, 63]
  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B84]">
          {t('w.preview.titulo')}
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {t('w.preview.estado')}
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42 * 0.78} ${2 * Math.PI * 42}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-extrabold text-[#0B2A4A]">78%</span>
          </div>
        </div>
        <div className="flex-1 flex items-end gap-2 h-24">
          {barras.map((altura, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#1D4ED8] to-[#60A5FA]"
                style={{ height: `${altura}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {[t('w.preview.linea1'), t('w.preview.linea2'), t('w.preview.linea3')].map((linea, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px] text-[#334155]">
            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{linea}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ========================================================================== */

export function LandingClient({ user }: LandingClientProps) {
  const { t } = useTranslation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [videoAbierto, setVideoAbierto] = useState(false)
  const [faqAbierta, setFaqAbierta] = useState<string | null>(null)

  return (
    <div className="relative min-h-screen bg-[#FBFCFE] text-[#0F172A] font-sans">
      <FondoDecorativo />
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E8EDF5]">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0">
            <Marca />
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                className="text-[13px] font-medium text-[#334155] hover:text-[#1D4ED8] transition-colors"
              >
                {t(enlace.clave)}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <Link
                href="/dashboard"
                className={`h-10 px-5 inline-flex items-center rounded-lg bg-gradient-to-b from-[#143E77] to-[#0C2E5C] text-white text-[13px] font-semibold hover:from-[#16457F] hover:to-[#0A2547] shadow-[#0C2E5C]/25 ${RELIEVE_BOTON}`}
              >
                {t('w.nav.dashboard')}
              </Link>
            ) : (
              <>
                <a
                  href="/login"
                  className={`h-10 px-5 inline-flex items-center rounded-lg border border-[#CBD5E1] bg-white text-[#0B2A4A] text-[13px] font-semibold hover:bg-[#F8FAFC] ${RELIEVE_BOTON_SUAVE}`}
                >
                  {t('w.nav.login')}
                </a>
                <a
                  href="/signup"
                  className={`h-10 px-5 inline-flex items-center rounded-lg bg-gradient-to-b from-[#143E77] to-[#0C2E5C] text-white text-[13px] font-semibold hover:from-[#16457F] hover:to-[#0A2547] shadow-[#0C2E5C]/25 ${RELIEVE_BOTON}`}
                >
                  {t('w.nav.crear_cuenta')}
                </a>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label={t('w.nav.menu')}
            className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0B2A4A]"
          >
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuAbierto ? (
          <div className="lg:hidden border-t border-[#E8EDF5] bg-white px-5 py-4 space-y-1">
            {NAV_LINKS.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={() => setMenuAbierto(false)}
                className="block py-2.5 text-[15px] font-medium text-[#334155]"
              >
                {t(enlace.clave)}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <a
                href="/login"
                className="h-11 inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] text-[#0B2A4A] text-sm font-semibold"
              >
                {t('w.nav.login')}
              </a>
              <a
                href="/signup"
                className="h-11 inline-flex items-center justify-center rounded-lg bg-[#0C2E5C] text-white text-sm font-semibold"
              >
                {t('w.nav.crear_cuenta')}
              </a>
            </div>
          </div>
        ) : null}
      </header>

      {/* ================= HERO ================= */}
      <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-[#E8F0FF] via-[#F4F8FF] to-[#FBFCFE]">
        <div
          aria-hidden
          className="absolute -top-40 left-[-8%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-[#1D4ED8]/30 to-[#7C3AED]/25 blur-[100px]"
        />
        <div
          aria-hidden
          className="absolute top-[-10%] right-[-6%] h-[460px] w-[460px] rounded-full bg-gradient-to-br from-[#06B6D4]/25 to-[#3B82F6]/25 blur-[100px]"
        />
        {/* retícula sutil que le da textura al encabezado */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(29,78,216,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(29,78,216,0.07)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
        />
        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Columna izquierda: mensaje */}
            <div className="lg:col-span-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B2A4A] leading-[1.08]">
                {t('w.hero.titulo1')}
                <br />
                <span className="relative inline-block">
                  {t('w.hero.titulo2')}
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#4F46E5] to-[#06B6D4] opacity-80"
                  />
                </span>
              </h1>
              <p className="mt-5 text-base text-[#475569] leading-relaxed max-w-md">
                {t('w.hero.descripcion')}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { icono: TrendingUp, clave: 'w.hero.pilar1' },
                  { icono: Search, clave: 'w.hero.pilar2' },
                  { icono: Target, clave: 'w.hero.pilar3' },
                ].map(({ icono: Icono, clave }) => (
                  <div key={clave}>
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#E6EEFF] to-[#EDE7FF] ring-1 ring-[#1D4ED8]/10 flex items-center justify-center mb-2.5">
                      <Icono className="h-5 w-5 text-[#1D4ED8]" />
                    </div>
                    <div className="text-[12px] font-semibold text-[#0B2A4A] leading-snug">
                      {t(clave)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/diagnostico"
                  className={`h-12 px-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#143E77] to-[#0C2E5C] text-white text-sm font-semibold hover:from-[#16457F] hover:to-[#0A2547] shadow-[#0C2E5C]/30 ${RELIEVE_BOTON}`}
                >
                  {t('w.hero.cta_principal')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#como-funciona"
                  className={`h-12 px-6 inline-flex items-center rounded-lg border border-[#CBD5E1] bg-white text-[#0B2A4A] text-sm font-semibold hover:bg-[#F8FAFC] ${RELIEVE_BOTON_SUAVE}`}
                >
                  {t('w.hero.cta_secundario')}
                </a>
              </div>
            </div>

            {/* Columna centro: video */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-br from-[#1D4ED8] via-[#4F46E5] to-[#06B6D4] shadow-[0_18px_50px_-18px_rgba(29,78,216,0.55)]">
              <div className="relative rounded-[14px] overflow-hidden bg-gradient-to-br from-[#0C2E5C] to-[#1D4ED8] aspect-video">
                {videoAbierto && VIDEO_ARCHIVO ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover bg-[#081F3F]"
                    src={VIDEO_ARCHIVO}
                    poster={VIDEO_PORTADA}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <button
                      type="button"
                      onClick={() => setVideoAbierto(true)}
                      disabled={!VIDEO_ARCHIVO}
                      aria-label={t('w.video.boton')}
                      className="h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100"
                    >
                      <Play className="h-6 w-6 text-[#1D4ED8] fill-[#1D4ED8] ml-1" />
                    </button>
                    <div className="mt-4 text-white font-semibold text-sm">
                      {t('w.video.titulo')}
                    </div>
                    <div className="mt-1 text-white/70 text-xs">
                      {VIDEO_ARCHIVO ? t('w.video.duracion') : t('w.video.proximamente')}
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Columna derecha: diagnóstico */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFD] p-6">
                <h2 className="text-xl font-extrabold text-[#0B2A4A] leading-snug">
                  {t('w.hero.panel_titulo')}
                </h2>
                <p className="mt-2 text-[13px] text-[#5B6B84] leading-relaxed">
                  {t('w.hero.panel_texto')}
                </p>

                <div className="mt-5 rounded-xl bg-white border border-[#E2E8F0] p-4 space-y-2.5">
                  {[
                    { icono: Lightbulb, clave: 'w.hero.caso1' },
                    { icono: FileText, clave: 'w.hero.caso2' },
                  ].map(({ icono: Icono, clave }) => (
                    <div key={clave} className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E6EEFF] to-[#EDE7FF] ring-1 ring-[#1D4ED8]/10 flex items-center justify-center shrink-0">
                        <Icono className="h-4 w-4 text-[#1D4ED8]" />
                      </div>
                      <span className="text-[13px] font-semibold text-[#0B2A4A] leading-snug">
                        {t(clave)}
                      </span>
                    </div>
                  ))}

                  <Link
                    href="/diagnostico"
                    className={`mt-1 min-h-11 py-2 w-full inline-flex items-center justify-center gap-2 rounded-lg text-center leading-tight bg-gradient-to-b from-[#143E77] to-[#0C2E5C] text-white text-[13px] font-semibold shadow-[#0C2E5C]/25 ${RELIEVE_BOTON}`}
                  >
                    {t('w.hero.panel_boton')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {['w.hero.sello1', 'w.hero.sello2', 'w.hero.sello3'].map((clave) => (
                    <div key={clave} className="flex items-center gap-1.5 text-[11px] font-medium text-[#5B6B84]">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      {t(clave)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FRANJA DEL PROBLEMA (banda de color) ================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#081F3F] via-[#0C2E5C] to-[#1D4ED8]">
        {/* destello diagonal que cruza la banda */}
        <div
          aria-hidden
          className="absolute inset-y-0 -left-1/4 w-2/3 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 right-[8%] h-64 w-64 rounded-full bg-[#7EC3FF]/20 blur-3xl"
        />
        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8 py-12 lg:py-14">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/12 ring-1 ring-white/25 backdrop-blur flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-extrabold text-white leading-snug">
                  {t('w.problema.titulo')}
                </div>
                <div className="text-lg lg:text-xl font-semibold text-[#9DC7FF] leading-snug mt-1">
                  {t('w.problema.subtitulo')}
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 grid sm:grid-cols-2 gap-5">
              {CIFRAS_CONTEXTO.map((cifra) => (
                <div
                  key={cifra.claveTexto}
                  className="rounded-2xl bg-white/8 ring-1 ring-white/15 backdrop-blur px-5 py-4"
                >
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-white to-[#9DC7FF] bg-clip-text text-transparent">
                    {cifra.valor}
                  </div>
                  <div className="text-[13px] text-white/70 leading-snug mt-1.5">
                    {t(cifra.claveTexto)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUÉ HACEMOS ================= */}
      <section id="que-hacemos" className="py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <TituloSeccion
            eyebrow={t('w.que_hacemos.eyebrow')}
            titulo={t('w.que_hacemos.titulo')}
            subtitulo={t('w.que_hacemos.subtitulo')}
          />

          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* hilo de color que cruza las seis etapas */}
            <div
              aria-hidden
              className="hidden lg:block absolute left-8 right-8 top-[52px] h-0.5 bg-gradient-to-r from-[#1D4ED8]/15 via-[#7C3AED]/45 to-[#06B6D4]/15"
            />
            {RUTA_PROYECTO.map(({ icono: Icono, clave, de, a, tinte, borde }, i) => (
              <Aparece key={clave} delay={i * 80}>
              <div
                className={`relative overflow-hidden rounded-2xl border ${borde} ${tinte} p-5 pt-7 text-center ${RELIEVE_TARJETA}`}
              >
                <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${de} ${a}`} />
                <div
                  className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${de} ${a} flex items-center justify-center mx-auto mb-3 shadow-lg`}
                >
                  <Icono className="h-5 w-5 text-white" />
                </div>
                <div className="text-[10px] font-black tracking-widest text-[#94A3B8] mb-1">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-[13px] font-bold text-[#0B2A4A] leading-snug">{t(clave)}</div>
              </div>
              </Aparece>
            ))}
          </div>

          <p className="mt-6 text-center text-[13px] text-[#5B6B84] max-w-2xl mx-auto">
            {t('w.que_hacemos.nota')}
          </p>
        </div>
      </section>

      {/* ================= PROPUESTA DE VALOR ================= */}
      <section id="como-funciona" className="bg-gradient-to-b from-[#F3F7FD] via-[#F7FAFE] to-[#F3F7FD] py-16 lg:py-20 border-y border-[#E7EEF9]">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <TituloSeccion
            eyebrow={t('w.valor.eyebrow')}
            titulo={t('w.valor.titulo')}
            subtitulo={t('w.valor.subtitulo')}
          />

          <div className="grid md:grid-cols-3 gap-6">
            {PROPUESTA_VALOR.map(({ icono: Icono, claveTitulo, claveTexto }, i) => (
              <Aparece key={claveTitulo} delay={i * 110}>
              <div
                className={`relative overflow-hidden rounded-2xl border p-7 ${
                  ['bg-gradient-to-br from-[#EFF5FF] to-white border-blue-200',
                   'bg-gradient-to-br from-[#F3F0FF] to-white border-violet-200',
                   'bg-gradient-to-br from-[#ECFBFF] to-white border-cyan-200'][i]
                } ${RELIEVE_TARJETA}`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1.5 ${
                    ['bg-gradient-to-r from-[#1D4ED8] to-[#60A5FA]',
                     'bg-gradient-to-r from-[#4F46E5] to-[#A78BFA]',
                     'bg-gradient-to-r from-[#0891B2] to-[#67E8F9]'][i]
                  }`}
                />
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg ${
                    ['bg-gradient-to-br from-[#1D4ED8] to-[#60A5FA]',
                     'bg-gradient-to-br from-[#4F46E5] to-[#A78BFA]',
                     'bg-gradient-to-br from-[#0891B2] to-[#22D3EE]'][i]
                  }`}
                >
                  <Icono className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0B2A4A] mb-2">{t(claveTitulo)}</h3>
                <p className="text-[14px] text-[#5B6B84] leading-relaxed">{t(claveTexto)}</p>
              </div>
              </Aparece>
            ))}
          </div>

          <div className="relative mt-12 grid lg:grid-cols-12 gap-8 items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#081F3F] via-[#0C2E5C] to-[#1D4ED8] p-8 lg:p-10 shadow-[0_30px_70px_-30px_rgba(11,42,74,0.65)]">
            <div aria-hidden className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#7C3AED]/35 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 right-[10%] h-72 w-72 rounded-full bg-[#06B6D4]/30 blur-3xl" />
            <div className="relative lg:col-span-7">
              <h3 className="text-2xl font-extrabold text-white leading-snug">
                {t('w.mecanismo.titulo')}
              </h3>
              <p className="mt-3 text-[15px] text-white/75 leading-relaxed">
                {t('w.mecanismo.texto')}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  'w.mecanismo.chip1',
                  'w.mecanismo.chip2',
                  'w.mecanismo.chip3',
                  'w.mecanismo.chip4',
                  'w.mecanismo.chip5',
                ].map((clave) => (
                  <span
                    key={clave}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white/10 text-[#CFE0FF] border border-white/20 backdrop-blur"
                  >
                    {t(clave)}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <VistaPreviaPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ================= ESCALERA DE VALOR ================= */}
      <section id="servicios" className="py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <TituloSeccion
            eyebrow={t('w.escalera.eyebrow')}
            titulo={t('w.escalera.titulo')}
            subtitulo={t('w.escalera.subtitulo')}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {ESCALERA.map((escalon) => {
              const Icono = escalon.icono
              return (
                <Aparece key={escalon.numero} delay={Number(escalon.numero) * 70} className="flex">
                <div
                  className={`w-full rounded-2xl border ${escalon.borde} ${escalon.fondo} p-5 flex flex-col ${RELIEVE_TARJETA}`}
                >
                  <div
                    className={`h-6 w-6 rounded-lg bg-white/80 ring-1 ring-black/5 flex items-center justify-center text-[11px] font-black mb-2 ${escalon.color}`}
                  >
                    {escalon.numero}
                  </div>
                  <h3 className="text-[15px] font-extrabold text-[#0B2A4A] leading-snug min-h-[38px]">
                    {t(escalon.claveTitulo)}
                  </h3>
                  <div className={`text-[12.5px] font-bold leading-snug ${escalon.color} mt-1 min-h-[34px]`}>
                    {t(escalon.clavePrecio)}
                  </div>

                  <div className="my-4 h-12 w-12 rounded-xl bg-white/80 border border-white flex items-center justify-center mx-auto">
                    <Icono className={`h-5 w-5 ${escalon.color}`} />
                  </div>

                  <p className="text-[12px] text-[#5B6B84] leading-snug text-center mb-4 min-h-[32px]">
                    {t(escalon.claveResumen)}
                  </p>

                  <ul className="space-y-1.5 mb-5 flex-1">
                    {escalon.clavesItems.map((clave) => (
                      <li key={clave} className="flex items-start gap-1.5 text-[11.5px] text-[#334155] leading-snug">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t(clave)}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={escalon.href}
                    className={`min-h-9 px-3 py-2 rounded-lg text-[12px] font-semibold inline-flex items-center justify-center text-center leading-tight ${RELIEVE_BOTON} ${escalon.boton}`}
                  >
                    {t(escalon.claveBoton)}
                  </Link>
                </div>
                </Aparece>
              )
            })}
          </div>

          <p className="mt-6 text-center text-[12px] text-[#94A3B8] max-w-3xl mx-auto">
            {t('w.escalera.nota_legal')}
          </p>
        </div>
      </section>

      {/* ================= ENTIDADES (solo si hay autorización) ================= */}
      {ENTIDADES_ALIADAS.length > 0 ? (
        <section className="bg-gradient-to-b from-[#F3F7FD] to-[#F7FAFE] border-y border-[#E7EEF9] py-8">
          <div className="max-w-[1400px] mx-auto px-5 lg:px-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#5B6B84]">
              {t('w.aliados.titulo')}
            </span>
            {ENTIDADES_ALIADAS.map((entidad) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={entidad.nombre}
                src={entidad.logo}
                alt={entidad.nombre}
                className="h-7 w-auto opacity-70 grayscale"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ================= MEMBRESÍAS ================= */}
      <section id="membresias" className="relative overflow-hidden bg-gradient-to-br from-[#081F3F] via-[#0C2E5C] to-[#15305F] py-16 lg:py-20">
        <div aria-hidden className="absolute -top-24 left-[10%] h-72 w-72 rounded-full bg-[#1D4ED8]/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-28 right-[6%] h-80 w-80 rounded-full bg-[#7C3AED]/25 blur-3xl" />
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7EA6E8] mb-3">
              {t('w.membresias.eyebrow')}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {t('w.membresias.titulo')}
            </h2>
            <p className="mt-4 text-base text-white/70 leading-relaxed">
              {t('w.membresias.subtitulo')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                claveT: 'w.membresias.m1.titulo',
                claveP: 'w.membresias.m1.precio',
                claveD: 'w.membresias.m1.texto',
                items: ['w.membresias.m1.i1', 'w.membresias.m1.i2', 'w.membresias.m1.i3', 'w.membresias.m1.i4', 'w.membresias.m1.i5', 'w.membresias.m1.i6'],
                destacado: false,
              },
              {
                claveT: 'w.membresias.m2.titulo',
                claveP: 'w.membresias.m2.precio',
                claveD: 'w.membresias.m2.texto',
                items: ['w.membresias.m2.i1', 'w.membresias.m2.i2', 'w.membresias.m2.i3', 'w.membresias.m2.i4', 'w.membresias.m2.i5', 'w.membresias.m2.i6'],
                destacado: true,
              },
            ].map((plan) => (
              <div
                key={plan.claveT}
                className={`rounded-2xl p-7 ${
                  plan.destacado
                    ? 'bg-white border-2 border-[#60A5FA]'
                    : 'bg-white/5 border border-white/15'
                }`}
              >
                <h3 className={`text-lg font-extrabold ${plan.destacado ? 'text-[#0B2A4A]' : 'text-white'}`}>
                  {t(plan.claveT)}
                </h3>
                <div className={`mt-2 text-3xl font-extrabold ${plan.destacado ? 'text-[#1D4ED8]' : 'text-white'}`}>
                  {t(plan.claveP)}
                </div>
                <p className={`mt-3 text-[13px] leading-relaxed ${plan.destacado ? 'text-[#5B6B84]' : 'text-white/60'}`}>
                  {t(plan.claveD)}
                </p>
                <ul className="mt-5 space-y-2">
                  {plan.items.map((clave) => (
                    <li
                      key={clave}
                      className={`flex items-start gap-2 text-[13px] leading-snug ${
                        plan.destacado ? 'text-[#334155]' : 'text-white/80'
                      }`}
                    >
                      <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${plan.destacado ? 'text-emerald-600' : 'text-[#7EE7C7]'}`} />
                      <span>{t(clave)}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className={`mt-6 h-11 rounded-lg inline-flex w-full items-center justify-center text-[13px] font-semibold transition-colors ${
                    plan.destacado
                      ? `bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] text-white hover:from-[#2563EB] hover:to-[#1E40AF] shadow-[#1D4ED8]/35 ${RELIEVE_BOTON}`
                      : `border border-white/30 text-white hover:bg-white/10 ${RELIEVE_BOTON_SUAVE}`
                  }`}
                >
                  {t('w.membresias.boton')}
                </a>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-[12px] text-white/50 max-w-2xl mx-auto">
            {t('w.membresias.nota')}
          </p>
        </div>
      </section>

      {/* ================= DIAGNÓSTICO GRATUITO ================= */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1D4ED8] mb-3">
                {t('w.diagnostico.eyebrow')}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0B2A4A] leading-tight">
                {t('w.diagnostico.titulo')}
              </h2>
              <p className="mt-4 text-base text-[#5B6B84] leading-relaxed">
                {t('w.diagnostico.subtitulo')}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/diagnostico"
                  className={`h-12 px-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#143E77] to-[#0C2E5C] text-white text-sm font-semibold hover:from-[#16457F] hover:to-[#0A2547] shadow-[#0C2E5C]/30 ${RELIEVE_BOTON}`}
                >
                  {t('w.diagnostico.boton')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`https://wa.me/${TELEFONO_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-12 px-6 inline-flex items-center rounded-lg border border-[#CBD5E1] bg-white text-[#0B2A4A] text-sm font-semibold hover:bg-[#F8FAFC] ${RELIEVE_BOTON_SUAVE}`}
                >
                  {t('w.diagnostico.boton_hablar')}
                </a>
              </div>
              <p className="mt-4 text-[12px] text-[#94A3B8]">{t('w.diagnostico.nota')}</p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFD] p-7">
              <h3 className="text-[15px] font-extrabold text-[#0B2A4A] mb-5">
                {t('w.diagnostico.incluye_titulo')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {DIAGNOSTICO_ENTREGA.map((clave) => (
                  <div key={clave} className="flex items-start gap-2 text-[13px] text-[#334155] leading-snug">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{t(clave)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
                <p className="text-[12px] text-[#5B6B84] leading-relaxed">
                  {t('w.diagnostico.no_incluye')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CAMINOS ================= */}
      <section className="bg-gradient-to-b from-[#F3F7FD] via-[#F7FAFE] to-[#F3F7FD] py-16 lg:py-20 border-y border-[#E7EEF9]">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <TituloSeccion
            eyebrow={t('w.caminos.eyebrow')}
            titulo={t('w.caminos.titulo')}
            subtitulo={t('w.caminos.subtitulo')}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {CAMINOS.map(({ icono: Icono, clave, href, color }, i) => (
              <Aparece key={clave} delay={i * 70}>
              <Link
                href={href}
                className={`group flex items-center gap-4 rounded-2xl bg-white border border-[#E2E8F0] p-5 hover:border-[#1D4ED8] ${RELIEVE_TARJETA}`}
              >
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-md`}>
                  <Icono className="h-5 w-5 text-white" />
                </div>
                <span className="text-[14px] font-semibold text-[#0B2A4A] leading-snug flex-1">
                  {t(clave)}
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#1D4ED8] shrink-0" />
              </Link>
              </Aparece>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CON QUIÉN LO HACEMOS ================= */}
      <section id="nosotros" className="relative overflow-hidden bg-gradient-to-br from-[#0A2650] via-[#0C2E5C] to-[#123C77] py-16 lg:py-20">
        <div aria-hidden className="absolute -top-20 left-[12%] h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 right-[10%] h-80 w-80 rounded-full bg-[#06B6D4]/25 blur-3xl" />
        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8">
          <Aparece className="max-w-3xl mx-auto text-center mb-12">
            <div className="flex items-center gap-2.5 mb-3 justify-center">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#7EC3FF]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7EC3FF]">
                {t('w.quien.eyebrow')}
              </span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#A78BFA]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {t('w.quien.titulo')}
            </h2>
            <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed">
              {t('w.quien.subtitulo')}
            </p>
          </Aparece>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {CON_QUIEN.map(({ icono: Icono, clave }, i) => (
              <Aparece key={clave} delay={i * 70}>
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur p-5 text-center hover:bg-white/[0.12] transition-colors">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Icono className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-[13px] font-bold text-white leading-snug">{t(clave)}</div>
                </div>
              </Aparece>
            ))}
          </div>
          <p className="mt-8 text-center text-[13px] text-white/55 max-w-2xl mx-auto leading-relaxed">
            {t('w.quien.nota_alianzas')}
          </p>
        </div>
      </section>

      {/* ================= PORTAL DE RÉPLICAS ================= */}
      <section id="replicas" className="bg-gradient-to-b from-[#F3F7FD] to-[#F7FAFE] border-y border-[#E7EEF9] py-14">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] p-7 lg:p-9 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-rose-600" />
                </div>
                <h2 className="text-xl font-extrabold text-[#0B2A4A]">{t('w.replicas.titulo')}</h2>
              </div>
              <p className="text-[14px] text-[#5B6B84] leading-relaxed max-w-2xl">
                {t('w.replicas.texto')}
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                href="/dashboard"
                className={`h-12 px-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-rose-500 to-rose-600 text-white text-sm font-semibold hover:from-rose-500 hover:to-rose-700 shadow-rose-600/30 ${RELIEVE_BOTON}`}
              >
                {t('w.replicas.boton')}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="recursos" className="py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <TituloSeccion eyebrow={t('w.faq.eyebrow')} titulo={t('w.faq.titulo')} />
          <div className="max-w-3xl mx-auto space-y-2">
            {FAQ_CLAVES.map((id) => {
              const abierta = faqAbierta === id
              return (
                <div key={id} className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqAbierta(abierta ? null : id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[14px] font-semibold text-[#0B2A4A]">
                      {t(`w.faq.${id}.p`)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#94A3B8] shrink-0 transition-transform ${
                        abierta ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {abierta ? (
                    <div className="px-5 pb-4 -mt-1">
                      <p className="text-[13.5px] text-[#5B6B84] leading-relaxed">
                        {t(`w.faq.${id}.r`)}
                      </p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0C2E5C] via-[#123C77] to-[#1D4ED8] py-16 lg:py-20">
        <div
          aria-hidden
          className="absolute inset-y-0 left-[-15%] w-1/2 -rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {t('w.cta.titulo')}
          </h2>
          <p className="mt-4 text-base text-white/70 leading-relaxed max-w-xl mx-auto">
            {t('w.cta.texto')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/diagnostico"
              className={`h-12 px-7 inline-flex items-center gap-2 rounded-lg bg-white text-[#0C2E5C] text-sm font-bold hover:bg-[#F1F5F9] shadow-black/25 ${RELIEVE_BOTON}`}
            >
              {t('w.cta.boton')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-white/50">{t('w.cta.nota')}</p>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#081F3F] text-white/70">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 grid md:grid-cols-3 gap-10">
          <div>
            <Marca oscuro />
            <p className="mt-4 text-[13px] leading-relaxed max-w-xs">{t('w.footer.descripcion')}</p>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-white mb-4">
              {t('w.footer.contacto')}
            </h4>
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${TELEFONO_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[13px] hover:text-white transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {TELEFONO}
              </a>
              <a
                href={`mailto:${CORREO}`}
                className="flex items-center gap-2 text-[13px] hover:text-white transition-colors break-all"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {CORREO}
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-white mb-4">
              {t('w.footer.legal')}
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-[13px] hover:text-white transition-colors">
                {t('w.footer.privacidad')}
              </Link>
              <Link href="/privacy" className="text-[13px] hover:text-white transition-colors">
                {t('w.footer.datos')}
              </Link>
              <Link href="/terms" className="text-[13px] hover:text-white transition-colors">
                {t('w.footer.terminos')}
              </Link>
              <Link href="/terms" className="text-[13px] hover:text-white transition-colors">
                {t('w.footer.aviso')}
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-5 text-[12px] text-white/40">
            © {new Date().getFullYear()} {t('w.footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}
