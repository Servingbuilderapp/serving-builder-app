import { ETAPAS_PROYECTO, type RespuestasProyecto } from '@/lib/miProyectoPasos'

/**
 * Arma el documento final del proyecto del miembro (portada, índice y los 19 pasos).
 * Sirve para Word (.doc) y para PDF (se imprime con "Guardar como PDF").
 * Formato formal: letra 12, espacio 1,5, cada paso empieza en hoja nueva.
 */

function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function parrafos(texto: string): string {
  return texto
    .split(/\n{1,}/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<p>${escapar(l)}</p>`)
    .join('')
}

export function nombreArchivoProyecto(titulo: string): string {
  const base = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60)
  return base || 'Proyecto'
}

export function construirDocumentoHtml(tituloProyecto: string, r: RespuestasProyecto, correo?: string): string {
  const titulo = r.titulo_elegido?.trim() || tituloProyecto
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

  const indice = ETAPAS_PROYECTO.map(
    (e) =>
      `<p class="etapa-indice"><b>Etapa ${e.letra}. ${escapar(e.titulo)}</b></p>` +
      e.pasos.map((p) => `<p class="paso-indice">Paso ${p.n}. ${escapar(p.titulo)}</p>`).join(''),
  ).join('')

  const cuerpo = ETAPAS_PROYECTO.map((e) =>
    e.pasos
      .map((p) => {
        const campos = p.campos.filter((c) => c.tipo !== 'check')
        const varios = campos.length > 1
        const contenido = campos
          .map((c) => {
            const texto = (r[c.id] || '').trim()
            return (
              (varios ? `<h3>${escapar(c.etiqueta)}</h3>` : '') +
              (texto ? parrafos(texto) : '<p class="vacio">Sin completar</p>')
            )
          })
          .join('')
        return `<div class="paso"><p class="etapa-marca">Etapa ${e.letra}. ${escapar(e.titulo)}</p><h2>Paso ${p.n}. ${escapar(p.titulo)}</h2>${contenido}</div>`
      })
      .join(''),
  ).join('')

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${escapar(titulo)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
@page { size: 21.59cm 27.94cm; margin: 2.5cm; }
body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #111; }
p { margin: 0 0 8pt 0; text-align: justify; }
h1 { font-size: 24pt; text-align: center; margin: 0 0 18pt 0; }
h2 { font-size: 16pt; margin: 0 0 12pt 0; color: #1A4D68; border-bottom: 1px solid #B08D57; padding-bottom: 4pt; }
h3 { font-size: 12.5pt; margin: 14pt 0 4pt 0; color: #333; }
.portada { text-align: center; padding-top: 140pt; page-break-after: always; }
.portada p { text-align: center; }
.sub { font-size: 14pt; color: #555; }
.indice { page-break-after: always; }
.etapa-indice { margin: 10pt 0 2pt 0; text-align: left; }
.paso-indice { margin: 0 0 0 18pt; text-align: left; }
.paso { page-break-before: always; }
.etapa-marca { font-size: 10pt; color: #8a6d3b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2pt; text-align: left; }
.vacio { color: #999; font-style: italic; }
</style>
</head>
<body>
<div class="portada">
<h1>${escapar(titulo)}</h1>
<p class="sub">Proyecto estructurado en Arquitectura Digital de Proyectos</p>
${correo ? `<p class="sub">Presentado por: ${escapar(correo)}</p>` : ''}
<p class="sub">${escapar(fecha)}</p>
</div>
<div class="indice">
<h2>Contenido</h2>
${indice}
</div>
${cuerpo}
</body>
</html>`
}

/** Descarga el proyecto como archivo de Word (se abre en Word, y también en Google Docs y LibreOffice). */
export function descargarEnWord(tituloProyecto: string, r: RespuestasProyecto, correo?: string): void {
  const html = construirDocumentoHtml(tituloProyecto, r, correo)
  const blob = new Blob(['﻿', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombreArchivoProyecto(r.titulo_elegido?.trim() || tituloProyecto)}.doc`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/** Abre el cuadro de impresión con el documento listo; ahí se elige "Guardar como PDF". */
export function guardarEnPdf(tituloProyecto: string, r: RespuestasProyecto, correo?: string): void {
  const html = construirDocumentoHtml(tituloProyecto, r, correo)
  const marco = document.createElement('iframe')
  marco.style.position = 'fixed'
  marco.style.right = '0'
  marco.style.bottom = '0'
  marco.style.width = '0'
  marco.style.height = '0'
  marco.style.border = '0'
  document.body.appendChild(marco)
  const doc = marco.contentWindow?.document
  if (!doc || !marco.contentWindow) {
    marco.remove()
    return
  }
  doc.open()
  doc.write(html)
  doc.close()
  const ventana = marco.contentWindow
  setTimeout(() => {
    ventana.focus()
    ventana.print()
    setTimeout(() => marco.remove(), 2000)
  }, 400)
}
