import React from 'react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-color-base-100 text-color-base-content py-32 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Términos de Servicio</h1>
        <p className="text-color-base-content/60">Última actualización: Abril 2026</p>
        
        <div className="prose prose-sm md:prose-base max-w-none text-color-base-content">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar ECOSERVING, aceptas estar sujeto a estos Términos de Servicio y a todas las leyes 
            y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, tienes prohibido usar o acceder a este sitio.
          </p>

          <h2>2. Licencia de Uso</h2>
          <p>
            Se concede permiso para utilizar temporalmente las herramientas y el contenido de la plataforma de ECOSERVING 
            según el plan de suscripción que hayas adquirido. Esto es el otorgamiento de una licencia, no una transferencia de título.
          </p>
          <p>
            Bajo esta licencia <strong>no puedes</strong>:
          </p>
          <ul>
            <li>Modificar o copiar el código fuente de la plataforma.</li>
            <li>Usar la plataforma para propósitos ilegales o para generar contenido malicioso, dañino o que viole regulaciones ambientales.</li>
            <li>Intentar descompilar o aplicar ingeniería inversa a cualquier software contenido en el sitio web.</li>
            <li>Eliminar cualquier derecho de autor u otras anotaciones de propiedad de los materiales.</li>
          </ul>

          <h2>3. Generación por IA</h2>
          <p>
            El contenido generado por nuestras herramientas es producto de Inteligencia Artificial. Aunque nos esforzamos 
            por lograr la mayor precisión, ECOSERVING no garantiza la exactitud técnica de los proyectos ambientales generados. 
            El usuario es el único responsable de validar y verificar los datos y estrategias antes de su implementación en el mundo real.
          </p>

          <h2>4. Suscripciones y Pagos</h2>
          <p>
            Los pagos se procesan de forma segura. Las suscripciones se renuevan automáticamente al final de cada ciclo de facturación 
            a menos que se cancelen con antelación. No se emiten reembolsos por períodos de suscripción no utilizados.
          </p>

          <h2>5. Limitaciones</h2>
          <p>
            En ningún caso ECOSERVING o sus proveedores serán responsables de ningún daño (incluidos, entre otros, daños por pérdida de 
            datos o ganancias, o debido a la interrupción del negocio) que surja del uso o la incapacidad de usar la plataforma.
          </p>

          <h2>6. Contacto Legal</h2>
          <p>
            Cualquier disputa o duda respecto a estos términos debe ser dirigida a: <strong>servingbuilderapp@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
