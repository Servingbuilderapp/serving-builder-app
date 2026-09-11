'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { 
  Loader2, Activity, ShieldCheck, ShieldAlert, TrendingUp, AlertCircle, 
  Calendar, Phone, Mail, DollarSign, Cpu, FileText, CheckCircle2, 
  Shield, Lock, Award, HeartHandshake, UserCheck, RefreshCw, BarChart3
} from 'lucide-react';
import { 
  getPresidenciaDataAction, updateAuditStatusAction, 
  updateQuejaStatusAction, updateCommissionStatusAction 
} from './actions';

export default function PresidenciaDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Datos principales
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [comisiones, setComisiones] = useState<any[]>([]);
  const [quejas, setQuejas] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Sincronización
  const [syncing, setSyncing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // 1. Verificación de Rol Administrativo Principal
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Omisión de restricciones estrictas en desarrollo (localhost)
        if (typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1')) {
          console.log("Desarrollo local: Acceso administrativo de presidencia forzado en localhost.");
          setAuthorized(true);
          setUserEmail('servingbuilderapp@gmail.com');
          setCheckingAuth(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          if (user.email === 'servingbuilderapp@gmail.com') {
            setAuthorized(true);
          } else {
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('id', user.id)
              .single();
              
            if (userData?.role === 'admin') {
              setAuthorized(true);
            } else {
              setAuthorized(false);
            }
          }
        } else {
          setAuthorized(false); // Sin sesión iniciada
        }
      } catch (err) {
        console.error("Auth error:", err);
        // Fallback robusto en desarrollo local si falla la red/Supabase
        if (typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1')) {
          setAuthorized(true);
          setUserEmail('servingbuilderapp@gmail.com');
        } else {
          setAuthorized(false);
        }
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [supabase]);

  // 2. Fetch de datos consolidado
  const fetchData = async () => {
    setSyncing(true);
    try {
      const data = await getPresidenciaDataAction();
      setProyectos(data?.proyectos || []);
      setComisiones(data?.comisiones || []);
      setQuejas(data?.quejas || []);
      
      // Combinar los logs de Supabase con los logs locales
      const dbLogs = data?.logs || [];
      const savedLogsStr = localStorage.getItem('presidencia_demo_logs');
      let combinedLogs = [...dbLogs];
      if (savedLogsStr) {
        try {
          const localLogs = JSON.parse(savedLogsStr);
          localLogs.forEach((localLog: any) => {
            if (!combinedLogs.some((dbLog: any) => dbLog.id === localLog.id || (dbLog.nombre_proyecto === localLog.nombre_proyecto && dbLog.convocatoria_nombre === localLog.convocatoria_nombre))) {
              combinedLogs.push(localLog);
            }
          });
        } catch (e) {}
      }
      setLogs(combinedLogs);
      
      // Sincronización limpia con localStorage para demo
      localStorage.setItem('presidencia_demo_proyectos', JSON.stringify(data?.proyectos || []));
      localStorage.setItem('presidencia_demo_comisiones', JSON.stringify(data?.comisiones || []));
      localStorage.setItem('presidencia_demo_quejas', JSON.stringify(data?.quejas || []));
      localStorage.setItem('presidencia_demo_logs', JSON.stringify(combinedLogs));
    } catch (err) {
      console.warn("Fallo cargando de Supabase, recuperando de caché local.");
      const savedProy = localStorage.getItem('presidencia_demo_proyectos');
      const savedCom = localStorage.getItem('presidencia_demo_comisiones');
      const savedQuej = localStorage.getItem('presidencia_demo_quejas');
      const savedLogs = localStorage.getItem('presidencia_demo_logs');
      
      if (savedProy) setProyectos(JSON.parse(savedProy));
      if (savedCom) setComisiones(JSON.parse(savedCom));
      if (savedQuej) setQuejas(JSON.parse(savedQuej));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (authorized === true) {
      fetchData();
      const interval = setInterval(fetchData, 8000); // Polling de refresco dinámico
      return () => clearInterval(interval);
    }
  }, [authorized]);

  // Modificar auditorías de cumplimiento (Campoverde vs Lombana)
  const handleAuditChange = async (proyectoId: string, type: 'financiera' | 'legal', nuevoEstado: string) => {
    const updatedProyectos = proyectos.map(p => {
      if (p.id === proyectoId) {
        return type === 'financiera' 
          ? { ...p, auditoria_financiera_estado: nuevoEstado }
          : { ...p, auditoria_legal_estado: nuevoEstado };
      }
      return p;
    });
    setProyectos(updatedProyectos);
    localStorage.setItem('presidencia_demo_proyectos', JSON.stringify(updatedProyectos));
    
    await updateAuditStatusAction(proyectoId, type, nuevoEstado);
  };

  // Modificar estado de quejas/fallos de IA
  const handleQuejaStatusChange = async (id: string, nuevoEstado: string) => {
    const updatedQuejas = quejas.map(q => {
      if (q.id === id) return { ...q, estado: nuevoEstado };
      return q;
    });
    setQuejas(updatedQuejas);
    localStorage.setItem('presidencia_demo_quejas', JSON.stringify(updatedQuejas));
    
    await updateQuejaStatusAction(id, nuevoEstado);
  };

  // Modificar estado de comisiones MLM
  const handleCommissionChange = async (id: string, nuevoEstado: string) => {
    const updatedComisiones = comisiones.map(c => {
      if (c.id === id) return { ...c, estado: nuevoEstado };
      return c;
    });
    setComisiones(updatedComisiones);
    localStorage.setItem('presidencia_demo_comisiones', JSON.stringify(updatedComisiones));
    
    await updateCommissionStatusAction(id, nuevoEstado);
  };

  // 3. Cálculos de Indicadores y Analíticas
  // Finanzas
  const recaudoPorPlan = proyectos.reduce((acc: any, p) => {
    const plan = (p.plan_pago || 'BASE').toUpperCase();
    let valor = 1200; // Base
    if (plan === 'PRO') valor = 2700;
    if (plan === 'VIP') valor = 4200;
    if (plan === 'TOP') valor = 6000;
    acc[plan] = (acc[plan] || 0) + valor;
    return acc;
  }, {});

  // Evitamos divisiones por cero o valores NaN si no hay proyectos
  const recaudoTotal = (Object.values(recaudoPorPlan).reduce((a: any, b: any) => a + b, 0) || 1) as number;
  
  const totalComisionesEntregadas = comisiones
    .filter(c => c.estado === 'Entregada')
    .reduce((sum, c) => sum + Number(c.monto), 0);

  const totalComisionesPorEntregar = comisiones
    .filter(c => c.estado === 'Por Entregar')
    .reduce((sum, c) => sum + Number(c.monto), 0);

  // Proyectos
  const distribucionVerticales = proyectos.reduce((acc: any, p) => {
    const vertical = p.vertical_asignada || 'Pendiente';
    acc[vertical] = (acc[vertical] || 0) + 1;
    return acc;
  }, {});

  // Fondeo
  const convocatoriasEstados = logs.reduce((acc: any, l) => {
    const est = l.estado || 'En Proceso';
    acc[est] = (acc[est] || 0) + 1;
    return acc;
  }, { 'Postulado': 0, 'En Proceso': 0, 'Adjudicado': 0, 'Rechazado': 0 });

  // 4. Renderización del Acceso Denegado Premium
  if (checkingAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#2E0E1A] text-[#F3E7DC]">
        <Loader2 className="w-10 h-10 animate-spin text-[#B08D57] mb-4 glow-blue" />
        <p className="text-[#F3E7DC]/55 font-bold uppercase tracking-widest text-xs animate-pulse">Verificando Credenciales de Presidencia...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-4 bg-radial-gradient">
        <GlassCard className="p-8 max-w-md text-center border-[#C0604A]/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C0604A]/10 to-transparent pointer-events-none" />
          <div className="p-4 bg-[#C0604A]/15 text-[#E0917E] rounded-full mb-6 w-16 h-16 flex items-center justify-center mx-auto border border-[#C0604A]/30 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#F3E7DC] uppercase italic tracking-wider">
            Acceso Denegado
          </h2>
          <p className="text-sm text-[#F3E7DC]/55 mt-2 leading-relaxed">
            La ruta de analítica gerencial <b className="text-[#F3E7DC]">/admin/presidencia</b> está estrictamente reservada para el <b>Administrador Principal / Presidente del Holding</b>.
          </p>
          <div className="mt-6 p-3 bg-[#C0604A]/10 border border-[#C0604A]/40 rounded-lg text-xs text-[#E0917E]">
            Usuario actual: <b className="text-[#F3E7DC]">{userEmail || 'Invitado sin credenciales'}</b>
          </div>
          <GlowButton onClick={() => router.push('/dashboard/proyectos/')} className="w-full mt-6 bg-[#C0604A]/20 border border-[#C0604A]/40 hover:bg-[#C0604A] text-[#F3E7DC] font-bold py-2">
            Regresar a Mis Proyectos
          </GlowButton>
        </GlassCard>
      </div>
    );
  }

  // 5. Renderización del Panel Gerencial de Presidencia
  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header Gerencial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C99A3D]/10 border border-[#C99A3D]/30 text-[#E0B868] text-[10px] uppercase font-black tracking-widest rounded-full mb-3 shadow-[0_0_15px_rgba(201,154,61,0.25)]">
            <Award className="w-3.5 h-3.5" /> Ecosistema Holding • Dashboard Presidencia
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F3E7DC] tracking-tighter uppercase italic drop-shadow-md">
            Super Panel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A46B] to-[#B08D57]">Control Administrativo</span>
          </h1>
          <p className="text-[#F3E7DC]/55 font-medium mt-1">Consola gerencial de finanzas, cumplimiento legal/financiero, conversiones MLM y auditoría IA.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            disabled={syncing}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[#F3E7DC] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Live Sync'}
          </button>
          <div className="flex items-center gap-2 bg-[#3B1727]/80 px-4 py-2.5 rounded-lg border border-[#B08D57]/20 shadow-[0_0_15px_rgba(176,141,87,0.10)]">
            <Activity className="w-4 h-4 text-[#B08D57] animate-pulse" />
            <span className="text-xs font-black text-[#F3E7DC]/70 uppercase tracking-widest">Presidencia de Serving</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] w-full flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#B08D57] glow-blue" />
        </div>
      ) : (
        <>
          {/* SECCIÓN 1: FINANZAS Y COMISIONES MLM */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* KPI Cards */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              <GlassCard className="p-6 border-[#B08D57]/10 bg-[#3B1727]/75 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-[#B08D57] group-hover:scale-110 transition-transform">
                  <DollarSign className="w-12 h-12" />
                </div>
                <span className="block text-[9px] font-black text-[#F3E7DC]/45 uppercase tracking-widest">Recaudo Total Licencias</span>
                <h3 className="text-3xl font-black text-[#F3E7DC] mt-1.5 glow-text-blue">${recaudoTotal.toLocaleString('en-US')} USD</h3>
                <p className="text-[10px] text-[#F3E7DC]/55 mt-2 leading-relaxed">Suma de pilotos semilla facturados e inyectados en la pasarela de pagos.</p>
              </GlassCard>

              <GlassCard className="p-6 border-[#7A8B6F]/10 bg-[#3B1727]/75 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-[#9BB18D]">
                  <HeartHandshake className="w-12 h-12" />
                </div>
                <span className="block text-[9px] font-black text-[#F3E7DC]/45 uppercase tracking-widest">Comisiones MLM Entregadas</span>
                <h3 className="text-3xl font-black text-[#9BB18D] mt-1.5">${totalComisionesEntregadas.toLocaleString('en-US')} USD</h3>
                <p className="text-[10px] text-[#F3E7DC]/55 mt-2">Validadas e inyectadas en la red de aliados.</p>
              </GlassCard>

              <GlassCard className="p-6 border-[#C99A3D]/10 bg-[#3B1727]/75 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-[#E0B868]">
                  <TrendingUp className="w-12 h-12" />
                </div>
                <span className="block text-[9px] font-black text-[#F3E7DC]/45 uppercase tracking-widest">Comisiones MLM Por Entregar</span>
                <h3 className="text-3xl font-black text-[#E0B868] mt-1.5">${totalComisionesPorEntregar.toLocaleString('en-US')} USD</h3>
                <p className="text-[10px] text-[#F3E7DC]/55 mt-2">Comisiones del Ecosistema MLM en proceso de verificación comercial.</p>
              </GlassCard>

            </div>

            {/* Gráfico 1: Recaudo por Plan (Pie Chart SVG interactivo) */}
            <div className="lg:col-span-1.5 bg-[#3B1727]/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#B08D57]" /> Distribución de Recaudo por Plan
                </h4>
                
                {/* SVG Pie Chart / Rosquilla */}
                <div className="flex justify-center items-center py-4">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3B1727" strokeWidth="4.5" />
                    
                    {/* BASE: ~10% (StrokeDasharray: "10 90") */}
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#B08D57" strokeWidth="4.5" 
                      strokeDasharray={`${((recaudoPorPlan.BASE || 0)/recaudoTotal)*100} ${100 - (((recaudoPorPlan.BASE || 0)/recaudoTotal)*100)}`} strokeDashoffset="0" />
                    
                    {/* PRO: ~20% */}
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#C99A3D" strokeWidth="4.5" 
                      strokeDasharray={`${((recaudoPorPlan.PRO || 0)/recaudoTotal)*100} ${100 - (((recaudoPorPlan.PRO || 0)/recaudoTotal)*100)}`} 
                      strokeDashoffset={`-${((recaudoPorPlan.BASE || 0)/recaudoTotal)*100}`} />
                    
                    {/* VIP: ~30% */}
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8C3654" strokeWidth="4.5" 
                      strokeDasharray={`${((recaudoPorPlan.VIP || 0)/recaudoTotal)*100} ${100 - (((recaudoPorPlan.VIP || 0)/recaudoTotal)*100)}`} 
                      strokeDashoffset={`-${(((recaudoPorPlan.BASE || 0) + (recaudoPorPlan.PRO || 0))/recaudoTotal)*100}`} />
                    
                    {/* TOP: ~40% */}
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#7A8B6F" strokeWidth="4.5" 
                      strokeDasharray={`${((recaudoPorPlan.TOP || 0)/recaudoTotal)*100} ${100 - (((recaudoPorPlan.TOP || 0)/recaudoTotal)*100)}`} 
                      strokeDashoffset={`-${(((recaudoPorPlan.BASE || 0) + (recaudoPorPlan.PRO || 0) + (recaudoPorPlan.VIP || 0))/recaudoTotal)*100}`} />
                  </svg>
                </div>
              </div>

              {/* Leyenda interactiva */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[#B08D57]">
                  <span className="w-2.5 h-2.5 bg-[#B08D57] rounded-sm shrink-0" />
                  <span>BASE: ${(recaudoPorPlan.BASE || 0).toLocaleString()} USD</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#E0B868]">
                  <span className="w-2.5 h-2.5 bg-[#C99A3D] rounded-sm shrink-0" />
                  <span>PRO: ${(recaudoPorPlan.PRO || 0).toLocaleString()} USD</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#C98CA8]">
                  <span className="w-2.5 h-2.5 bg-[#8C3654] rounded-sm shrink-0" />
                  <span>VIP: ${(recaudoPorPlan.VIP || 0).toLocaleString()} USD</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#9BB18D]">
                  <span className="w-2.5 h-2.5 bg-[#7A8B6F] rounded-sm shrink-0" />
                  <span>TOP: ${(recaudoPorPlan.TOP || 0).toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            {/* Gráfico 2: Recaudo Histórico (Line Chart Area SVG) */}
            <div className="lg:col-span-1.5 bg-[#3B1727]/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#E0B868] animate-pulse" /> Histórico de Ingresos (Días de Operación)
                </h4>
                
                {/* SVG Area Line Chart */}
                <div className="py-4">
                  <svg className="w-full h-32" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient-line" cx="0%" cy="0%" rx="100%" ry="100%">
                        <stop offset="0%" stopColor="rgba(201, 154, 61, 0.4)" />
                        <stop offset="100%" stopColor="rgba(201, 154, 61, 0.0)" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path d="M0 30 L10 24 L30 18 L50 22 L70 12 L90 8 L100 4 L100 30 Z" fill="url(#gradient-line)" />
                    {/* Stroke */}
                    <path d="M0 30 L10 24 L30 18 L50 22 L70 12 L90 8 L100 4" fill="none" stroke="#C99A3D" strokeWidth="0.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Ejes */}
              <div className="flex justify-between items-center text-[8px] font-black text-[#F3E7DC]/45 border-t border-white/5 pt-2">
                <span>DÍA 1</span>
                <span>DÍA 5</span>
                <span>DÍA 10</span>
                <span>DÍA 15</span>
                <span>DÍA 20</span>
                <span className="text-[#B08D57]">HOY</span>
              </div>
            </div>

          </div>

          {/* ECOSISTEMA DE RED / COMISIONES MLM */}
          <div className="grid grid-cols-1 gap-6">
            <GlassCard className="p-6 border-white/10 shadow-lg">
              <h4 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <HeartHandshake className="w-4.5 h-4.5 text-[#9BB18D]" /> Monitoreo Ecosistema de Red / MLM (Comisiones de Aliados)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-[#F3E7DC]/55 font-bold">
                      <th className="p-3 pl-4">Proyecto</th>
                      <th className="p-3">Aliado/Beneficiario</th>
                      <th className="p-3">Tipo de Comisión</th>
                      <th className="p-3">Monto Commission</th>
                      <th className="p-3 pr-4">Estado de Entrega</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {comisiones.map((com) => (
                      <tr key={com.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 pl-4 font-bold text-[#F3E7DC]/85">{com.nombre_proyecto}</td>
                        <td className="p-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2E0E1A]/50 border border-white/10 rounded-full font-bold text-[#F3E7DC]/70">
                            <UserCheck className="w-3.5 h-3.5 text-[#B08D57]" />
                            {com.beneficiario}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-[#F3E7DC]/55">{com.tipo || 'MLM'}</td>
                        <td className="p-3 font-black text-[#F3E7DC]">${Number(com.monto).toLocaleString()} USD</td>
                        <td className="p-3 pr-4">
                          <select 
                            value={com.estado} 
                            onChange={(e) => handleCommissionChange(com.id, e.target.value)}
                            className={`p-2 rounded-lg font-bold text-[10px] uppercase outline-none cursor-pointer border
                              ${com.estado === 'Entregada' ? 'bg-[#7A8B6F]/15 border-[#7A8B6F]/50 text-[#9BB18D] shadow-[0_0_10px_rgba(122,139,111,0.20)]' : 'bg-[#C99A3D]/15 border-[#C99A3D]/50 text-[#E0B868] shadow-[0_0_10px_rgba(249,115,22,0.15)]'}`}
                          >
                            <option value="Entregada" className="bg-[#3B1727] text-[#F3E7DC]">Entregada</option>
                            <option value="Por Entregar" className="bg-[#3B1727] text-[#F3E7DC]">Por Entregar</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* SECCIÓN 2: ANALÍTICA DE PROYECTOS Y FONDEO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico 3: Distribución Analítica por Sectores (Barras Horizontales SVG) */}
            <div className="lg:col-span-1 bg-[#3B1727]/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#B08D57]" /> Proyectos por Vertical del Holding
                </h4>
                <div className="space-y-3.5 py-2">
                  {Object.entries(distribucionVerticales).map(([vertical, count]) => {
                    const pct = ((count as number) / proyectos.length) * 100;
                    return (
                      <div key={vertical} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#F3E7DC]/70">
                          <span>{vertical}</span>
                          <span>{count as number} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#C9A46B] to-[#B08D57] transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[9px] text-[#F3E7DC]/45 italic mt-4 border-t border-white/5 pt-2">Clasificación en tiempo real basada en el Formulario Comercial 1.</p>
            </div>

            {/* Fondeo Convocatorias y Logs */}
            <div className="lg:col-span-2 bg-[#3B1727]/80 border border-white/10 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#E0B868] animate-pulse" /> Monitoreo de Fondeo y Convocatorias
              </h4>
              
              {/* Convocatorias KPI Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(convocatoriasEstados).map(([estado, val]) => (
                  <div key={estado} className="p-3 bg-[#2E0E1A]/50 border border-white/5 rounded-xl text-center">
                    <span className="block text-[8px] font-black text-[#F3E7DC]/45 uppercase tracking-widest">{estado}</span>
                    <span className={`text-xl font-black mt-1 block 
                      ${estado === 'Adjudicado' ? 'text-[#9BB18D]' : 
                        estado === 'Rechazado' ? 'text-[#E0917E]' : 
                        estado === 'Postulado' ? 'text-[#B08D57]' : 'text-[#E0B868]'}`}
                    >
                      {val as number}
                    </span>
                  </div>
                ))}
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto max-h-[160px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[8px] uppercase tracking-wider text-[#F3E7DC]/45 font-bold">
                      <th className="p-2 pl-0">Proyecto</th>
                      <th className="p-2">Fondo (Convocatoria)</th>
                      <th className="p-2">Canal Fondeo</th>
                      <th className="p-2">Vertical</th>
                      <th className="p-2 text-center">Fecha</th>
                      <th className="p-2 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {logs.map((log) => {
                      const getCanalFondeo = (name: string) => {
                        if (log.canal_fondeo) return log.canal_fondeo;
                        if (name.includes('Verde') || name.includes('GIZ')) return 'Cooperación Alemana (GIZ)';
                        if (name.includes('STEM') || name.includes('UE') || name.includes('Europea')) return 'Unión Europea';
                        if (name.includes('Emprender') || name.includes('SENA')) return 'Fondo Emprender';
                        if (name.includes('Rural') || name.includes('BID')) return 'BID';
                        if (name.includes('Salud') || name.includes('Citibank')) return 'Citibank Global';
                        return 'Canal Global';
                      };

                      const getVertical = (name: string) => {
                        if (log.vertical_asignada) return log.vertical_asignada;
                        if (name.includes('Verde') || name.includes('Clima')) return 'Medio Ambiente';
                        if (name.includes('STEM') || name.includes('Aprendizaje')) return 'Educación';
                        if (name.includes('Emprender') || name.includes('Aceleradora')) return 'Emprendimiento';
                        if (name.includes('Rural') || name.includes('BID')) return 'Agropecuario';
                        if (name.includes('Salud') || name.includes('Bienestar')) return 'Salud Mental';
                        return 'Subvenciones';
                      };

                      const dateFormatted = log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Reciente';

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.01]">
                          <td className="p-2 pl-0 font-bold text-[#F3E7DC]/70">{log.nombre_proyecto}</td>
                          <td className="p-2 text-[#F3E7DC]/55 truncate max-w-[150px]" title={log.convocatoria_nombre}>{log.convocatoria_nombre}</td>
                          <td className="p-2 text-xs text-[#B08D57]">{getCanalFondeo(log.convocatoria_nombre)}</td>
                          <td className="p-2 text-xs text-[#F3E7DC]/45 font-semibold">{getVertical(log.convocatoria_nombre)}</td>
                          <td className="p-2 text-center text-xs text-[#F3E7DC]/45">{dateFormatted}</td>
                          <td className="p-2 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded font-black text-[9px] uppercase
                              ${log.state === 'Adjudicado' || log.estado === 'Adjudicado' ? 'bg-[#7A8B6F]/15 text-[#9BB18D] border border-[#7A8B6F]/20' : 
                                log.state === 'Rechazado' || log.estado === 'Rechazado' ? 'bg-[#C0604A]/15 text-[#E0917E] border border-[#C0604A]/20' : 
                                log.state === 'Postulado' || log.estado === 'Postulado' ? 'bg-[#B08D57]/15 text-[#B08D57] border border-[#B08D57]/20 shadow-[0_0_10px_rgba(176,141,87,0.20)]' : 'bg-[#C99A3D]/15 text-[#E0B868] border border-[#C99A3D]/20'}`}
                            >
                              {log.estado === 'Postulado' ? 'Radicado exitosamente' : log.estado}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

          {/* CHECKLIST DE CUMPLIMIENTO CRUZADO */}
          <div className="grid grid-cols-1 gap-6">
            <GlassCard className="p-6 border-white/10 shadow-lg bg-[#3B1727]/75">
              <h4 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-[#E0B868] animate-pulse" /> Matriz de Cumplimiento Cruzado (Cliente vs Auditoría)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-[#F3E7DC]/55 font-bold">
                      <th className="p-3 pl-4">Cliente & Proyecto</th>
                      <th className="p-3 text-center">Insumos (Fase 1)</th>
                      <th className="p-3 text-center">Documentos (Fase 2)</th>
                      <th className="p-3">Auditoría Financiera (Marco Campoverde)</th>
                      <th className="p-3 pr-4">Auditoría Legal (Angie Lombana)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {proyectos.map((proy) => {
                      const hasInsumos = !!proy.vertical_asignada; 
                      const hasDocs = proy.plan_pago !== 'BASE'; 
                      
                      return (
                        <tr key={proy.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 pl-4">
                            <p className="font-bold text-[#F3E7DC]">{proy.nombre_cliente}</p>
                            <p className="text-[10px] text-[#B08D57] font-medium">{proy.nombre_iniciativa}</p>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded font-black text-[9px] uppercase ${hasInsumos ? 'bg-[#7A8B6F]/15 text-[#9BB18D] border border-[#7A8B6F]/20' : 'bg-[#C0604A]/15 text-[#E0917E]'}`}>
                              {hasInsumos ? '✓ Completo' : '✗ Incompleto'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded font-black text-[9px] uppercase ${hasDocs ? 'bg-[#7A8B6F]/15 text-[#9BB18D] border border-[#7A8B6F]/20' : 'bg-[#C99A3D]/15 text-[#E0B868]'}`}>
                              {hasDocs ? '✓ Adjuntos' : '✗ Pendiente'}
                            </span>
                          </td>
                          <td className="p-3">
                            <select 
                              value={proy.auditoria_financiera_estado || 'Pendiente'}
                              onChange={(e) => handleAuditChange(proy.id, 'financiera', e.target.value)}
                              className={`p-2 rounded-lg font-bold text-[10px] uppercase outline-none cursor-pointer border
                                ${proy.auditoria_financiera_estado === 'Aprobado' ? 'bg-[#7A8B6F]/15 border-[#7A8B6F]/50 text-[#9BB18D] shadow-[0_0_10px_rgba(122,139,111,0.20)]' : 
                                  proy.auditoria_financiera_estado === 'Rechazado' ? 'bg-[#C0604A]/15 border-[#C0604A]/50 text-[#E0917E]' :
                                  proy.auditoria_financiera_estado === 'En Proceso' ? 'bg-[#C99A3D]/15 border-[#C99A3D]/50 text-[#E0B868]' : 'bg-[#2E0E1A]/60 border-white/10 text-[#F3E7DC]/55'}`}
                            >
                              <option value="Pendiente" className="bg-[#3B1727] text-[#F3E7DC]">Pendiente</option>
                              <option value="En Proceso" className="bg-[#3B1727] text-[#F3E7DC]">En Proceso</option>
                              <option value="Aprobado" className="bg-[#3B1727] text-[#F3E7DC]">Aprobado</option>
                              <option value="Rechazado" className="bg-[#3B1727] text-[#F3E7DC]">Rechazado</option>
                            </select>
                          </td>
                          <td className="p-3 pr-4">
                            <select 
                              value={proy.auditoria_legal_estado || 'Pendiente'}
                              onChange={(e) => handleAuditChange(proy.id, 'legal', e.target.value)}
                              className={`p-2 rounded-lg font-bold text-[10px] uppercase outline-none cursor-pointer border
                                ${proy.auditoria_legal_estado === 'Aprobado' ? 'bg-[#7A8B6F]/15 border-[#7A8B6F]/50 text-[#9BB18D] shadow-[0_0_10px_rgba(122,139,111,0.20)]' : 
                                  proy.auditoria_legal_estado === 'Rechazado' ? 'bg-[#C0604A]/15 border-[#C0604A]/50 text-[#E0917E]' :
                                  proy.auditoria_legal_estado === 'En Proceso' ? 'bg-[#C99A3D]/15 border-[#C99A3D]/50 text-[#E0B868]' : 'bg-[#2E0E1A]/60 border-white/10 text-[#F3E7DC]/55'}`}
                            >
                              <option value="Pendiente" className="bg-[#3B1727] text-[#F3E7DC]">Pendiente</option>
                              <option value="En Proceso" className="bg-[#3B1727] text-[#F3E7DC]">En Proceso</option>
                              <option value="Aprobado" className="bg-[#3B1727] text-[#F3E7DC]">Aprobado</option>
                              <option value="Rechazado" className="bg-[#3B1727] text-[#F3E7DC]">Rechazado</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* SECCIÓN 3: ATENCIÓN Y CALIDAD (QUEJAS Y FALLOS DE IA) */}
          <div className="grid grid-cols-1 gap-6">
            <GlassCard className="p-6 border-white/10 shadow-lg bg-[#3B1727]/75">
              <h4 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-[#E0917E] animate-pulse" /> Consola de Atención al Cliente e Incidencias del Motor de IA
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-[#F3E7DC]/55 font-bold">
                      <th className="p-3 pl-4 w-1/5">Afectado / Cliente</th>
                      <th className="p-3 w-1/6">Clase de Ticket</th>
                      <th className="p-3 w-2/5">Detalle Técnico / Descripción del Fallo</th>
                      <th className="p-3 pr-4 w-1/5">Resolución en Vivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {quejas.map((tkt) => (
                      <tr key={tkt.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 pl-4 font-bold text-[#F3E7DC]/85">{tkt.nombre_cliente}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded font-black text-[9px] uppercase 
                            ${tkt.tipo === 'Fallo Motor IA' ? 'bg-[#C0604A]/15 text-[#E0917E] border border-[#C0604A]/20 shadow-[0_0_10px_rgba(192,96,74,0.15)]' : 'bg-[#C99A3D]/15 text-[#E0B868] border border-[#C99A3D]/20'}`}
                          >
                            {tkt.tipo}
                          </span>
                        </td>
                        <td className="p-3 text-[#F3E7DC]/70 leading-relaxed max-w-sm truncate group hover:text-[#F3E7DC] transition-colors" title={tkt.descripcion}>{tkt.descripcion}</td>
                        <td className="p-3 pr-4">
                          <select 
                            value={tkt.estado} 
                            onChange={(e) => handleQuejaStatusChange(tkt.id, e.target.value)}
                            className={`p-2 rounded-lg font-bold text-[10px] uppercase outline-none cursor-pointer border
                              ${tkt.estado === 'Resuelto' ? 'bg-[#7A8B6F]/15 border-[#7A8B6F]/50 text-[#9BB18D] shadow-[0_0_10px_rgba(122,139,111,0.20)]' : 
                                tkt.estado === 'En Proceso' ? 'bg-[#C99A3D]/15 border-[#C99A3D]/50 text-[#E0B868]' : 'bg-[#C0604A]/15 border-[#C0604A]/50 text-[#E0917E] shadow-[0_0_10px_rgba(192,96,74,0.20)]'}`}
                          >
                            <option value="Abierto" className="bg-[#3B1727] text-[#F3E7DC]">Abierto</option>
                            <option value="En Proceso" className="bg-[#3B1727] text-[#F3E7DC]">En Proceso</option>
                            <option value="Resuelto" className="bg-[#3B1727] text-[#F3E7DC]">Resuelto</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

        </>
      )}

    </div>
  );
}
