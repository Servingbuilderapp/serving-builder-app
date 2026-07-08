import { NextResponse } from 'next/server';
import { finalizeProjectStructuring } from '@/app/dashboard/formulario-tecnico/[id]/actions';

export async function POST(request: Request) {
  try {
    // Para entornos productivos, puedes agregar una validación de API Key secreta aquí
    const body = await request.json();
    const { id, fase2Data, planPago, nombreProyecto } = body;

    if (!id || !fase2Data || !planPago || !nombreProyecto) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    console.log(`[Next.js API] Petición recibida de n8n para estructurar proyecto: ${id}`);
    
    // Ejecutamos la estructuración metodológica y el dossier final de forma segura
    const data = await finalizeProjectStructuring(id, fase2Data, planPago, nombreProyecto);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[Next.js API] Error al finalizar la estructuración del proyecto:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
