/**
 * Entrega de documentos al cliente en formatos que cualquier persona puede abrir.
 *
 * Antes los documentos se bajaban como archivos .md (texto con marcas), que solo
 * abren los editores de codigo como VS Code. Un cliente normal no los puede ver.
 * Aqui el texto se convierte a un documento con formato y se entrega como Word
 * (.doc) o como PDF (via la ventana de imprimir del navegador).
 *
 * No usa librerias externas: el convertidor cubre lo que producen los motores
 * (titulos, negritas, listas, tablas, enlaces y parrafos).
 */

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatoEnLinea(texto: string): string {
  return escaparHtml(texto)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
}

function esFilaSeparadora(linea: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(linea)
}

function celdasDeFila(linea: string): string[] {
  return linea
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

/** Convierte texto en Markdown a HTML simple. */
export function markdownAHtml(markdown: string): string {
  const lineas = markdown.replace(/\r\n/g, '\n').split('\n')
  const salida: string[] = []
  let lista: 'ul' | 'ol' | null = null
  let parrafo: string[] = []

  const cerrarParrafo = () => {
    if (parrafo.length > 0) {
      salida.push(`<p>${parrafo.map(formatoEnLinea).join('<br/>')}</p>`)
      parrafo = []
    }
  }
  const cerrarLista = () => {
    if (lista) {
      salida.push(`</${lista}>`)
      lista = null
    }
  }

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i]

    if (linea.trim() === '') {
      cerrarParrafo()
      cerrarLista()
      continue
    }

    const titulo = linea.match(/^(#{1,4})\s+(.*)$/)
    if (titulo) {
      cerrarParrafo()
      cerrarLista()
      const nivel = titulo[1].length
      salida.push(`<h${nivel}>${formatoEnLinea(titulo[2])}</h${nivel}>`)
      continue
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(linea)) {
      cerrarParrafo()
      cerrarLista()
      salida.push('<hr/>')
      continue
    }

    if (linea.trim().startsWith('|')) {
      cerrarParrafo()
      cerrarLista()
      const filas: string[] = []
      while (i < lineas.length && lineas[i].trim().startsWith('|')) {
        filas.push(lineas[i])
        i++
      }
      i--
      const cuerpo = filas.filter((f) => !esFilaSeparadora(f))
      if (cuerpo.length > 0) {
        const encabezado = celdasDeFila(cuerpo[0])
        const resto = cuerpo.slice(1)
        salida.push(
          '<table><thead><tr>' +
            encabezado.map((c) => `<th>${formatoEnLinea(c)}</th>`).join('') +
            '</tr></thead><tbody>' +
            resto
              .map((f) => '<tr>' + celdasDeFila(f).map((c) => `<td>${formatoEnLinea(c)}</td>`).join('') + '</tr>')
              .join('') +
            '</tbody></table>',
        )
      }
      continue
    }

    const viñeta = linea.match(/^\s*[-*•]\s+(.*)$/)
    const numerada = linea.match(/^\s*\d+[.)]\s+(.*)$/)
    if (viñeta || numerada) {
      cerrarParrafo()
      const tipo: 'ul' | 'ol' = viñeta ? 'ul' : 'ol'
      if (lista !== tipo) {
        cerrarLista()
        salida.push(`<${tipo}>`)
        lista = tipo
      }
      salida.push(`<li>${formatoEnLinea((viñeta || numerada)![1])}</li>`)
      continue
    }

    cerrarLista()
    parrafo.push(linea.trim())
  }

  cerrarParrafo()
  cerrarLista()
  return salida.join('\n')
}

const ESTILOS = `
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #222; margin: 2cm; }
  h1 { font-size: 20pt; color: #54142B; border-bottom: 2px solid #B08D57; padding-bottom: 6px; }
  h2 { font-size: 15pt; color: #54142B; margin-top: 22px; }
  h3 { font-size: 12.5pt; color: #4C2032; margin-top: 16px; }
  h4 { font-size: 11.5pt; color: #4C2032; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  th, td { border: 1px solid #bbb; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: #f1e8dc; }
  hr { border: 0; border-top: 1px solid #ccc; margin: 16px 0; }
  code { font-family: Consolas, monospace; }
  @media print { body { margin: 0; } }
`

function armarDocumentoHtml(titulo: string, markdown: string): string {
  return (
    '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    `<head><meta charset="utf-8"/><title>${escaparHtml(titulo)}</title><style>${ESTILOS}</style></head>` +
    `<body><h1>${escaparHtml(titulo)}</h1>${markdownAHtml(markdown)}</body></html>`
  )
}

/** Descarga el texto como documento de Word (.doc). */
export function descargarComoWord(nombreArchivoSinExtension: string, titulo: string, markdown: string) {
  const html = '﻿' + armarDocumentoHtml(titulo, markdown)
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombreArchivoSinExtension}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Abre el documento y la ventana de imprimir, para guardarlo como PDF. */
export function guardarComoPdf(titulo: string, markdown: string) {
  const ventana = window.open('', '_blank')
  if (!ventana) {
    alert('Tu navegador bloqueó la ventana. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.')
    return
  }
  ventana.document.open()
  ventana.document.write(armarDocumentoHtml(titulo, markdown))
  ventana.document.close()
  ventana.focus()
  setTimeout(() => ventana.print(), 400)
}
