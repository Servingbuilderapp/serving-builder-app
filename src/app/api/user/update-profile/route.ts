import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, avatarUrl, brandName, brandLogoUrl } = await req.json()

    // 1. Update Auth Metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { 
        first_name: firstName, 
        last_name: lastName,
        avatar_url: avatarUrl,
        brand_name: brandName,
        brand_logo_url: brandLogoUrl
      }
    })

    if (authError) throw authError

    // 2. Update public.users table (try to update if columns exist, ignore if not)
    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim()
    }
    
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl
    if (brandName !== undefined) updateData.brand_name = brandName
    if (brandLogoUrl !== undefined) updateData.brand_logo_url = brandLogoUrl

    const { error: dbError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    // We don't throw dbError here because columns might not exist yet
    // and Auth Metadata is our primary source for White Label for now.
    if (dbError) {
      console.warn('Database profile update warning (likely missing columns):', dbError.message)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
