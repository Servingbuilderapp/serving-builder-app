import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin as adminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    // 1. Verificar que quien llama es admin
    const { data: adminData } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUser?.id)
      .single()

    if (adminData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, planId } = await req.json()

    // 2. Actualizar plan
    const updateData = planId ? {
      plan_id: planId,
      plan_assigned_at: new Date().toISOString(),
      plan_source: 'manual'
    } : {
      plan_id: null,
      plan_assigned_at: null,
      plan_source: null
    }

    const { error } = await adminClient
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin update user plan error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
