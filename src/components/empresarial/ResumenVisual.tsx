import React from 'react'
import { BarrasH, Dona, Embudo, Fichas, MarcoGrafico, Medidor, PlanoPosicion, compacto, type BarraH, type EtapaEmbudo, type PorcionDona } from '@/components/empresarial/Graficos'
import { formatoDinero } from '@/lib/empresarial/mercadoDemanda'

interface Props {
  precio: number | null
  unidadPrecio: string
  margen: number | null
  utilidadMes: number | null
  recuperacion: string
  completos: number
  total: number
  interno: number | null
  externo: number | null
  embudo: EtapaEmbudo[]
  barrasMes: BarraH[]
  inversion: PorcionDona[]
  inversionTotal: number
  moneda: string | null
}

/** Resumen visual del Documento final: solo dibuja cifras que la persona ya escribió. */
export function ResumenVisual(p: Props) {
  const din = (n: number | null) => formatoDinero(n, p.moneda)
  return (
    <section className="mt-8 break-inside-avoid-page" aria-label="Resumen visual del proyecto">
      <h2 className="border-b-2 border-ca-oro pb-1 text-xl font-extrabold text-ca-vino">Resumen visual</h2>
      <div className="mt-4">
        <Fichas
          titulo="Cifras clave del proyecto"
          fichas={[
            { etiqueta: 'Precio', valor: p.precio !== null ? din(p.precio) : '—', nota: p.unidadPrecio || undefined, tono: 'vino' },
            { etiqueta: 'Margen', valor: p.margen !== null ? `${Math.round(p.margen * 100)} %` : '—', nota: 'por cada venta' },
            { etiqueta: 'Utilidad por mes', valor: p.utilidadMes !== null ? din(p.utilidadMes) : '—', nota: 'con las cifras escritas', tono: 'vino' },
            { etiqueta: 'Recuperas la inversión', valor: p.recuperacion },
          ]}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MarcoGrafico titulo="Qué tan completo está">
          <Medidor id="avance" titulo="Partes del documento completas" valor={p.completos / p.total} centro={`${p.completos} de ${p.total}`} subcentro="partes completas" />
        </MarcoGrafico>
        {p.interno !== null && p.externo !== null && (
          <MarcoGrafico titulo="Tu posición (DOFA)">
            <PlanoPosicion interno={p.interno} externo={p.externo} titulo="Posición: lo que depende de ti contra el entorno" />
          </MarcoGrafico>
        )}
        {p.embudo.length > 0 && (
          <div className="sm:col-span-2">
            <MarcoGrafico titulo="Tu mercado: del total a lo que puedes captar">
              <Embudo titulo="Embudo de mercado" etapas={p.embudo} />
            </MarcoGrafico>
          </div>
        )}
        {p.barrasMes.length > 0 && (
          <MarcoGrafico titulo="Cómo se mueve el dinero cada mes">
            <BarrasH titulo="Ingresos, costos y utilidad por mes" formato={(n) => din(n)} barras={p.barrasMes} />
          </MarcoGrafico>
        )}
        {p.inversion.some((x) => x.valor > 0) && (
          <MarcoGrafico titulo="En qué se va la inversión">
            <Dona titulo="Inversión inicial por concepto" porciones={p.inversion} centro={compacto(p.inversionTotal)} subcentro="en total" formato={(n) => din(n)} />
          </MarcoGrafico>
        )}
      </div>
      <p className="mt-3 text-xs text-[#6B5A4F]">Los dibujos usan solo las cifras que escribiste en cada paso.</p>
    </section>
  )
}
