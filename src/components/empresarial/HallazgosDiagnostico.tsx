'use client'

import React from 'react'
import type { SalidaHallazgos, NivelAlerta, Gravedad } from '@/lib/empresarial/generarHallazgos'

const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'

interface Props {
  datos: SalidaHallazgos
  nombresDimension: Record<string, string>
}

const COLOR_ALERTA: Record<NivelAlerta, string> = {
  Informativa: 'bg-[#4C2032] text-[#F3E7DC]',
  Preventiva: 'bg-[#8A6636] text-[#F3E7DC]',
  Importante: 'bg-[#C9A46B] text-[#3A1420]',
  Crítica: 'bg-[#B3261E] text-white',
}

const TEXTO_GRAVEDAD: Record<Gravedad, string> = {
  Bajo: 'Prioridad baja',
  Medio: 'Prioridad media',
  Alto: 'Prioridad alta',
  Crítico: 'Prioridad máxima',
}

export function HallazgosDiagnostico({ datos, nombresDimension }: Props) {
  const fortalezas = datos.hallazgos.filter((h) => h.tipo === 'fortaleza')
  const debilidades = datos.hallazgos.filter((h) => h.tipo === 'debilidad')
  const pendientes = datos.hallazgos.filter((h) => h.tipo === 'brecha_informacion')

  if (!datos.hallazgos.length && !datos.alertas.length) return null

  return (
    <div className="mt-10 space-y-10">
      {datos.alertas.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold">Avisos para tener en cuenta</h2>
          <div className="mt-4 space-y-3">
            {datos.alertas.map((a, i) => (
              <div
                key={`${a.regla}-${i}`}
                className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-4 flex gap-3 items-start ${RELIEVE_TARJETA}`}
              >
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${COLOR_ALERTA[a.nivel]}`}>{a.nivel}</span>
                <p className="text-sm leading-relaxed">{a.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {fortalezas.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold">Lo que ya tienes a favor</h2>
          <div className="mt-4 space-y-3">
            {fortalezas.map((h) => (
              <div key={h.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-4 ${RELIEVE_TARJETA}`}>
                <p className="text-sm leading-relaxed">{h.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {debilidades.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold">Lo que conviene fortalecer</h2>
          <p className="mt-1 text-sm text-[#F3E7DC]/70">Ordenado de lo más importante a lo menos. Abre cada punto para ver el plan.</p>
          <div className="mt-4 space-y-4">
            {debilidades.map((h) => {
              const brecha = datos.brechas.find((b) => b.hallazgo_id === h.id)
              const rec = datos.recomendaciones.find((r) => r.hallazgo_id === h.id)
              return (
                <details key={h.id} className={`group rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold">{nombresDimension[h.dimension_id] ?? 'Área'}</div>
                      {h.gravedad && (
                        <span className="shrink-0 rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1 text-xs font-semibold">
                          {TEXTO_GRAVEDAD[h.gravedad]}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-[#F3E7DC]/85 leading-relaxed">{h.descripcion}</p>
                  </summary>

                  {brecha && (
                    <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-[#2E0E1A] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#C9A46B]">Hoy</div>
                        <p className="mt-1 leading-relaxed">{brecha.situacion_actual}</p>
                      </div>
                      <div className="rounded-xl bg-[#2E0E1A] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#C9A46B]">A dónde llegar</div>
                        <p className="mt-1 leading-relaxed">{brecha.situacion_deseada}</p>
                      </div>
                      <p className="sm:col-span-2 text-[#F3E7DC]/75 leading-relaxed">
                        <strong>Posible causa (por confirmar):</strong> {brecha.causa_probable} <strong>Si no se atiende:</strong>{' '}
                        {brecha.consecuencia}
                      </p>
                    </div>
                  )}

                  {rec && (
                    <div className="mt-4 text-sm">
                      <div className="font-bold">
                        {rec.titulo} · <span className="font-normal text-[#F3E7DC]/75">{rec.plazo}</span>
                      </div>
                      <ol className="mt-2 list-decimal pl-5 space-y-1 leading-relaxed">
                        {rec.acciones.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ol>
                      <p className="mt-3 text-[#F3E7DC]/75">{rec.resultado_esperado}</p>
                    </div>
                  )}
                </details>
              )
            })}
          </div>
        </section>
      )}

      {pendientes.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold">Información que falta</h2>
          <div className="mt-4 space-y-3">
            {pendientes.map((h) => (
              <div key={h.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-4 ${RELIEVE_TARJETA}`}>
                <p className="text-sm leading-relaxed">{h.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
