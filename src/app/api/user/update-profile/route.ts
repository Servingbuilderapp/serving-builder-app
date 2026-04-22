import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, avatarUrl } = await req.json()

    // 1. Update Auth Metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { 
        first_name: firstName, 
        last_name: lastName,
        avatar_url: avatarUrl 
      }
    })

    if (authError) throw authError

    // 2. Update public.users table
    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim()
    }
    
    // Only update avatar_url if provided in the payload
    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl
    }

    const { error: dbError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
