'use client'
import React from 'react'
import { ExternalLink, Compass, Star, Layers } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_10px_26px_-14px_rgba(20,5,10,0.6)]'
const SOMBRA_BOTON =
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(20,5,10,0.4),0_6px_14px_-8px_rgba(20,5,10,0.6)]'

type Enlace = { rotulo: string; href: string }
type Fuente = {
  id: string
  nombre: string
  enlaces: Enlace[]
  etiqueta?: 'pago' | 'solo_eeuu' | 'mentoria' | 'referencia'
}

const FUNDAMENTALES: Fuente[] = [
  { id: 'gestionandote', nombre: 'Gestionándote', enlaces: [{ rotulo: 'gestionandote.org', href: 'https://www.gestionandote.org/category/subvenciones/' }] },
  { id: 'ccb', nombre: 'Cámara de Comercio de Bogotá', enlaces: [{ rotulo: 'ccb.org.co', href: 'https://www.ccb.org.co' }] },
  { id: 'ue', nombre: 'EU Funding & Tenders', enlaces: [{ rotulo: 'europa.eu', href: 'https://webgate.ec.europa.eu/funding-tenders-opportunities/display/IT/Funding+and+Tenders+Portal' }] },
]

const BUSCADORES: Fuente[] = [
  { id: 'opengrants', nombre: 'Open Grants', enlaces: [{ rotulo: 'opengrants.io', href: 'https://opengrants.io' }] },
  {
    id: 'ifad',
    nombre: 'UNSDG + FIDA',
    enlaces: [
      { rotulo: 'UNSDG', href: 'https://unsdg.un.org' },
      { rotulo: 'FIDA / IFAD', href: 'https://www.ifad.org/es' },
    ],
  },
  { id: 'bidlab', nombre: 'BID Lab', enlaces: [{ rotulo: 'bidlab.org', href: 'https://bidlab.org/es/inicio/convocatorias-pagina' }] },
]

const OTROS: Fuente[] = [
  { id: 'terraviva', nombre: 'Terra Viva Grants Directory', enlaces: [{ rotulo: 'terravivagrants.org', href: 'https://terravivagrants.org/' }] },
  { id: 'devex', nombre: 'Devex Funding', etiqueta: 'pago', enlaces: [{ rotulo: 'devex.com', href: 'https://pgs.devex.com/devex-pro-funding/' }] },
  { id: 'candid', nombre: 'Candid · Foundation Directory', enlaces: [{ rotulo: 'candid.org', href: 'https://candid.org' }] },
  { id: 'grantstation', nombre: 'GrantStation', etiqueta: 'pago', enlaces: [{ rotulo: 'grantstation.com', href: 'https://www.grantstation.com/find/primary-research' }] },
  { id: 'fid', nombre: 'FID · Fondo de Innovación para el Desarrollo', enlaces: [{ rotulo: 'afd.fr', href: 'https://www.afd.fr/es/actualites/el-fondo-de-innovacion-para-el-desarrollo-lanza-su-primera-convocatoria-de-proyectos' }] },
  { id: 'grants', nombre: 'Grants.gov', etiqueta: 'solo_eeuu', enlaces: [{ rotulo: 'grants.gov', href: 'https://grants.gov' }] },
  { id: 'score', nombre: 'SCORE', etiqueta: 'mentoria', enlaces: [{ rotulo: 'score.org', href: 'https://www.score.org' }] },
  { id: 'eeas', nombre: 'EEAS · Unión Europea', etiqueta: 'referencia', enlaces: [{ rotulo: 'eeas.europa.eu', href: 'https://www.eeas.europa.eu' }] },
  { id: 'unsdg', nombre: 'UNSDG · Naciones Unidas', etiqueta: 'referencia', enlaces: [{ rotulo: 'unsdg.un.org', href: 'https://unsdg.un.org' }] },
]

function Tarjeta({ f, grande }: { f: Fuente; grande?: boolean }) {
  const { t } = useLanguage()
  return (
    <article
      className={`flex flex-col rounded-2xl border border-[#B08D57]/60 bg-gradient-to-b from-[#FBF4EA] to-[#F0E1CF] ${grande ? 'p-5' : 'p-4'} ${SOMBRA_TARJETA}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className={`font-extrabold text-[#3B1727] ${grande ? 'text-[15px]' : 'text-[14px]'}`}>{f.nombre}</h3>
        {f.etiqueta && (
          <span className="rounded-full bg-[#54142B] px-2 py-0.5 text-[10.5px] font-bold text-[#F3E7DC]">
            {t(`fuentes.etiqueta_${f.etiqueta}`)}
          </span>
        )}
      </div>
      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[#3B1727]/75">{t(`fuentes.d_${f.id}`)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {f.enlaces.map((e) => (
          <a
            key={e.href + e.rotulo}
            href={e.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('fuentes.abrir')}: ${f.nombre} (${e.rotulo})`}
            className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-[#DDB97C] to-[#C9A46B] px-3.5 py-2 text-[12.5px] font-bold text-[#3B1727] ${SOMBRA_BOTON}`}
          >
            {f.enlaces.length > 1 ? e.rotulo : t('fuentes.abrir')}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </article>
  )
}

function Bloque({ icono, titulo, sub, children }: { icono: React.ReactNode; titulo: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight text-[#F3E7DC]">
        {icono}
        {titulo}
      </h2>
      <p className="mb-3 mt-0.5 max-w-2xl text-[12.5px] text-[#F3E7DC]/60">{sub}</p>
      {children}
    </section>
  )
}

/** Páginas de frente: lo primero que ve la persona al buscar fondos. */
export default function FuentesDeFrente() {
  const { t } = useLanguage()
  return (
    <div>
      <Bloque icono={<Star className="h-5 w-5 text-[#E0B868]" />} titulo={t('fuentes.titulo_1')} sub={t('fuentes.sub_1')}>
        <div className="grid gap-4 sm:grid-cols-3">
          {FUNDAMENTALES.map((f) => <Tarjeta key={f.id} f={f} grande />)}
        </div>
      </Bloque>
      <Bloque icono={<Compass className="h-5 w-5 text-[#E0B868]" />} titulo={t('fuentes.titulo_2')} sub={t('fuentes.sub_2')}>
        <div className="grid gap-4 sm:grid-cols-3">
          {BUSCADORES.map((f) => <Tarjeta key={f.id} f={f} grande />)}
        </div>
      </Bloque>
      <Bloque icono={<Layers className="h-5 w-5 text-[#E0B868]" />} titulo={t('fuentes.titulo_3')} sub={t('fuentes.sub_3')}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OTROS.map((f) => <Tarjeta key={f.id} f={f} />)}
        </div>
      </Bloque>
    </div>
  )
}
