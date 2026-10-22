import {
  TEXTO_ESCALA_EXITO_GENERAL,
  TEXTO_ESCALA_EXITO_FONDO_EMPRENDER,
  TEXTO_CONVERSION_EXITO,
  PLAZO_PAGO_EXITO_DIAS,
} from '@/lib/comisionExito'
import { TEXTO_CLAUSULA_REPLICA, TITULO_CLAUSULA_REPLICA } from '@/lib/clausulaReplica'

/**
 * Texto legal del contrato de Estructuración (habeas data + términos).
 * Vive aquí, en un solo sitio, para que la pantalla de contratar y la de
 * cortesía lean exactamente las mismas palabras.
 */
export const TEXTO_CONTRATO = `AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES
Y TÉRMINOS DEL SERVICIO DE DIAGNÓSTICO Y ESTRUCTURACIÓN DE PROYECTOS

1. RESPONSABLE DEL TRATAMIENTO
SERVING PROYECTOS ESTRATÉGICOS SAS, NIT 901.972.451-7, propietaria y operadora de la
plataforma "Arquitectura Digital", con correo de contacto
servingbuilderapp@gmail.com, es responsable del tratamiento de los datos
personales que usted suministra a través de esta plataforma.

2. FINALIDAD DEL TRATAMIENTO
Los datos personales, financieros y del proyecto que usted suministra serán
utilizados exclusivamente para:
  a) Elaborar el diagnóstico de viabilidad de su proyecto.
  b) Realizar la estructuración, formulación técnica y documentación de su
     proyecto conforme al plan contratado.
  c) Identificar convocatorias, fondos, cooperantes internacionales y
     entidades de financiamiento compatibles con su perfil, y acompañar la
     postulación de su proyecto ante dichas fuentes una vez el cliente
     entregue la información y documentación que cada una exija.
  d) Contactarlo por correo electrónico o WhatsApp para dar seguimiento a su
     proceso.
  e) Fines administrativos, contables y de facturación del servicio
     contratado.

3. DATOS QUE SE RECOLECTAN
Nombre, correo electrónico, número de teléfono/WhatsApp, información sobre
su proyecto u organización, estado legal de la empresa, monto de
financiamiento requerido, y demás información que usted suministre
voluntariamente durante el diagnóstico y la estructuración.

4. TRANSFERENCIA A TERCEROS
Como parte necesaria del servicio, su información y la documentación de su
proyecto podrán ser compartidas con los fondos, cooperantes, entidades
gubernamentales o financiadores específicos ante quienes se postule su
proyecto, únicamente con el fin de tramitar dicha postulación.
No se venderá ni cederá su información a terceros con fines distintos a los
aquí descritos.

5. DERECHOS DEL TITULAR (Ley 1581 de 2012)
Usted tiene derecho a conocer, actualizar, rectificar y solicitar la
supresión de sus datos personales, así como a revocar esta autorización en
cualquier momento, enviando su solicitud al correo
servingbuilderapp@gmail.com.

6. VIGENCIA
Sus datos serán conservados durante el tiempo que dure la relación
comercial y el tiempo adicional que exijan las obligaciones legales,
contables o fiscales aplicables.

7. CONDICIONES DEL SERVICIO CONTRATADO
Al firmar y proceder con el pago del plan seleccionado, usted contrata el
servicio de estructuración de proyecto descrito en la oferta, que incluye
el proceso de formulación técnica y el período de búsqueda, encaje y
acompañamiento para la postulación a convocatorias indicado en el plan
elegido (3 o 6 meses, según el plan), sujeto a lo establecido en la
Cláusula 9 sobre el alcance y límite de esta responsabilidad. Si al
finalizar dicho período no se ha logrado la aprobación de financiamiento,
ARQUITECTURA DIGITAL extenderá el período de búsqueda de convocatorias por
el mismo tiempo adicional, sin costo extra, en los términos ofrecidos.

Todos los valores de los planes se expresan SIN IVA. Al valor del plan se
suma el IVA a la tarifa vigente (19%), que se factura y declara conforme a
la ley. El valor total se paga en dos contados iguales, IVA incluido: el
primero al firmar, con el cual inicia la estructuración; y el segundo el
día de la entrega del proyecto estructurado, con el cual inicia el período
de búsqueda de convocatorias, postulación y radicación.

8. NATURALEZA DEL SERVICIO Y AUSENCIA DE GARANTÍA DE RESULTADO
Los diagnósticos, calificaciones y análisis que muestra esta plataforma
tienen como finalidad optimizar y fortalecer la estructuración de su
proyecto. ARQUITECTURA DIGITAL no puede garantizar la aprobación,
adjudicación o desembolso de ninguna subvención, convocatoria, beca o
fuente de financiamiento, ya que dicha decisión depende exclusivamente de
los analistas y comités evaluadores de cada entidad convocante, ajenos a
esta plataforma.

El resultado final de cada postulación dependerá de su esfuerzo,
experiencia y capacidad de ejecución, combinados con la rapidez y
tecnología que ARQUITECTURA DIGITAL aporta para producir proyectos más
robustos, profesionales y con alta probabilidad de éxito. El servicio
contratado incluye el derecho a que su proyecto sea presentado, sin
restricción de cantidad, a todas las convocatorias que la plataforma
identifique como compatibles durante el período contratado, siempre sujeto
a que el cliente entregue oportunamente la información y documentación que
cada convocatoria exija, conforme a la Cláusula 9.

9. ALCANCE Y LÍMITE DE LA RESPONSABILIDAD DEL SERVICIO
La responsabilidad de ARQUITECTURA DIGITAL consiste en: (i) identificar
convocatorias y fuentes de financiamiento compatibles con el proyecto,
(ii) realizar el encaje técnico entre el proyecto y cada convocatoria
identificada, y (iii) entregar al cliente los Términos de Referencia (TDR)
de dichas convocatorias en el menor tiempo posible.

Una vez el cliente entrega la totalidad de la información y documentación
que cada TDR exige, ARQUITECTURA DIGITAL acompaña al cliente hasta la
radicación de la postulación. La consecución de los documentos,
certificaciones, requisitos o información particular que cada convocatoria
exija al postulante es responsabilidad exclusiva del cliente; ARQUITECTURA
DIGITAL no es responsable de la demora o imposibilidad de reunir dichos
requisitos.

10. POLÍTICA DE NO DEVOLUCIÓN
Una vez firmado este contrato y confirmado el pago, el valor pagado por el
servicio de estructuración no es reembolsable bajo ninguna circunstancia,
incluyendo la no obtención de financiamiento en las convocatorias
postuladas, dado que el servicio contratado corresponde al trabajo de
estructuración, encaje y acompañamiento descrito en este documento, y no a
la obtención garantizada de un resultado final que depende de terceros.

11. VALOR DEL SERVICIO Y COMISIÓN DE ÉXITO
El valor del plan contratado corresponde únicamente al servicio de
estructuración, formulación y búsqueda/encaje de convocatorias. En caso de
que el proyecto sea aprobado y reciba desembolso de financiamiento como
resultado de una postulación gestionada por ARQUITECTURA DIGITAL, el
cliente reconocerá adicionalmente una comisión de éxito sobre el monto
efectivamente desembolsado, según la siguiente escala:

${TEXTO_ESCALA_EXITO_GENERAL}

${TEXTO_CONVERSION_EXITO}

La comisión será exigible y pagadera inmediatamente el cliente reciba el
desembolso, dentro de un plazo máximo de ${PLAZO_PAGO_EXITO_DIAS} días calendario desde la
fecha de recepción del dinero, o según las estipulaciones y calendario de
desembolsos propios de cada convocatoria o fondo, lo que resulte aplicable.

Nota: en el caso específico de postulaciones al Fondo Emprender, la
comisión de éxito se rige por condiciones diferentes a las aquí descritas,
detalladas en el Anexo 1 de este contrato.

ANEXO 1 — CONDICIONES ESPECÍFICAS PARA PROYECTOS DE FONDO EMPRENDER

Para proyectos que se estructuren con el objetivo específico de postularse
al Fondo Emprender, aplican las siguientes condiciones, que reemplazan lo
establecido en la Cláusula 7 (Valor del Plan) y en la Cláusula 11 (Comisión
de Éxito general) únicamente para este tipo de proyecto:

1. Valor de estructuración: en lugar de los valores establecidos para los
   planes Estructuración Estratégica o Estructuración Élite, el servicio de
   estructuración, formulación y
   acompañamiento para proyectos de Fondo Emprender tiene un valor fijo
   según el rango de financiación solicitada, así:

   - Hasta $60.000.000 COP: sin costo de estructuración (solo aplica la
     comisión de éxito del numeral 2)
   - De $60.000.001 a $70.000.000 COP: $2.000.000 COP + IVA
   - De $70.000.001 a $150.000.000 COP: $7.000.000 COP + IVA
   - Más de $150.000.000 COP: $10.000.000 COP + IVA

2. Comisión de éxito: en caso de que el proyecto sea aprobado y reciba
   desembolso por parte del Fondo Emprender, el cliente reconocerá
   adicionalmente una comisión de éxito, calculada como un porcentaje sobre
   el monto de financiación aprobada, según el siguiente rango:

${TEXTO_ESCALA_EXITO_FONDO_EMPRENDER}

   Esta comisión de éxito es exigible y pagadera bajo las mismas condiciones
   de plazo establecidas en la Cláusula 11 para el resto de fuentes de
   financiamiento.

12. VERACIDAD DE LA INFORMACIÓN
Usted declara que la información suministrada es veraz, completa y de su
autoría o representación legítima, y que cuenta con la facultad para
autorizar su tratamiento y contratar este servicio.

13. ${TITULO_CLAUSULA_REPLICA}
${TEXTO_CLAUSULA_REPLICA}

Al marcar la casilla de aceptación, usted confirma que ha leído y acepta
este documento en su totalidad, y que dicha aceptación, junto con la fecha,
hora e IP de la sesión, quedará registrada como constancia de firma
electrónica.`

function seccion(n: number): string {
  const re = new RegExp('^' + n + '\\. [^\\n]*\\n[\\s\\S]*?(?=^' + (n + 1) + '\\. )', 'm')
  return (TEXTO_CONTRATO.match(re)?.[0] || '').trim()
}

/**
 * Lo que lee y acepta quien recibe una cortesía: la autorización de datos
 * personales (cláusulas 1 a 6, Ley 1581) y las cláusulas generales que sí
 * aplican sin pago (8 naturaleza y no garantía, 9 alcance y límite, 12
 * veracidad). Las de precio, devolución y réplica no aplican a una cortesía.
 */
export const TEXTO_LEGAL_CORTESIA = [
  'AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES Y TÉRMINOS DEL SERVICIO',
  ...[1, 2, 3, 4, 5, 6, 8, 9, 12].map(seccion),
].join('\n\n')
