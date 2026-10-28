import { redirect } from 'next/navigation'

/**
 * La pantalla se llamaba "Coincidencias" y ahora se llama "A tu medida". Este archivo
 * solo existe para que los enlaces viejos no se rompan: manda a la dirección nueva.
 */
export default async function CoincidenciasViejaPage({
  searchParams,
}: {
  searchParams?: Promise<{ proyecto?: string; minimo?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const consulta = new URLSearchParams()
  if (params?.proyecto) consulta.set('proyecto', params.proyecto)
  if (params?.minimo) consulta.set('minimo', params.minimo)
  const texto = consulta.toString()
  redirect(texto ? `/a-tu-medida?${texto}` : '/a-tu-medida')
}
