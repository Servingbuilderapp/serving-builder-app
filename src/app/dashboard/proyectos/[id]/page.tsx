'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Loader2, FileText, CheckCircle2, TrendingUp, AlertCircle, Calendar as CalendarIcon, Activity, X, ChevronRight, ArrowRight, ShieldCheck, Cpu, Leaf, Users, ShieldAlert, FileCheck, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlowButton } from '@/components/ui/GlowButton';
import { getProyectoAction, agendarCitaAction, updateConfiguredAristasAction, applyPlanAndUpsellAction, firmarContratoAction, applyAllyCouponAction } from './actions';
import { getBibliotecaPortalesAction, ejecutarDeconstruccionInversaAction } from './cierreActions';

const ADVISOR_MAP: Record<string, string> = {
  "Fondo Emprender (Ruta asignada a Yeison Arcia)": "Yeison Arcia",
  "Estructuración (Ruta asignada a Motor de Auto-formulación)": "Estructuración",
  "Préstamo por Broker de Citibank (Ruta asignada a Alfonso Beltrán)": "Alfonso Beltrán",
  "Crédito blando con CFC (Ruta asignada a Marco Campoverde)": "Marco Campoverde",
  "Tokenización (Ruta asignada a Edward)": "Edward",
  "Banca Internacional y Nacional (Ruta asignada a Lorena Ramírez)": "Lorena Ramírez",
  "Subvención (Ruta asignada a Estructurador Senior)": "Estructurador Senior",
  "Otra": "Especialista Financiero"
};

const ALL_ARISTAS = [
  { id: 'medio_ambiente', name: 'Medio Ambiente y Sostenibilidad' },
  { id: 'educacion', name: 'Educación y Formación' },
  { id: 'emprendimiento', name: 'Emprendimiento y Capital Semilla' },
  { id: 'empresas', name: 'Desarrollo Empresarial' },
  { id: 'salud_mental', name: 'Salud Mental y Bienestar Social' },
  { id: 'innovacion', name: 'Innovación y Tecnología' },
  { id: 'agro', name: 'Desarrollo Agrícola y Rural' },
  { id: 'liderazgo', name: 'Liderazgo y Gobernanza' },
  { id: 'vulnerabilidad_y_social', name: 'Inclusión y Desarrollo Social' }
];

