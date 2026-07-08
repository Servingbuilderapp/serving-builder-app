import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appId, appSlug } = await req.json()

    if (!appSlug) {
      return NextResponse.json({ error: 'Missing appSlug' }, { status: 400 })
    }

    // 1. Get user's current plan and app_limit
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan_id, plans(app_limit)')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.plan_id) {
      return NextResponse.json({ error: 'No active plan found' }, { status: 403 })
    }

    const appLimit = (userData.plans as any)?.app_limit || 0

    // 2. Count current unlocked apps
    const { count, error: countError } = await supabase
      .from('user_app_overrides')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      return NextResponse.json({ error: 'Error counting apps' }, { status: 500 })
    }

    const currentUnlocks = count || 0

    if (currentUnlocks >= appLimit) {
      return NextResponse.json({ 
        error: 'App limit reached',
        limit: appLimit,
        current: currentUnlocks
      }, { status: 403 })
    }

    // 3. Resolve appId if only slug was provided
    let finalAppId = appId
    if (!finalAppId) {
      const { data: appData } = await supabase
        .from('micro_apps')
        .select('id')
        .eq('slug', appSlug)
        .single()
      
      if (!appData) {
        return NextResponse.json({ error: 'App not found' }, { status: 404 })
      }
      finalAppId = appData.id
    }

    // 4. Insert unlock record
    // Use admin client to bypass RLS if necessary, or regular client if RLS allows insert for own user_id
    const { error: insertError } = await supabaseAdmin
      .from('user_app_overrides')
      .insert({
        user_id: user.id,
        app_id: finalAppId
      })

    // If it fails because of unique constraint (already unlocked), we just ignore and return success
    if (insertError && insertError.code !== '23505') {
      console.error('Error inserting unlock:', insertError)
      return NextResponse.json({ error: 'Failed to unlock app' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      unlockedCount: currentUnlocks + 1,
      limit: appLimit
    })

  } catch (error: any) {
    console.error('Unlock app error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
