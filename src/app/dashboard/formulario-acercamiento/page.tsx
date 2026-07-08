'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { ArrowRight, Loader2, CheckCircle2, ArrowLeft, Trash2 } from 'lucide-react';
import { submitFormularioAction } from './actions';

export default function FormularioAcercamiento() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const initialBase = {
    nombre_cliente: '',
    correo_cliente: '',
    telefono_whatsapp: '',
  };

  const initialFase1 = {
    q1_nombre_iniciativa: '',
    q2_ubicacion: '',
    q3_sector: '',
    q4_tipo_solicitante: '',
    q5_problema_central: '',
    q6_afectados: '',
    q7_solucion: '',
    q8_objetivo_general: '',
    q9_monto_solicitado: '',
    q10_desglose_fondos: '',
  };

  const [baseData, setBaseData] = useState(initialBase);
  const [fase1Data, setFase1Data] = useState(initialFase1);

  // 1. Cargar desde localStorage
  useEffect(() => {
    const savedBase = localStorage.getItem('serving_fase1_base');
    const savedFase1 = localStorage.getItem('serving_fase1_data');
    const savedStep = localStorage.getItem('serving_fase1_step');
    
    try {
      if (savedBase) {
        const parsed = JSON.parse(savedBase);
        if (parsed) setBaseData(prev => ({ ...prev, ...parsed }));
      }
      if (savedFase1) {
        const parsed = JSON.parse(savedFase1);
        if (parsed) setFase1Data(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Error parsing localStorage data:", e);
    }
    
    if (savedStep) setStep(Number(savedStep) || 1);
    
    setIsLoaded(true);
  }, []);

  // 2. Guardar en localStorage cada vez que cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('serving_fase1_base', JSON.stringify(baseData));
      localStorage.setItem('serving_fase1_data', JSON.stringify(fase1Data));
      localStorage.setItem('serving_fase1_step', step.toString());
    }
  }, [baseData, fase1Data, step, isLoaded]);

  const updateBase = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseData({ ...baseData, [e.target.name]: e.target.value });
  };

  const updateFase1 = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFase1Data({ ...fase1Data, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const clearForm = () => {
    if (window.confirm("¿Estás seguro de que deseas limpiar todo el formulario y empezar desde cero?")) {
      setBaseData(initialBase);
      setFase1Data(initialFase1);
      setStep(1);
      localStorage.removeItem('serving_fase1_base');
      localStorage.removeItem('serving_fase1_data');
      localStorage.removeItem('serving_fase1_step');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nombre_cliente: baseData?.nombre_cliente || '',
        correo_cliente: baseData?.correo_cliente || '',
        telefono_whatsapp: baseData?.telefono_whatsapp || '',
        nombre_iniciativa: fase1Data?.q1_nombre_iniciativa || '',
        vertical_asignada: 'Pendiente de Evaluación',
        monto_solicitado_cop: Number((fase1Data?.q9_monto_solicitado || '').replace(/\D/g, '')) || 0,
        estado_actual: 'Insumos_Recibidos',
        respuestas_fase1_json: fase1Data
      };

      const data = await submitFormularioAction(payload);
      
      // Limpiamos la caché tras enviar exitosamente
      localStorage.removeItem('serving_fase1_base');
      localStorage.removeItem('serving_fase1_data');
      localStorage.removeItem('serving_fase1_step');

      router.push(`/dashboard/proyectos/${data.id}`);

    } catch (err: any) {
      console.error("Error guardando proyecto:", err);
      alert("Error: " + (err.message || JSON.stringify(err)));
      setLoading(false);
    }
  };

  // Evitar hidrataciones incorrectas mostrando null hasta cargar
  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue glow-text-blue" /></div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-start mb-8">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-black text-white drop-shadow-md tracking-tighter uppercase italic">
            Formulario de Acercamiento <span className="text-brand-blue glow-text-blue">Fase 1</span>
          </h1>
          <p className="text-gray-400 font-medium">Filtro Comercial para Evaluación Predictiva de Viabilidad</p>
        </div>
        <button onClick={clearForm} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full transition-colors">
          <Trash2 className="w-3 h-3" /> Limpiar
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5/10 -z-10 rounded-full" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-blue glow-blue border-0 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= i ? 'bg-brand-blue glow-blue border-0 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] shadow-blue-600/30' : 'bg-white/5/10 text-gray-400'}`}>
            {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
          </div>
        ))}
      </div>

      <GlassCard className="p-8">
        <form id="fase1-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-2 mb-6 text-white">Datos de Contacto</h2>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Nombre Completo del Responsable</label>
                <input required type="text" name="nombre_cliente" value={baseData.nombre_cliente} onChange={updateBase} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Carlos Mendoza" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Correo Electrónico</label>
                <input required type="email" name="correo_cliente" value={baseData.correo_cliente} onChange={updateBase} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. carlos@empresa.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Teléfono / WhatsApp</label>
                <input required type="tel" name="telefono_whatsapp" value={baseData.telefono_whatsapp} onChange={updateBase} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+57 300 123 4567" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-2 mb-6 text-white">Identidad de la Iniciativa</h2>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">1. Nombre oficial o propuesto de la iniciativa o proyecto.</label>
                <input required type="text" name="q1_nombre_iniciativa" value={fase1Data.q1_nombre_iniciativa} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none" placeholder="El nombre de tu proyecto" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">2. Ubicación geográfica exacta donde se ejecutará.</label>
                <input required type="text" name="q2_ubicacion" value={fase1Data.q2_ubicacion} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none" placeholder="Municipio, Departamento, Región" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">3. Sector económico principal al que pertenece.</label>
                <select required name="q3_sector" value={fase1Data.q3_sector} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none">
                  <option value="">Selecciona un sector...</option>
                  
                  <optgroup label="🌳 Medio Ambiente">
                    <option value="Medición de Huella de Carbono">Medición de Huella de Carbono</option>
                    <option value="Medición de Huella Hídrica">Medición de Huella Hídrica</option>
                    <option value="Economía Circular y Gestión de Residuos">Economía Circular y Gestión de Residuos</option>
                    <option value="Tratamiento y Conservación de Aguas">Tratamiento y Conservación de Aguas</option>
                    <option value="Reforestación y Restauración Ecológica">Reforestación y Restauración Ecológica</option>
                    <option value="Bioenergía y Compostaje Industrial">Bioenergía y Compostaje Industrial</option>
                  </optgroup>

                  <optgroup label="🚀 Emprendimiento / Empresas">
                    <option value="Micro-apps y SaaS para PyMEs">Micro-apps y SaaS para PyMEs</option>
                    <option value="Startups Tecnológicas en Fase Temprana">Startups Tecnológicas en Fase Temprana</option>
                    <option value="Financiamiento y Aceleración de Negocios">Financiamiento y Aceleración de Negocios</option>
                    <option value="Modelos de Negocio Franquiciables">Modelos de Negocio Franquiciables</option>
                    <option value="Comercio Electrónico y D2C">Comercio Electrónico y D2C</option>
                    <option value="Desarrollo de Proveedores Locales">Desarrollo de Proveedores Locales</option>
                  </optgroup>

                  <optgroup label="🧠 Salud Mental">
                    <option value="Salud y Seguridad en el Trabajo (SST)">Salud y Seguridad en el Trabajo (SST)</option>
                    <option value="Programas de Bienestar y Clima Organizacional">Programas de Bienestar y Clima Organizacional</option>
                    <option value="Plataformas de Apoyo Psicológico Digital">Plataformas de Apoyo Psicológico Digital</option>
                    <option value="Prevención de Desgaste Laboral (Burnout)">Prevención de Desgaste Laboral (Burnout)</option>
                    <option value="Mindfulness y Terapia Ocupacional">Mindfulness y Terapia Ocupacional</option>
                    <option value="Intervención de Estrés Postraumático Comunitario">Intervención de Estrés Postraumático Comunitario</option>
                  </optgroup>

                  <optgroup label="🤝 Proyectos Sociales / Vulnerabilidad">
                    <option value="Empoderamiento de Mujeres Rurales">Empoderamiento de Mujeres Rurales</option>
                    <option value="Integración de Población Migrante">Integración de Población Migrante</option>
                    <option value="Infraestructura Comunitaria Sostenible">Infraestructura Comunitaria Sostenible</option>
                    <option value="Reducción de Pobreza Extrema">Reducción de Pobreza Extrema</option>
                    <option value="Soberanía Alimentaria en Zonas Vulnerables">Soberanía Alimentaria en Zonas Vulnerables</option>
                    <option value="Inclusión de Personas con Discapacidad">Inclusión de Personas con Discapacidad</option>
                  </optgroup>

                  <optgroup label="💡 Innovación / Tecnología">
                    <option value="Inteligencia Artificial Aplicada">Inteligencia Artificial Aplicada</option>
                    <option value="Tecnología Dermocosmética (Skin-Tech)">Tecnología Dermocosmética (Skin-Tech)</option>
                    <option value="Blockchain y Tokenización de Activos">Blockchain y Tokenización de Activos</option>
                    <option value="Internet de las Cosas (IoT) Industrial">Internet de las Cosas (IoT) Industrial</option>
                    <option value="Impresión 3D y Manufactura Aditiva">Impresión 3D y Manufactura Aditiva</option>
                    <option value="Ciberseguridad y Protección de Datos">Ciberseguridad y Protección de Datos</option>
                  </optgroup>

                  <optgroup label="🎓 Educación / Cultura / Liderazgo">
                    <option value="Formación en Liderazgo y Gobernanza">Formación en Liderazgo y Gobernanza</option>
                    <option value="Educación STEM para Jóvenes">Educación STEM para Jóvenes</option>
                    <option value="Preservación de Patrimonio Cultural">Preservación de Patrimonio Cultural</option>
                    <option value="Escuelas de Formación Artística">Escuelas de Formación Artística</option>
                    <option value="Plataformas E-learning de Habilidades Blandas">Plataformas E-learning de Habilidades Blandas</option>
                    <option value="Alfabetización Digital Comunitaria">Alfabetización Digital Comunitaria</option>
                  </optgroup>

                  <optgroup label="🌾 Agro / Agroindustrial">
                    <option value="Ganadería Tecnificada (Ganadería Pro)">Ganadería Tecnificada (Ganadería Pro)</option>
                    <option value="Cultivo de Arándanos y Frutas de Exportación">Cultivo de Arándanos y Frutas de Exportación</option>
                    <option value="Agricultura de Precisión e Hidroponía">Agricultura de Precisión e Hidroponía</option>
                    <option value="Procesamiento Agroindustrial de Alimentos">Procesamiento Agroindustrial de Alimentos</option>
                    <option value="Sistemas de Riego Automatizado">Sistemas de Riego Automatizado</option>
                    <option value="Certificaciones Orgánicas y Comercio Justo">Certificaciones Orgánicas y Comercio Justo</option>
                  </optgroup>

                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">4. Tipo de solicitante.</label>
                <select required name="q4_tipo_solicitante" value={fase1Data.q4_tipo_solicitante} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none">
                  <option value="">Selecciona tipo...</option>
                  <option value="Persona Natural">Persona Natural</option>
                  <option value="Persona Natural con Establecimiento">Persona Natural con Establecimiento de Comercio</option>
                  <option value="Empresa Constituida">Empresa Constituida (SAS, LTDA, SA)</option>
                  <option value="Entidad Sin Ánimo de Lucro">Entidad Sin Ánimo de Lucro (ESAL, Fundación)</option>
                  <option value="Asociación o Cooperativa">Asociación Gremial o Cooperativa</option>
                  <option value="Junta de Acción Comunal">Junta de Acción Comunal (JAC)</option>
                  <option value="Cabildo o Resguardo">Cabildo o Resguardo Indígena</option>
                  <option value="Consejo Comunitario">Consejo Comunitario</option>
                  <option value="Consorcio o Unión Temporal">Consorcio o Unión Temporal</option>
                  <option value="Entidad Pública">Entidad Pública</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-2 mb-6 text-white">El Problema y la Población</h2>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">5. ¿Cuál es el problema central o la necesidad crítica identificada en el territorio o mercado?</label>
                <textarea required rows={4} name="q5_problema_central" value={fase1Data.q5_problema_central} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none" placeholder="Describe el problema de forma concisa..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">6. ¿Quiénes son los afectados directos por la situación actual (población objetivo)?</label>
                <textarea required rows={3} name="q6_afectados" value={fase1Data.q6_afectados} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none" placeholder="Detalla las características de los afectados..." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-2 mb-6 text-white">La Solución y los Objetivos</h2>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">7. Descripción general de la solución o idea que propone.</label>
                <textarea required rows={4} name="q7_solucion" value={fase1Data.q7_solucion} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none" placeholder="Explica cómo tu iniciativa resuelve el problema..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">8. Objetivo General: ¿Qué meta macro quiere alcanzar con el proyecto?</label>
                <textarea required rows={3} name="q8_objetivo_general" value={fase1Data.q8_objetivo_general} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none" placeholder="El objetivo principal de esta solicitud..." />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-2 mb-6 text-white">Finanzas y Destino (Módulo Crítico)</h2>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">9. Monto total de capital estimado o requerido que necesita conseguir.</label>
                <input required type="text" name="q9_monto_solicitado" value={fase1Data.q9_monto_solicitado} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-white/10 outline-none text-lg font-medium text-brand-blue glow-text-blue" placeholder="Ej. 100,000 USD o 400,000,000 COP" />
              </div>
              <div className="bg-brand-blue/10 p-4 rounded-xl border border-brand-blue/20">
                <label className="block text-sm font-black text-white drop-shadow-md mb-2">10. Desglose y destino estimado de los fondos (CRÍTICO):</label>
                <p className="text-xs text-gray-400 mb-3 italic">
                  ¿En qué áreas, activos o rubros específicos planea invertir el capital solicitado? Por favor, describa de forma detallada la distribución del dinero (por ejemplo: adquisición de maquinaria o tecnología, construcción de infraestructura física, compra de terrenos o insumos, contratación de personal técnico, capital de trabajo operativo, o marketing y comercialización) y justifique por qué cada inversión es crítica para el éxito del proyecto.
                </p>
                <textarea required rows={6} name="q10_desglose_fondos" value={fase1Data.q10_desglose_fondos} onChange={updateFase1} className="w-full p-3 rounded-lg border bg-black/40 text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue border-brand-blue/30 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mi distribución de inversión será..." />
              </div>
            </div>
          )}

          {/* Botonera inferior */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-white/5">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-4 py-2 text-gray-400 font-semibold flex items-center gap-2 hover:bg-white/5/5 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" /> Atrás
              </button>
            ) : <div />}
            
            {step < 5 ? (
              <GlowButton type="button" onClick={() => {
                const form = document.getElementById('fase1-form') as HTMLFormElement;
                if (form && form.reportValidity()) {
                  nextStep();
                }
              }} className="flex items-center gap-2 bg-brand-blue glow-blue border-0 hover:bg-blue-700">
                Siguiente <ArrowRight className="w-4 h-4" />
              </GlowButton>
            ) : (
              <GlowButton type="submit" disabled={loading} className="flex items-center gap-2 bg-emerald-600 hover:bg-green-700 shadow-green-500/30">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                {loading ? 'Calculando Viabilidad IA...' : 'Enviar a Evaluación Predictiva'}
              </GlowButton>
            )}
          </div>

        </form>
      </GlassCard>
    </div>
  );
}