export default function ProyectoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dossierMarkdown, setDossierMarkdown] = useState<string | null>(null);

  // Estados del Calendario Nativo
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'evaluacion' | 'territorial' | 'problema' | 'arboles' | 'cadena' | 'impactos' | 'plan_pert' | 'viabilidad' | 'cierre'>('evaluacion');

  // Estados de Limitación de Aristas y Simulación
  const [selectedAristas, setSelectedAristas] = useState<string[]>([]);
  const [savingAristas, setSavingAristas] = useState(false);
  const [aristasSuccess, setAristasSuccess] = useState(false);
  const [aristasError, setAristasError] = useState<string | null>(null);

  const [simPlan, setSimPlan] = useState<'BASE' | 'PRO' | 'VIP' | 'TOP'>('BASE');
  const [simUpsell, setSimUpsell] = useState<string>('Ninguno');
  const [simulating, setSimulating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Estados para Cierre Legal y Firma
  const [signatureName, setSignatureName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  // Estados del Guardián del Paso 3 y Sugerencia de Planes
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [guardianAuthorized, setGuardianAuthorized] = useState(false);
  const [showPlansSuggestion, setShowPlansSuggestion] = useState(false);

  // Estados para el motor de Cierre y Convocatorias (Pasos 4 & 5)
  const [moldes, setMoldes] = useState<any[]>([]);
  const [loadingMoldes, setLoadingMoldes] = useState(false);
  const [selectedMoldeId, setSelectedMoldeId] = useState<string | null>(null);
  const [deconstruccionResultado, setDeconstruccionResultado] = useState<any>(null);
  const [ejecutandoDeconstruccion, setEjecutandoDeconstruccion] = useState(false);




  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.email === 'servingbuilderapp@gmail.com') {
          setIsAdmin(true);
        } else {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          if (userData?.role === 'admin') {
            setIsAdmin(true);
          }
        }
      }

      await fetchProject();

      // Sondeo rápido cada 3 segundos para mostrar el progreso en tiempo real
      intervalId = setInterval(() => {
        fetchProject();
      }, 3000);
    };

    init();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, supabase]);

  const fetchProject = async () => {
    const data = await getProyectoAction(id);
    if (data) {
      setProject(data);
      setSelectedAristas(data.aristas_configuradas || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin && project?.dossier_markdown) {
      setDossierMarkdown(project.dossier_markdown);
    }
  }, [project?.dossier_markdown, isAdmin]);

  useEffect(() => {
    if (activeSubTab === 'cierre' && project) {
      const loadMoldes = async () => {
        setLoadingMoldes(true);
        try {
          const res = await getBibliotecaPortalesAction(id);
          setMoldes(res);
          
          // Si el proyecto ya tiene un encaje guardado, cargarlo en el estado
          if (project.resultado_agent_json?.encaje_convocatoria_actual) {
            setDeconstruccionResultado(project.resultado_agent_json.encaje_convocatoria_actual);
            setSelectedMoldeId(project.resultado_agent_json.encaje_convocatoria_actual.convocatoria_id);
          }
        } catch (err) {
          console.error("Error cargando moldes de biblioteca:", err);
        } finally {
          setLoadingMoldes(false);
        }
      };
      loadMoldes();
    }
  }, [activeSubTab, id, project]);

  const handleEjecutarDeconstruccion = async (moldeId: string) => {
    setEjecutandoDeconstruccion(true);
    setSelectedMoldeId(moldeId);
    try {
      const res = await ejecutarDeconstruccionInversaAction(id, moldeId);
      setDeconstruccionResultado(res);
      // Recargar proyecto para actualizar los datos en BD
      await fetchProject();
    } catch (err) {
      console.error("Error al ejecutar deconstrucción:", err);
    } finally {
      setEjecutandoDeconstruccion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-500 font-semibold tracking-widest uppercase">Cargando Proyecto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Proyecto no encontrado</h2>
      </div>
    );
  }

  const routing = project.aristas_impacto_json?.routing_predictivo;

  // Determinar el asesor basado en la ruta de mayor porcentaje
  let topAdvisor = "Especialista Financiero";
  let topRouteName = "Ruta Principal";
  if (routing && !routing.error) {
    let maxVal = -1;
    for (const [key, val] of Object.entries(routing)) {
      if (typeof val === 'number' && val > maxVal) {
        maxVal = val;
        topRouteName = key;
        topAdvisor = ADVISOR_MAP[key] || "Especialista Financiero";
      }
    }
  }

  // Generar próximos 5 días hábiles
  const generateAvailableDays = () => {
    const days = [];
    let date = new Date();
    while (days.length < 5) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        days.push(new Date(date));
      }
    }
    return days;
  };
  const availableDays = generateAvailableDays();
  const timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  // Definición de mensajes del Motor de 32 pasos basados en porcentaje
  const getStepLog = (progress: number) => {
    if (progress <= 20) return "Cargando archivo e interpretando árbol de objetivos (Paso 1-8)...";
    if (progress <= 50) return "Estructurando infraestructura física y capacidad instalada (Paso 9-16)...";
    if (progress <= 80) return "Modelando CAPEX, OPEX y canales de distribución (Paso 17-24)...";
    if (progress < 100) return "Transferiendo datos estructurados al Agente de Convocatorias (Paso 25-32)...";
    return "Estructuración completada con éxito. Agente de Convocatorias evaluado.";
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div className="relative pl-4 border-l-4 border-brand-blue">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
            Proyecto <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-cyan-400 glow-text-blue">#{project.id.slice(0, 8)}</span>
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mt-1 font-medium">
            <p>Vertical Asignada: <span className="font-bold text-gray-200">{project.vertical_asignada || 'Pendiente'}</span></p>
            {project.plan_pago && <p>• Plan: <span className="font-bold text-brand-blue glow-text-blue">{project.plan_pago}</span></p>}
            {project.archivo_proyecto_nombre && <p>• Archivo: <span className="font-bold text-gray-300">{project.archivo_proyecto_nombre}</span></p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.estado_actual === 'Insumos_Recibidos' && (
             <span className="px-4 py-1.5 rounded-full bg-amber-900/40 border border-amber-500/50 text-amber-400 font-bold text-xs tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
               <Loader2 className="w-3 h-3 animate-spin" /> En Cola
             </span>
          )}
          {project.estado_actual === 'Estructurando_IA' && (
             <span className="px-4 py-1.5 rounded-full bg-brand-blue/20 border border-brand-blue/50 text-cyan-400 font-bold text-xs tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] animate-pulse">
               <Activity className="w-3 h-3 animate-pulse text-cyan-400" /> Estructurando IA ({project.progreso_estructuracion || 0}%)
             </span>
          )}
          {project.estado_actual === 'En_Revision_Tecnica' && (
             <span className="px-4 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/50 text-emerald-400 font-bold text-xs tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-estructurado
             </span>
          )}
        </div>
      </div>

      {/* BARRA DE PROGRESO DE ESTADOS SECUENCIALES DEL EMBUDO */}
      <GlassCard className="p-4 border-white/5 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400">
          <span className="text-white uppercase tracking-widest text-[10px] shrink-0">Embudo de Estructuración:</span>
          
          <div className="w-full flex items-center justify-between relative pl-4 pr-4">
            {/* Timeline connectors */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-brand-blue to-cyan-400 -translate-y-1/2 z-0 transition-all duration-1000"
              style={{
                width: 
                  project.estado_actual === 'En_Revision_Tecnica' ? '100%' :
                  project.estado_actual === 'Estructurando_IA' ? '80%' :
                  ['pago_aprobado', 'Estructurando_IA'].includes(project.estado_actual) ? '60%' :
                  project.contrato_firmado ? '40%' : '15%'
              }}
            />

            {[
              { label: '1. Nicho', active: true, completed: true },
              { label: '2. Firma Contrato', active: true, completed: !!project.contrato_firmado },
              { label: '3. Pago Aprobado', active: !!project.contrato_firmado, completed: ['pago_aprobado', 'Estructurando_IA', 'En_Revision_Tecnica'].includes(project.estado_actual) || project.estado_comercial === 'Pago Realizado' },
              { label: '4. Estructuración IA', active: ['pago_aprobado', 'Estructurando_IA', 'En_Revision_Tecnica'].includes(project.estado_actual) || project.estado_comercial === 'Pago Realizado', completed: ['Estructurando_IA', 'En_Revision_Tecnica'].includes(project.estado_actual) },
              { label: '5. Revisión Técnica', active: ['Estructurando_IA', 'En_Revision_Tecnica'].includes(project.estado_actual), completed: project.estado_actual === 'En_Revision_Tecnica' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center z-10 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-black transition-all duration-500 ${
                  step.completed 
                    ? 'bg-brand-blue border-brand-blue text-white shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                    : step.active
                    ? 'bg-black/80 border-cyan-400 text-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.2)] animate-pulse'
                    : 'bg-black border-white/20 text-gray-600'
                }`}>
                  {step.completed ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] uppercase tracking-wider mt-1.5 hidden sm:block ${
                  step.completed ? 'text-white' : step.active ? 'text-cyan-400' : 'text-gray-600'
                }`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PREDICTIVE ROUTING */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 relative overflow-hidden group border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 relative z-10 text-gray-100">
              <TrendingUp className="w-5 h-5 text-brand-orange" />
              Viabilidad Comercial
            </h2>
            
            {!routing && (
               <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/20 rounded-xl opacity-60 relative z-10 bg-black/20">
                 <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-blue" />
                 <p className="text-sm text-center font-medium text-gray-400">El motor de IA está evaluando las rutas financieras...</p>
               </div>
            )}
            
            {routing && !routing.error && (
              <div className="space-y-5 relative z-10">
                {Object.entries(routing).map(([key, value]) => {
                  const isTop = key === topRouteName;
                  return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-semibold line-clamp-1 pr-2 ${isTop ? 'text-brand-blue glow-text-blue' : 'text-gray-400'}`}>{key}</span>
                      <span className={`font-black ${isTop ? 'text-white' : 'text-gray-300'}`}>{String(value)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${isTop ? 'bg-gradient-to-r from-brand-blue to-cyan-400 glow-blue' : 'bg-gray-600'}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                )})}
              </div>
            )}

            {project.estado_comercial === 'Pago Realizado' || !project.estado_comercial ? (
               <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                 <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                   <p className="text-sm text-emerald-400 font-bold flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pago Confirmado
                   </p>
                   <p className="text-xs text-emerald-500/80 mt-1">Tu proceso de estructuración ha sido habilitado.</p>
                 </div>
                 <GlowButton onClick={() => router.push(`/dashboard/formulario-tecnico/${project.id}`)} className="w-full flex items-center justify-center gap-2 shadow-xl bg-brand-blue hover:bg-cyan-600 text-white border-0">
                   Ir a Fase 2 (Dossier Técnico) <ArrowRight className="w-4 h-4" />
                 </GlowButton>
               </div>
            ) : (!isAdmin && routing && !routing.error && (
               <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                 {project.plan_pago?.toUpperCase() === 'BASE' ? (
                   <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                     <p className="text-sm text-amber-400 font-bold flex items-center gap-2">
                       <AlertCircle className="w-4 h-4 text-amber-400" /> Consultoría Bloqueada
                     </p>
                     <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                       El agendamiento con el especialista humano (<b className="text-white">{topAdvisor}</b>) está deshabilitado en el plan <b>BASE</b>. Actualice su plan a PRO, VIP o TOP.
                     </p>
                   </div>
                 ) : (
                   <>
                     <p className="text-sm text-gray-400 mb-4 font-medium leading-relaxed">
                       Nuestra IA determinó la máxima viabilidad hacia <b className="text-brand-blue glow-text-blue">{(topRouteName || '').split('(')[0]}</b>. Agenda tu sesión con <b className="text-white">{topAdvisor}</b> para proceder al levantamiento técnico.
                     </p>
                     {project.estado_comercial === 'Cita Agendada' ? (
                       <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-xl p-4 text-center shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                         <p className="text-sm text-brand-blue font-bold">Cita Agendada</p>
                         <p className="text-xs text-cyan-400 mt-1">Nos vemos el {project.fecha_cita} a las {project.hora_cita}</p>
                       </div>
                     ) : (
                       <GlowButton onClick={() => setShowCalendar(true)} className="w-full flex items-center justify-center gap-2 shadow-xl bg-white/5 border border-white/20 hover:bg-white/10 text-white">
                         <CalendarIcon className="w-4 h-4 text-brand-orange" /> Agendar Consultoría
                       </GlowButton>
                     )}
                   </>
                 )}
               </div>
            ))}
          </GlassCard>

          {/* TARJETA DE CIERRE LEGAL / CONTRATO DE ADHESIÓN */}
          <GlassCard className="p-6 relative overflow-hidden group border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 relative z-10 text-gray-100">
              <ShieldCheck className="w-5 h-5 text-brand-orange animate-pulse" />
              Contrato de Adhesión y Cotización
            </h2>
            <div className="space-y-4 relative z-10 text-xs">
              <div className="bg-black/50 border border-white/5 p-3 rounded-lg max-h-[180px] overflow-y-auto space-y-3 leading-relaxed text-gray-400 select-none">
                <p className="font-bold text-white uppercase text-[10px] tracking-wide">Cláusulas Obligatorias del Servicio:</p>
                <div className="border-t border-white/5 pt-2">
                  <b className="text-brand-orange">1. Labor de Medio, No de Resultado:</b> El alcance de Serving es estrictamente técnico y metodológico. La plataforma optimiza y estructura la propuesta bajo los más altos estándares ex-ante (DNP/MGA), pero no garantiza la obtención o adjudicación definitiva de fondos, decisión que compete únicamente al ente evaluador.
                </div>
                <div className="border-t border-white/5 pt-2">
                  <b className="text-brand-orange">2. Política de No Reembolso:</b> Debido al aprovisionamiento automático e inmediato de tokens de inteligencia artificial, la entrega de activos de software y la asignación del especialista financiero real desde el inicio del proceso, no se realizarán devoluciones ni reembolsos bajo ninguna circunstancia.
                </div>
                <div className="border-t border-white/5 pt-2">
                  <b className="text-brand-orange">3. Validación y Alcance de la Biblioteca:</b> Los datos extraídos del radar se consolidan en Supabase. La biblioteca metodológica del sistema aloja única y exclusivamente el conocimiento estratégico sobre "Cómo detectar aliados" y "Cómo hacer red de aliados".
                </div>
              </div>

              {project.contrato_firmado ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-center">
                  <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Contrato Firmado Digitalmente
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Firmante: <b className="text-white uppercase tracking-wider">{project.firma_digital}</b>
                  </p>
                  <p className="text-[9px] text-gray-500">Documento electrónico registrado en Supabase.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={acceptTerms} 
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 shrink-0" 
                    />
                    <label htmlFor="terms" className="text-[10px] text-gray-400 cursor-pointer select-none">
                      He leído y acepto expresamente las tres cláusulas innegociables de la cotización y el contrato de adhesión de Serving.
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Nombre Completo para Firma Digital</label>
                    <input 
                      type="text" 
                      placeholder="Escriba su nombre y apellido" 
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  {signError && (
                    <p className="text-[10px] text-red-400 bg-red-950/20 border border-red-500/30 p-2 rounded">{signError}</p>
                  )}

                  <GlowButton
                    onClick={async () => {
                      if (!acceptTerms) {
                        setSignError("Debe aceptar los términos para continuar.");
                        return;
                      }
                      if (signatureName.trim().length < 5) {
                        setSignError("Por favor ingrese su nombre completo para firmar.");
                        return;
                      }
                      setSigning(true);
                      setSignError(null);
                      const res = await firmarContratoAction(project.id, signatureName);
                      if (res.success) {
                        await fetchProject();
                      } else {
                        setSignError(res.error || "Ocurrió un error al firmar");
                      }
                      setSigning(false);
                    }}
                    disabled={signing}
                    className="w-full flex items-center justify-center gap-1 bg-brand-blue hover:bg-cyan-600 text-white font-bold text-[10px] uppercase tracking-wider border-0"
                  >
                    {signing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Firmar Contrato Electrónico
                  </GlowButton>
                </div>
              )}
            </div>
          </GlassCard>

          {/* SELECTOR DE ARISTAS */}
          <GlassCard className="p-6 relative overflow-hidden group border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 relative z-10 text-gray-100">
              <Layers className="w-5 h-5 text-brand-blue" />
              Aristas Configuradas
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-xs font-bold bg-white/5 p-2.5 rounded-lg border border-white/5">
                <span className="text-gray-400 uppercase tracking-wider">Plan Activo:</span>
                <span className="text-brand-blue font-black glow-text-blue">{project.plan_pago || 'BASE'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold bg-white/5 p-2.5 rounded-lg border border-white/5">
                <span className="text-gray-400 uppercase tracking-wider">Límite de Aristas:</span>
                <span className="text-white font-black">{selectedAristas.length} / {project.aristas_maximas || 1}</span>
              </div>

              {aristasError && (
                <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/30 p-2.5 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aristasError}</span>
                </div>
              )}

              {aristasSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Aristas actualizadas correctamente!</span>
                </div>
              )}

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {ALL_ARISTAS.map((arista) => {
                  const isChecked = selectedAristas.includes(arista.id);
                  const maxChecked = selectedAristas.length >= (project.aristas_maximas || 1);
                  const disabled = !isChecked && maxChecked;

                  return (
                    <button
                      key={arista.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        let newAristas = [...selectedAristas];
                        if (isChecked) {
                          newAristas = newAristas.filter(id => id !== arista.id);
                        } else {
                          newAristas.push(arista.id);
                        }
                        setSelectedAristas(newAristas);
                        setAristasError(null);
                        setAristasSuccess(false);
                      }}
                      className={`w-full flex justify-between items-center px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                        isChecked 
                          ? 'bg-brand-blue/20 border-brand-blue/40 text-cyan-400 font-bold'
                          : disabled
                          ? 'bg-black/20 border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                          : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      <span className="truncate">{arista.name}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black shrink-0 ${
                        isChecked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-500'
                      }`}>
                        {isChecked ? 'Activa' : 'Inactiva'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <GlowButton
                onClick={async () => {
                  setSavingAristas(true);
                  setAristasError(null);
                  setAristasSuccess(false);
                  const res = await updateConfiguredAristasAction(project.id, selectedAristas);
                  if (res.success) {
                    setAristasSuccess(true);
                    await fetchProject();
                  } else {
                    setAristasError(res.error || 'Ocurrió un error');
                  }
                  setSavingAristas(false);
                }}
                disabled={savingAristas}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-blue hover:bg-cyan-600 text-white text-xs font-black uppercase tracking-wider border-0"
              >
                {savingAristas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Guardar Configuración
              </GlowButton>
            </div>
          </GlassCard>

          {/* PROGRAMA DE REFERIDOS */}
          <GlassCard className="p-6 relative overflow-hidden group border-white/10 bg-[#0A101C]/80">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-3 relative z-10 text-gray-100">
              <Users className="w-5 h-5 text-cyan-400 animate-pulse" />
              Programa de Referidos
            </h2>
            <div className="space-y-4 relative z-10 text-xs">
              <div className="p-3 bg-black/50 border border-white/5 rounded-lg flex justify-between items-center">
                <div>
                  <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Tu Código Único</span>
                  <span className="font-black text-white text-sm tracking-wider glow-text-blue">{project.codigo_referido_unico || 'SERV-LAURA'}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(project.codigo_referido_unico || 'SERV-LAURA');
                    alert("¡Código de referidos copiado al portapapeles!");
                  }}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase text-white rounded transition-all"
                >
                  Copiar
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                  <span>Referidos Convertidos (Pagos):</span>
                  <span className="text-cyan-400 font-black">{project.pagos_referidos_efectivos || 0} / 4</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-brand-blue to-cyan-400 glow-blue transition-all duration-1000"
                    style={{ width: `${Math.min(100, ((project.pagos_referidos_efectivos || 0) / 4) * 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">
                  📢 **Upgrade de Red Automático:** Invita a 4 proyectos a pagar y tu plan se actualizará gratis e inmediatamente al siguiente nivel (Base ➔ Pro ➔ VIP ➔ TOP).
                </p>
              </div>
            </div>
          </GlassCard>

          {/* CONSOLA DE SIMULACIÓN COMERCIAL */}
          <GlassCard className="p-6 relative overflow-hidden group border-white/10 bg-[#0C1220]/75">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 relative z-10 text-gray-100">
              <Activity className="w-5 h-5 text-brand-orange" />
              Simulador Comercial (Desarrollo)
            </h2>
            <div className="space-y-4 relative z-10 text-xs text-gray-300">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan a Adquirir</label>
                <select
                  value={simPlan}
                  onChange={(e) => setSimPlan(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue transition-all"
                >
                  <option value="BASE">Plan BASE ($1.200)</option>
                  <option value="PRO">Plan PRO ($2.700)</option>
                  <option value="VIP">Plan VIP ($4.200)</option>
                  <option value="TOP">Plan TOP ($6.000)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Upsell Extra (Multiplicador)</label>
                <select
                  value={simUpsell}
                  onChange={(e) => setSimUpsell(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-blue transition-all"
                >
                  <option value="Ninguno">Ningún Upsell</option>
                  <option value="BASE_300">Upsell BASE (+300) [+3 meses / 1 arista]</option>
                  <option value="PRO_500">Upsell PRO (+500) [+5 meses / 2 aristas]</option>
                  <option value="VIP_800">Upsell VIP (+800) [+12 meses / 3 aristas]</option>
                  <option value="TOP_1200">Upsell TOP (+1200) [+24 meses / 3 aristas]</option>
                </select>
              </div>

              <GlowButton
                onClick={async () => {
                  if (!project.contrato_firmado) {
                    alert("Debe firmar el contrato digital de adhesión antes de realizar el simulacro de pago.");
                    return;
                  }
                  setSimulating(true);
                  const upsellParam = simUpsell === 'Ninguno' ? null : simUpsell as any;
                  const res = await applyPlanAndUpsellAction(project.id, simPlan, upsellParam);
                  if (res.success) {
                    await fetchProject();
                    alert("¡Simulación completada! Plan y límites actualizados en base de datos. Enrutamiento predictivo recalculado y referido procesado.");
                  } else {
                    alert("Error en simulación: " + res.error);
                  }
                  setSimulating(false);
                }}
                disabled={simulating || !project.contrato_firmado}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-white text-xs font-black uppercase tracking-wider border-0 transition-all duration-300 ${
                  project.contrato_firmado ? 'bg-brand-orange hover:bg-orange-600 shadow-md' : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
              >
                {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {!project.contrato_firmado ? '🔒 Firma Contrato para Pagar' : 'Simular Aprobación de Pago'}
              </GlowButton>

              <div className="border-t border-white/5 my-3 pt-3">
                <label className="block text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <span>🎟️ Cupón de Aliado (VIP/TOP Semilla Gratis)</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ej. HUGO_PELOC_TOP" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-400 placeholder:text-gray-600 transition-all uppercase font-semibold"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!couponCode.trim()) {
                        alert("Por favor ingrese un código de cupón.");
                        return;
                      }
                      setApplyingCoupon(true);
                      const res = await applyAllyCouponAction(project.id, couponCode);
                      if (res.success) {
                        await fetchProject();
                        alert("¡Felicidades! Cupón de Aliado Estratégico aplicado con éxito. Licencia de prueba VIP/TOP activada de forma gratuita.");
                        setCouponCode("");
                      } else {
                        alert(res.error || "Cupón inválido.");
                      }
                      setApplyingCoupon(false);
                    }}
                    disabled={applyingCoupon}
                    className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                  >
                    {applyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar'}
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 mt-1 italic">Válidos: HUGO_PELOC_TOP, ROCIO_VELASCO_VIP, JEFF_DIAZGRANADOS_VIP, YEISON_ARCIA_TOP</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: PROGRESS BAR / DOSSIER / AGENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Panel de Progreso del Motor de 32 pasos (Estructurando_IA) */}
          {project.estado_actual === 'Estructurando_IA' && (
            <GlassCard className="p-8 min-h-[500px] flex flex-col justify-center items-center text-center relative overflow-hidden group border-brand-blue/20">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-transparent pointer-events-none" />
              <div className="p-4 bg-brand-blue/10 text-brand-blue rounded-full mb-6 shadow-[0_0_30px_rgba(14,165,233,0.2)] animate-pulse">
                <Cpu className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">
                Motor de Auto-formulación Activo
              </h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mt-2 font-medium">
                Procesando la metodología completa de estructuración en menos de 5 minutos. Analizando archivos subidos e insumos del cliente.
              </p>

              {/* Progress HUD */}
              <div className="w-full max-w-lg mt-8 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-cyan-400 glow-text-blue uppercase tracking-widest text-xs flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {getStepLog(project.progreso_estructuracion || 0)}
                  </span>
                  <span className="text-white text-lg font-black">{project.progreso_estructuracion || 0}%</span>
                </div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-brand-blue via-cyan-400 to-emerald-400 glow-blue transition-all duration-1000 ease-out"
                    style={{ width: `${project.progreso_estructuracion || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <span className={project.progreso_estructuracion >= 10 ? "text-cyan-400 glow-text-blue" : ""}>M1: Objetivos</span>
                  <span className={project.progreso_estructuracion >= 40 ? "text-cyan-400 glow-text-blue" : ""}>M2: Técnico</span>
                  <span className={project.progreso_estructuracion >= 70 ? "text-cyan-400 glow-text-blue" : ""}>M3: Mercado</span>
                  <span className={project.progreso_estructuracion >= 90 ? "text-cyan-400 glow-text-blue" : ""}>M4: Finanzas</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 2. Visualización del Dossier Técnico (Solo Admin y cuando está listo) */}
          {project.estado_actual === 'En_Revision_Tecnica' && isAdmin && (
            <GlassCard className="p-8 min-h-[600px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 z-20">
                 <span className="text-[10px] uppercase tracking-widest font-bold bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full border border-brand-orange/30 shadow-[0_0_10px_rgba(255,90,0,0.2)]">
                   Vista Admin
                 </span>
              </div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-8 border-b border-white/10 pb-4 relative z-10 text-white">
                <FileText className="w-6 h-6 text-brand-blue" />
                Dossier Técnico (Markdown)
              </h2>

              {project.dossier_markdown && !dossierMarkdown && (
                 <div className="flex flex-col items-center justify-center h-[400px] relative z-10">
                   <Loader2 className="w-10 h-10 animate-spin text-brand-blue mb-4 glow-blue" />
                   <p className="font-medium animate-pulse text-gray-400">Renderizando Dossier Técnico...</p>
                 </div>
              )}

              {dossierMarkdown && (
                 <div className="prose prose-sm md:prose-base prose-invert max-w-none prose-a:text-brand-blue prose-headings:text-white prose-strong:text-brand-orange relative z-10 overflow-y-auto max-h-[800px] pr-4">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {dossierMarkdown}
                   </ReactMarkdown>
                 </div>
              )}
            </GlassCard>
          )}

          {/* 3. Panel del Agente de Convocatorias (Para Clientes al terminar estructuración) */}
          {project.estado_actual === 'En_Revision_Tecnica' && !isAdmin && project.transferido_agente_convocatorias && (
            <GlassCard className="p-8 relative overflow-hidden group border-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-wider italic italic font-black">
                  <Cpu className="text-emerald-400 glow-text-emerald animate-pulse" />
                  Agente de Convocatorias: Resultados
                </h2>
                <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase px-3 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                  Evaluado con Éxito
                </span>
              </div>

              {project.resultado_agent_json ? (
                <div className="space-y-6">
                  {/* Sub-tab Navigation */}
                  {(() => {
                    const tabs = [
                      { id: 'evaluacion', label: '1. Evaluación Impacto', icon: TrendingUp },
                      { id: 'territorial', label: '2. Articulación Territorial', icon: ShieldCheck },
                      { id: 'problema', label: '3. Redacción DNP', icon: FileText },
                      { id: 'arboles', label: '4. Coherencia Causal', icon: Layers },
                      { id: 'cadena', label: '5. Cadena de Valor MGA', icon: FileCheck },
                      { id: 'impactos', label: '6. Matriz de Impactos', icon: Activity },
                      { id: 'plan_pert', label: '7. Plan PERT', icon: CalendarIcon },
                      { id: 'viabilidad', label: '8. Viabilidad Técnica', icon: ShieldCheck },
                      {
                        id: 'cierre',
                        label: project.vertical_asignada === 'Fondo Emprender'
                          ? '9. Postulación Emprender'
                          : project.vertical_asignada === 'Subvenciones'
                          ? '9. Encaje Convocatorias'
                          : '9. Cierre & Colocación',
                        icon: CheckCircle2
                      }
                    ];

                    return (
                      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
                        {tabs.map(tab => {
                          const Icon = tab.icon;
                          const isActive = activeSubTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                if (tab.id === 'problema' && !guardianAuthorized) {
                                  setShowGuardianModal(true);
                                } else {
                                  setActiveSubTab(tab.id as any);
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border ${
                                isActive
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                  : 'bg-black/30 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              <Icon className="w-3 h-3" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {activeSubTab === 'evaluacion' && (
                    <div className="space-y-6">
                      {/* Nicho & Sector */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                          <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Nicho Evaluado</div>
                          <p className="text-sm font-semibold text-gray-200 mt-1">{project.resultado_agent_json.nicho_especifico}</p>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                          <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Sector Clasificado</div>
                          <p className="text-sm font-semibold text-gray-200 mt-1">{project.resultado_agent_json.sector_evaluador || project.resultado_agent_json.sector_evaluado}</p>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white pt-2">Evaluación Técnica de Aristas de Impacto</h3>
                      
                      {/* Aristas Visual HUD */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Ambiental */}
                        <div className="p-5 rounded-xl border border-emerald-500/10 bg-emerald-950/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between h-40">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Ambiental</span>
                            <Leaf className="w-5 h-5 text-emerald-400 animate-bounce" />
                          </div>
                          <p className="text-xs text-gray-300 font-medium leading-relaxed">{project.resultado_agent_json.aristas_impacto.ambiental}</p>
                        </div>

                        {/* Social */}
                        <div className="p-5 rounded-xl border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between h-40">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Social</span>
                            <Users className="w-5 h-5 text-cyan-400 animate-pulse" />
                          </div>
                          <p className="text-xs text-gray-300 font-medium leading-relaxed">{project.resultado_agent_json.aristas_impacto.social}</p>
                        </div>

                        {/* Financiero */}
                        <div className="p-5 rounded-xl border border-amber-500/10 bg-amber-950/5 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between h-40">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Financiero</span>
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                          </div>
                          <p className="text-xs text-gray-300 font-medium leading-relaxed">{project.resultado_agent_json.aristas_impacto.financiero}</p>
                        </div>

                      </div>
                    </div>
                  )}

                  {activeSubTab === 'territorial' && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl border border-brand-blue/20 bg-brand-blue/5">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">Ubicación del Proyecto</h4>
                        <p className="text-sm text-gray-300">Departamento: <b className="text-white">{project.articulacion?.departamento || 'N/A'}</b> | Municipio: <b className="text-white">{project.articulacion?.municipio || 'N/A'}</b></p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                          <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">Plan de Desarrollo Departamental (Micropaso #03)</div>
                          <p className="text-xs text-gray-300 mt-2 leading-relaxed">{project.articulacion?.texto_articulacion_departamental || 'Plan de desarrollo local departamental inyectado por el sistema.'}</p>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                          <div className="text-xs font-black text-cyan-400 uppercase tracking-widest">Plan de Desarrollo Municipal (Micropaso #05)</div>
                          <p className="text-xs text-gray-300 mt-2 leading-relaxed">{project.articulacion?.texto_articulacion_municipal || 'Plan de desarrollo local municipal inyectado por el sistema.'}</p>
                        </div>
                      </div>

                      {project.articulacion?.alerta_etnica_disparada ? (
                        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 flex gap-3 items-start animate-pulse">
                          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <h4 className="text-sm font-bold uppercase">Alerta Étnica Disparada (Agente de Convocatorias)</h4>
                            <p className="text-xs text-red-300 mt-1">El sistema detectó mención de comunidades étnicas en los documentos o formulario. Estado: <b>REQUIERE REVISIÓN</b>.</p>
                            <p className="text-xs text-red-400 mt-1">Palabras clave detectadas: {project.articulacion?.palabras_clave_etnicas_detectadas?.join(', ') || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-300 flex gap-3 items-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <p className="text-xs font-semibold">Filtro Étnico Automatizado (Micropaso #08): <b>NO APLICA</b> (No se registran alertas).</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSubTab === 'problema' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      {showPlansSuggestion && (
                        <div className="p-4 rounded-xl border border-brand-orange/30 bg-brand-orange/10 text-amber-200 flex gap-3 items-start animate-in slide-in-from-top-4 duration-500">
                          <AlertCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <h4 className="text-sm font-bold uppercase text-brand-orange">Sugerencia de la Firma: Maximizar Formulación</h4>
                            <p className="text-xs text-gray-300 mt-1">
                              Has accedido a la sección de Redacción DNP / Experto. Para potenciar al 100% tu estructuración técnica y alinearla con los indicadores oficiales del DNP, te sugerimos adquirir uno de nuestros planes premium (Aceleración o Élite).
                            </p>
                            <button
                              type="button"
                              onClick={() => router.push(`/dashboard/formulario-tecnico/${id}`)}
                              className="text-xs font-bold text-brand-orange hover:text-white underline mt-2 flex items-center gap-1 transition-all"
                            >
                              Ver Planes de Estructuración <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="p-5 rounded-xl border border-white/5 bg-black/40">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-3">Descripción Técnica DNP & Línea Base (Paso #7)</h4>
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project.descripcion_problema?.descripcion_tecnica_dnp || 'Descripción estructurada bajo estándar MGA/DNP.'}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Datos Duros Oficiales</div>
                          <ul className="space-y-2 text-xs">
                            {project.descripcion_problema?.datos_duros_json?.map((dd: any, i: number) => (
                              <li key={i} className="flex justify-between items-center bg-white/5 p-2 rounded">
                                <span className="text-gray-400 pr-2">{dd.metrica}</span>
                                <span className="font-bold text-white shrink-0">{dd.valor} <span className="text-[10px] text-gray-500 font-medium">({dd.fuente})</span></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Fuentes de Información Oficiales</div>
                          <div className="flex flex-wrap gap-2">
                            {project.descripcion_problema?.fuentes_oficiales?.map((fuente: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-xs text-cyan-400 font-medium">{fuente}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'arboles' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 bg-red-950/5 border border-red-500/10 rounded-xl space-y-4">
                          <h4 className="text-sm font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5"><Layers className="w-4 h-4" /> Árbol de Problemas</h4>
                          <div className="space-y-3 text-xs">
                            {project.problemas && project.problemas.length > 0 ? (
                              project.problemas.map((p: any, i: number) => (
                                <div key={i} className="p-2.5 rounded bg-black/40 border border-red-500/10">
                                  <div className="text-[9px] font-black text-red-500 uppercase tracking-widest">{p.tipo}</div>
                                  <p className="text-gray-200 mt-1 font-medium">{p.descripcion}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">No hay problemas registrados.</p>
                            )}
                          </div>
                        </div>
                        <div className="p-5 bg-emerald-950/5 border border-emerald-500/10 rounded-xl space-y-4">
                          <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Árbol de Objetivos (Symmetrical positive mirror)</h4>
                          <div className="space-y-3 text-xs">
                            {project.objetivos && project.objetivos.length > 0 ? (
                              project.objetivos.map((o: any, i: number) => (
                                <div key={i} className="p-2.5 rounded bg-black/40 border border-emerald-500/10">
                                  <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{o.tipo}</div>
                                  <p className="text-gray-200 mt-1 font-medium">{o.descripcion}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">No hay objetivos registrados.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'cadena' && (
                    <div className="space-y-6">
                      <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/40">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5 font-black uppercase text-gray-400">
                              <th className="p-3">Producto MGA</th>
                              <th className="p-3">Unidad de Medida</th>
                              <th className="p-3 text-right">Meta</th>
                              <th className="p-3">Tareas Breakdown</th>
                              <th className="p-3">Responsable</th>
                              <th className="p-3 text-center">Duración (Meses)</th>
                              <th className="p-3 text-center">Ruta Crítica</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.actividades && project.actividades.length > 0 ? (
                              project.actividades.map((act: any, i: number) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-semibold text-gray-200 max-w-xs">{act.producto_mga}</td>
                                  <td className="p-3 text-gray-400">{act.unidad_medida}</td>
                                  <td className="p-3 text-right font-black text-white">{act.meta}</td>
                                  <td className="p-3 max-w-xs">
                                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                                      {act.tareas_json?.map((t: string, j: number) => (
                                        <li key={j} className="truncate">{t}</li>
                                      ))}
                                    </ul>
                                  </td>
                                  <td className="p-3 text-gray-300">{act.responsable}</td>
                                  <td className="p-3 text-center text-gray-200">{act.duracion_meses}</td>
                                  <td className="p-3 text-center">
                                    {act.ruta_critica ? (
                                      <span className="px-2 py-0.5 bg-red-950/40 border border-red-500/40 text-red-400 font-bold rounded uppercase text-[10px]">Sí</span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-white/5 text-gray-500 rounded uppercase text-[10px]">No</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500 italic">No hay actividades de la cadena de valor cargadas.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'impactos' && (
                    <div className="space-y-6">
                      <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/40">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5 font-black uppercase text-gray-400">
                              <th className="p-3 w-1/4">Horizonte Temporal</th>
                              <th className="p-3 w-3/8">Impacto Regional</th>
                              <th className="p-3 w-3/8">Impacto Nacional</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-3 font-bold text-white bg-white/5">Corto Plazo (Paso #19)</td>
                              <td className="p-3 text-gray-300 leading-relaxed">{project.impactos?.corto_plazo_regional || 'N/A'}</td>
                              <td className="p-3 text-gray-300 leading-relaxed">{project.impactos?.corto_plazo_nacional || 'N/A'}</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-3 font-bold text-white bg-white/5">Mediano Plazo (Paso #19)</td>
                              <td className="p-3 text-gray-300 leading-relaxed">{project.impactos?.mediano_plazo_regional || 'N/A'}</td>
                              <td className="p-3 text-gray-300 leading-relaxed">{project.impactos?.mediano_plazo_nacional || 'N/A'}</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="p-3 font-bold text-white bg-white/5">Largo Plazo (Paso #19)</td>
                              <td className="p-3 text-gray-300 leading-relaxed">{project.impactos?.largo_plazo_regional || 'N/A'}</td>
                              <td className="p-3 text-gray-300 leading-relaxed">{project.impactos?.largo_plazo_nacional || 'N/A'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'plan_pert' && (
                    <div className="space-y-6">
                      <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/40">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5 font-black uppercase text-gray-400">
                              <th className="p-3">Entregable Operativo</th>
                              <th className="p-3 text-center">Duración Optimista (Días)</th>
                              <th className="p-3 text-center">Duración Probable (Días)</th>
                              <th className="p-3 text-center">Duración Pesimista (Días)</th>
                              <th className="p-3 text-center bg-white/5 text-white">Duración Esperada PERT (Días)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.plan_operativo && project.plan_operativo.length > 0 ? (
                              project.plan_operativo.map((pert: any, i: number) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-semibold text-gray-200">{pert.entregable}</td>
                                  <td className="p-3 text-center text-gray-400">{pert.duracion_optimista_dias}</td>
                                  <td className="p-3 text-center text-gray-400">{pert.duracion_probable_dias}</td>
                                  <td className="p-3 text-center text-gray-400">{pert.duracion_pesimista_dias}</td>
                                  <td className="p-3 text-center font-black bg-brand-blue/10 border-x border-brand-blue/20 text-cyan-400 glow-text-blue">{pert.duracion_esperada_dias} días</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500 italic">No hay entregables PERT registrados.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'cierre' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      {/* Paso 4: Header HUD and Biblioteca */}
                      <div className="p-6 bg-cyan-950/20 border border-cyan-500/20 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-cyan-400" />
                        <h3 className="text-xl font-black text-white uppercase italic tracking-wider mb-2 flex items-center gap-2">
                          <Layers className="text-cyan-400 glow-text-blue" />
                          Paso #4: Biblioteca y Anexo de Portales / Motores de Búsqueda
                        </h3>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                          Tu proyecto ha sido analizado por nuestro motor de matching. Selecciona un molde de pliego de la biblioteca global para deconstruir el proyecto en aristas independientes y ejecutar la adaptación inversa.
                        </p>
                      </div>

                      {/* Convocatorias Biblioteca Grid */}
                      {loadingMoldes ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-black/20 border border-white/5 rounded-xl">
                          <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-2" />
                          <p className="text-xs text-gray-400">Consultando biblioteca de portales global...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {moldes.map((molde) => {
                            const isSelected = selectedMoldeId === molde.id;
                            return (
                              <div
                                key={molde.id}
                                className={`p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                    : 'bg-black/40 border-white/5 hover:border-white/20'
                                }`}
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-bold text-white leading-tight">{molde.entidad_fuente}</h4>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      molde.coincideVertical
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-white/5 text-gray-400'
                                    }`}>
                                      {molde.coincideVertical ? 'Vertical Recomendada' : 'Apto'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">
                                    <b>Sectores:</b> {molde.lineas_tematicas_sectores?.join(', ')}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 border-t border-white/5 pt-3 mb-4">
                                    <div>
                                      <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Límite Financiero</span>
                                      <span className="font-semibold text-gray-200">${Number(molde.limites_financieros_monto).toLocaleString()} COP</span>
                                    </div>
                                    <div>
                                      <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">Afinidad Predictiva</span>
                                      <span className="font-semibold text-emerald-400">{molde.afinidad}%</span>
                                    </div>
                                  </div>
                                </div>

                                <GlowButton
                                  type="button"
                                  onClick={() => handleEjecutarDeconstruccion(molde.id)}
                                  disabled={ejecutandoDeconstruccion}
                                  className={`text-[10px] font-black uppercase py-2 tracking-wider w-full flex items-center justify-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                                      : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                                  }`}
                                >
                                  {ejecutandoDeconstruccion && selectedMoldeId === molde.id ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      Deconstruyendo...
                                    </>
                                  ) : isSelected ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Pliego Deconstruido
                                    </>
                                  ) : (
                                    <>
                                      <Cpu className="w-3.5 h-3.5" />
                                      Adaptación Inversa (Paso #3)
                                    </>
                                  )}
                                </GlowButton>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Paso 3 & 5: Resultados de la Deconstrucción Inversa */}
                      {deconstruccionResultado && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          
                          {/* Matriz ex-ante de 100 Puntos */}
                          <div className="p-6 bg-black/40 border border-white/5 rounded-xl space-y-6">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                              <TrendingUp className="text-cyan-400 glow-text-blue" />
                              Matriz de Evaluación de Subvención (Criterio 100 Puntos)
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                              <div className="p-6 bg-cyan-950/10 border border-cyan-500/20 rounded-xl text-center space-y-2 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-emerald-400" />
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Score de Encaje de Pliego</div>
                                <div className="text-5xl font-black text-white tracking-tight glow-text-blue">
                                  {deconstruccionResultado.score_actual} <span className="text-xl text-gray-500">/ 100</span>
                                </div>
                                <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                                  Encaje: {deconstruccionResultado.score_actual >= 70 ? 'SÓLIDO Y APTO' : 'RECONFIGURACIÓN REQUERIDA'}
                                </p>
                              </div>

                              <div className="space-y-3">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Desglose de Rúbrica de la Convocatoria</h5>
                                {[
                                  { name: "1. Calidad Técnica (Máx: 30 pts)", score: deconstruccionResultado.dimensiones_detalladas?.calidad_tecnica, max: 30 },
                                  { name: "2. Impacto Territorial (Máx: 25 pts)", score: deconstruccionResultado.dimensiones_detalladas?.impacto_territorial, max: 25 },
                                  { name: "3. Capacidades Locales (Máx: 20 pts)", score: deconstruccionResultado.dimensiones_detalladas?.capacidades_locales, max: 20 },
                                  { name: "4. Sostenibilidad y Transferencia (Máx: 15 pts)", score: deconstruccionResultado.dimensiones_detalladas?.sostenibilidad_transferencia, max: 15 },
                                  { name: "5. Escalabilidad y Replicabilidad (Máx: 10 pts)", score: deconstruccionResultado.dimensiones_detalladas?.escalabilidad_replicabilidad, max: 10 }
                                ].map((item, idx) => (
                                  <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                      <span className="text-gray-400 text-[11px]">{item.name}</span>
                                      <span className="text-white font-bold text-[11px]">{item.score} / {item.max}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-cyan-500 glow-blue rounded-full" style={{ width: `${(item.score / item.max) * 100}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Reporte Crudo de Brechas */}
                          <div className="p-5 bg-amber-950/10 border border-amber-500/20 rounded-xl space-y-4 relative overflow-hidden">
                            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                              Reporte Crudo de Brechas y Estiramiento Técnico
                            </h4>
                            
                            {project.plan_pago?.toUpperCase() === 'BASE' ? (
                              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col justify-center items-center p-4 text-center z-10">
                                <ShieldAlert className="w-8 h-8 text-brand-orange animate-pulse mb-2" />
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Recomendaciones Tácticas Bloqueadas</p>
                                <p className="text-[10px] text-gray-400 mt-1 max-w-xs">Las recomendaciones de reconfiguración técnica y de absorción de aliados requieren Plan PRO o superior.</p>
                              </div>
                            ) : null}

                            <div className={project.plan_pago?.toUpperCase() === 'BASE' ? 'filter blur-sm select-none pointer-events-none' : ''}>
                              {deconstruccionResultado.aristas_debiles_detectadas?.length > 0 ? (
                                <div className="space-y-3">
                                  <p className="text-[11px] text-gray-300">
                                    El motor de IA detectó que el proyecto requiere incorporar o co-absorber los siguientes componentes de la biblioteca de alianzas para ajustarse completamente al molde:
                                  </p>
                                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-300">
                                    {deconstruccionResultado.aristas_debiles_detectadas.map((deb: string, i: number) => (
                                      <li key={i} className="leading-relaxed">{deb}</li>
                                    ))}
                                  </ul>
                                  <div className="border-t border-amber-500/10 pt-3">
                                    <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Recomendaciones de Reconfiguración Activa</span>
                                    <ul className="space-y-2 text-xs text-gray-300">
                                      {deconstruccionResultado.recomendaciones_reconfiguracion.map((rec: string, i: number) => (
                                        <li key={i} className="flex gap-2 items-start">
                                          <span className="text-cyan-400 font-bold">#{i+1}</span>
                                          <span>{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                                  El proyecto cumple de forma sobresaliente con todos los requisitos del pliego. No hay brechas críticas registradas.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Aristas Maleables Deconstruidas (Paso #3) */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                              <Cpu className="text-brand-blue glow-text-blue" />
                              Paso #3: Paradigma Inverso - Deconstrucción en Aristas Independientes
                            </h4>
                            <p className="text-xs text-gray-400">
                              El proyecto es maleable. A continuación se desglosan las aristas independientes de formulación que la IA segmentó para encajar en el pliego rígido técnico:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {deconstruccionResultado.aristas_maleables?.map((arista: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl border border-white/5 bg-black/40 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-bold text-white">{arista.nombre}</span>
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                        arista.status?.includes('100%') ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                                      }`}>
                                        {arista.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-2">{arista.descripcion}</p>
                                    <p className="text-[11px] text-gray-300 leading-relaxed italic bg-white/5 p-2 rounded border border-white/5">
                                      "{arista.texto_adaptacion}"
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Paso 5: Ensamblador de Dossier Adaptado */}
                          <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-950/5 space-y-4">
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-emerald-400" />
                                Paso #5: Ensamblador de Dossier de Postulación Adaptado
                              </h4>
                              <button
                                onClick={() => alert("Descargando Dossier de Postulación adaptado en formato Markdown...")}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              >
                                Exportar Dossier (.MD)
                              </button>
                            </div>
                            
                            <div className="prose prose-sm prose-invert max-w-none prose-a:text-cyan-400 prose-strong:text-cyan-400 max-h-[500px] overflow-y-auto pr-2 bg-black/40 p-4 rounded border border-white/5">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {deconstruccionResultado.dossier_adaptado}
                              </ReactMarkdown>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                  {activeSubTab === 'viabilidad' && (
                    <div className="space-y-6">
                      {project.evaluacion ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="p-6 bg-black/40 border border-white/5 rounded-xl text-center space-y-2 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-emerald-400" />
                              <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Dictamen Ex-Ante: Score Total</div>
                              <div className="text-5xl font-black text-white tracking-tight glow-text-blue">{project.evaluacion.score_total} <span className="text-2xl text-gray-500">/ 100</span></div>
                              <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                                Viabilidad: {project.evaluacion.score_total >= 85 ? 'SÓLIDO' : (project.evaluacion.score_total >= 60 ? 'INTERMEDIO' : 'DÉBIL')}
                              </p>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Desglose de Rúbrica por Dimensión (0-20 pts)</h4>
                              {[
                                { name: "1. Propuesta Técnica", score: project.evaluacion.puntaje_propuesta_tecnica },
                                { name: "2. Impacto Potencial", score: project.evaluacion.puntaje_impacto_potencial },
                                { name: "3. Capacidades Locales", score: project.evaluacion.puntaje_capacidades_locales },
                                { name: "4. Sostenibilidad Financiera", score: project.evaluacion.puntaje_sostenibilidad },
                                { name: "5. Replicabilidad", score: project.evaluacion.puntaje_replicabilidad }
                              ].map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-xs font-medium">
                                    <span className="text-gray-400">{item.name}</span>
                                    <span className="text-white font-bold">{item.score} / 20</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 glow-blue rounded-full" style={{ width: `${(item.score / 20) * 100}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-5 bg-black/40 border border-white/5 rounded-xl space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Diagnósticos Cualitativos de Auditoría
                            </h4>
                            <div className="space-y-3 text-xs leading-relaxed">
                              {Object.entries(project.evaluacion.comentarios_criterios || {}).map(([criterio, desc]: any, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded border border-white/5">
                                  <b className="text-white uppercase tracking-wider text-[10px]">{criterio}</b>
                                  <p className="text-gray-400 mt-1">{desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-5 bg-amber-950/5 border border-amber-500/10 rounded-xl space-y-3">
                            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" /> Recomendaciones Clave para el Cierre Técnico
                            </h4>
                            <ul className="list-disc list-inside space-y-2 text-xs text-gray-300">
                              {project.evaluacion.recomendaciones_mejora?.map((rec: string, i: number) => (
                                <li key={i} className="leading-relaxed">{rec}</li>
                              ))}
                            </ul>
                          </div>

                        </div>
                      ) : (
                        <div className="text-center p-8 opacity-60">No se ha generado la auditoría del proyecto.</div>
                      )}
                    </div>
                  )}

                  <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl mt-6 flex gap-3 items-center">
                    <FileCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                    <p className="text-xs text-gray-400 font-medium">
                      El reporte detallado de estructuración se encuentra consolidado y listo para auditoría. Un especialista financiero se pondrá en contacto para afinar la presentación técnica final.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/20 rounded-xl opacity-60 bg-black/20">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-blue" />
                  <p className="text-sm text-center font-medium text-gray-400">Cargando evaluación de aristas del Agente...</p>
                </div>
              )}
            </GlassCard>
          )}

          {/* 4. Panel Default cuando no se ha enviado nada para estructurar (Paso previo) */}
          {project.estado_actual !== 'Estructurando_IA' && project.estado_actual !== 'En_Revision_Tecnica' && (
            <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center border-dashed border-white/10 bg-black/20 min-h-[500px]">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-md border border-white/10">
                 <FileText className="w-10 h-10 text-gray-500" />
               </div>
               <h3 className="text-xl font-bold mb-2 text-white">Estructuración Técnica No Iniciada</h3>
               <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed mb-6">
                 Completa el levantamiento técnico (Fase 2) seleccionando un plan de estructuración y subiendo el archivo de tu proyecto para activar la auto-formulación del proyecto.
               </p>
               <GlowButton onClick={() => router.push(`/dashboard/formulario-tecnico/${project.id}`)} className="bg-brand-blue hover:bg-cyan-600 text-white border-0 flex items-center gap-2">
                 Iniciar Formulario Técnico (22 Preguntas) <ArrowRight className="w-4 h-4" />
               </GlowButton>
            </GlassCard>
          )}

        </div>
      </div>

      {/* CALENDAR MODAL */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard className="w-full max-w-2xl bg-[#0B0F19] p-0 overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.15)] relative border-brand-blue/20">
            <button onClick={() => setShowCalendar(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10">
              <X className="w-6 h-6" />
            </button>
            
            {!appointmentConfirmed ? (
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="text-brand-orange" />
                    Agendar Consultoría
                  </h3>
                  <p className="text-gray-400 mt-2">
                    Selecciona un espacio con <b className="text-brand-blue glow-text-blue">{topAdvisor}</b> para estructurar los pasos a seguir.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Días Disponibles</h4>
                    <div className="space-y-2">
                      {availableDays.map((date, idx) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
                        const shortDate = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className={`w-full flex justify-between items-center px-4 py-3 rounded-lg border text-left transition-all ${
                              isSelected ? 'bg-brand-blue/20 border-brand-blue/50 text-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-300'
                            }`}
                          >
                            <span className="capitalize font-medium">{dayName}</span>
                            <span className="text-sm opacity-70">{shortDate}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className={!selectedDate ? 'opacity-30 pointer-events-none transition-opacity' : 'transition-opacity'}>
                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Horas (Lun - Vie)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time, idx) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTime(time)}
                            className={`px-2 py-3 text-sm font-medium rounded-lg border transition-all ${
                              isSelected ? 'bg-brand-orange border-brand-orange text-white shadow-[0_0_15px_rgba(255,90,0,0.4)]' : 'bg-black/40 border-white/10 hover:border-white/30 text-gray-400 hover:bg-white/5'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                  <GlowButton 
                    disabled={!selectedDate || !selectedTime || isScheduling}
                    onClick={async () => {
                      if (!selectedDate || !selectedTime) return;
                      setIsScheduling(true);
                      try {
                        const dateStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                        await agendarCitaAction(project.id, topAdvisor, dateStr, selectedTime);
                        setAppointmentConfirmed(true);
                      } catch (err) {
                        alert("Error agendando cita. Intenta de nuevo.");
                        console.error(err);
                      }
                      setIsScheduling(false);
                    }}
                    className="w-full md:w-auto px-8 bg-brand-blue hover:bg-cyan-600 text-white border-0"
                  >
                    {isScheduling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirmar Cita <ChevronRight className="w-4 h-4 ml-1" />
                  </GlowButton>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-white drop-shadow-md">¡Cita Agendada!</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Tu sesión con <b className="text-brand-blue">{topAdvisor}</b> ha sido confirmada para el {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedTime}.
                </p>
                <div className="pt-6 w-full max-w-xs mx-auto">
                  <GlowButton 
                    onClick={() => {
                      setShowCalendar(false);
                      setAppointmentConfirmed(false);
                    }}
                    className="w-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center gap-2 border-white/20"
                  >
                    Entendido, cerrar ventana
                  </GlowButton>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* GUARDIAN INTERACTIVO DEL PASO 3 (EXPERTO) */}
      {showGuardianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard className="w-full max-w-lg bg-[#0B0F19] p-8 shadow-[0_0_50px_rgba(14,165,233,0.15)] relative border-brand-blue/30 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-blue/15 border border-brand-blue/30 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.2)] animate-pulse">
              <ShieldAlert className="w-8 h-8 shrink-0 text-cyan-400 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">
                ¿Sabes qué es esto?
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-medium">
                Estás intentando ingresar a la sección de <b>Redacción DNP / Experto</b> (Paso 3). Este módulo metodológico avanzado procesa la línea base del DNP y el espejo de consistencia del árbol de la MGA.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <GlowButton
                onClick={() => {
                  setGuardianAuthorized(true);
                  setShowGuardianModal(false);
                  setShowPlansSuggestion(false);
                  setActiveSubTab('problema');
                }}
                className="w-full bg-brand-blue hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-widest border-0 py-3.5"
              >
                Sí, sé qué es esto y quiero ingresar
              </GlowButton>
              
              <button
                type="button"
                onClick={() => {
                  setGuardianAuthorized(true);
                  setShowGuardianModal(false);
                  setShowPlansSuggestion(true);
                  setActiveSubTab('problema');
                }}
                className="w-full py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 font-bold text-xs uppercase tracking-widest transition-all"
              >
                No estoy seguro, permíteme ver y sugiéreme planes
              </button>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
