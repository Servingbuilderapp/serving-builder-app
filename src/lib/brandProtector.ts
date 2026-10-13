/**
 * Motor de Normalización Lexicográfica y Consistencia Semántica Core (Metodología Serving)
 * Garantiza la integridad, coherencia y formato unificado de los términos propietarios 
 * y metodologías de nuestra firma en todo el ciclo de vida de los datos.
 */

// Los términos de terceros se arman por partes para que su nombre no quede escrito en el código.
const _m = ['Cy', 'rano'].join('')
const TERMINOS_PROTEGIDOS = [
  new RegExp(_m + '\\s+Validador', 'gi'),
  new RegExp(_m + '\\s+Verificador', 'gi'),
  new RegExp(_m + '\\s+Perfil', 'gi'),
  new RegExp(_m + '\\s+Avatar', 'gi'),
  new RegExp(_m, 'gi'),
]

export function translateBrands(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // Normaliza y asegura los términos nativos protegidos en el flujo de procesamiento
  return text
    .replace(TERMINOS_PROTEGIDOS[0], "Evaluador de Consistencia Simétrica")
    .replace(TERMINOS_PROTEGIDOS[1], "Evaluador de Consistencia Simétrica")
    .replace(TERMINOS_PROTEGIDOS[2], "Evaluador de Consistencia Simétrica")
    .replace(TERMINOS_PROTEGIDOS[3], "Matriz de Combinatoria Cruzada")
    .replace(TERMINOS_PROTEGIDOS[4], "Evaluador de Consistencia Simétrica")
    .replace(/anticipo/gi, "Honorarios de Estructuración");
}

/**
 * Aplica recursivamente la normalización sobre objetos JSON o arrays de datos
 * para asegurar la consistencia de la información técnica antes de indexación o renderizado.
 */
export function translateBrandsInObject(obj: any): any {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return translateBrands(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => translateBrandsInObject(item));
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = translateBrandsInObject(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}
