import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-color-base-100 text-color-base-content py-32 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Políticas de Privacidad</h1>
        <p className="text-color-base-content/60">Última actualización: Abril 2026</p>
        
        <div className="prose prose-sm md:prose-base max-w-none text-color-base-content">
          <h2>1. Información que recopilamos</h2>
          <p>
            En ECOSERVING, recopilamos información personal básica como tu nombre y correo electrónico cuando te registras. 
            También almacenamos los datos que introduces en nuestros motores de IA para generar los reportes y proyectos ambientales.
          </p>

          <h2>2. Cómo usamos tu información</h2>
          <p>
            Utilizamos tu información exclusivamente para proveer, mantener y mejorar nuestros servicios de IA generativa. 
            Tus prompts y resultados son utilizados para entrenar modelos internos de forma anónima, a menos que tengas un plan 
            Empresarial con privacidad estricta.
          </p>

          <h2>3. Compartir información</h2>
          <p>
            No vendemos ni alquilamos tu información personal a terceros. Solo compartimos datos con proveedores de servicios 
            esenciales (como procesadores de pago o infraestructura de IA) bajo estrictos acuerdos de confidencialidad.
          </p>

          <h2>4. Seguridad de los datos</h2>
          <p>
            Implementamos medidas de seguridad de nivel bancario para proteger tus datos contra acceso no autorizado, 
            alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
          </p>

          <h2>5. Tus derechos</h2>
          <p>
            Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. 
            Puedes hacerlo directamente desde tu panel de configuración o contactando a nuestro equipo de soporte.
          </p>

          <h2>6. Contacto</h2>
          <p>
            Si tienes preguntas sobre estas políticas, contáctanos en: <strong>servingbuilderapp@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
