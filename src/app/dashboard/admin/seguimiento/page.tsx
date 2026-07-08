'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Loader2, Activity, ShieldCheck, Users, Calendar, Phone, Mail } from 'lucide-react';
import { getCitasAction, updateEstadoComercialAction } from './actions';
import { GlowButton } from '@/components/ui/GlowButton';

export default function TorreDeControlPage() {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const ESTADOS = [
    "Cita Agendada",
    "Pago Realizado",
    "Pausado",
    "No Asistió",
    "Descartado"
  ];

  const fetchCitas = async () => {
    try {
      const data = await getCitasAction();
      setCitas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
    const interval = setInterval(fetchCitas, 5000); // Polling cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const handleEstadoChange = async (id: string, nuevoEstado: string) => {
    setUpdatingId(id);
    try {
      await updateEstadoComercialAction(id, nuevoEstado);
      await fetchCitas(); // Refrescar inmediatamente
    } catch (err) {
      alert("Error actualizando estado.");
      console.error(err);
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center justify-center px-3 py-1 bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-[10px] uppercase font-bold tracking-widest rounded-full mb-3 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <ShieldCheck className="w-3 h-3 mr-1" /> Modo Jefe
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
            Torre de Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-cyan-400 glow-text-blue">Comercial</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1">Monitoreo en tiempo real de citas y conversión.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-lg">
          <Activity className="w-4 h-4 text-brand-orange animate-pulse" />
          <span className="text-sm font-semibold text-gray-200 tracking-wide">Sistema Live-Sync Activo</span>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4 pl-6 w-1/4">Cliente & Proyecto</th>
                <th className="p-4 w-1/5">Asesor Asignado</th>
                <th className="p-4 w-1/5">Cita</th>
                <th className="p-4 w-1/4">Estado Comercial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {citas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay citas agendadas todavía.
                  </td>
                </tr>
              ) : (
                citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-white/[0.05] transition-colors group">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-100 text-sm group-hover:text-brand-blue transition-colors">{cita.nombre_cliente}</p>
                      <p className="text-xs text-gray-400 font-medium truncate max-w-[200px] mb-2">{cita.nombre_iniciativa}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {cita.telefono_whatsapp}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/10 rounded-full shadow-sm text-xs font-semibold text-gray-300">
                        <Users className="w-3 h-3 text-brand-blue" />
                        {cita.asesor_asignado}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200 capitalize flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-orange" /> {cita.fecha_cita}
                        </span>
                        <span className="text-xs text-brand-blue font-black tracking-wider mt-0.5 glow-text-blue">{cita.hora_cita}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 relative">
                      {updatingId === cita.id ? (
                        <div className="flex items-center gap-2 text-xs text-brand-blue font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" /> Actualizando...
                        </div>
                      ) : (
                        <select
                          value={cita.estado_comercial}
                          onChange={(e) => handleEstadoChange(cita.id, e.target.value)}
                          className={`w-full p-2.5 text-xs font-bold uppercase tracking-wider rounded-lg outline-none appearance-none cursor-pointer border shadow-sm transition-all
                            ${cita.estado_comercial === 'Pago Realizado' ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                              cita.estado_comercial === 'Pausado' ? 'bg-amber-900/40 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                              cita.estado_comercial === 'No Asistió' || cita.estado_comercial === 'Descartado' ? 'bg-rose-900/40 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
                              'bg-black/40 border-white/10 text-gray-300 hover:border-brand-blue/50 focus:border-brand-blue'
                            }`}
                        >
                          {ESTADOS.map(estado => (
                            <option key={estado} value={estado} className="bg-gray-900 text-white">{estado}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
}
