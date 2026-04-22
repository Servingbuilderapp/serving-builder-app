import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { buildPrompt } from '@/lib/prompts'
import { callGemini } from '@/lib/gemini'

export async function POST(req: Request) {
  try {
    const { appSlug, inputs } = await req.json()
    const supabase = await createClient()

    // 1. Validate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch app details
    const { data: app, error: appError } = await supabase
      .from('micro_apps')
      .select('id, prompt_template')
      .eq('slug', appSlug)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // 3. Insert pending execution
    const { data: execution, error: execError } = await supabase
      .from('app_executions')
      .insert({
        user_id: user.id,
        app_id: app.id,
        inputs,
        status: 'pending'
      })
      .select()
      .single()

    if (execError || !execution) {
      return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 })
    }

    // 4. Background execution using 'after'
    after(async () => {
      try {
        // Update to processing
        await supabase
          .from('app_executions')
          .update({ status: 'processing' })
          .eq('id', execution.id)

        const fullPrompt = buildPrompt(app.prompt_template, inputs)
        const resultMarkdown = await callGemini(fullPrompt)

        await supabase
          .from('app_executions')
          .update({
            status: 'completed',
            result: { markdown: resultMarkdown },
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id)
      } catch (error: any) {
        console.error('Background execution error:', error)
        try {
          const supabaseAdmin = await createClient() // Re-fetch client for safety
          await supabaseAdmin
            .from('app_executions')
            .update({
              status: 'error',
              error_message: error.message || 'Unknown error during generation'
            })
            .eq('id', execution.id)
        } catch (dbError) {
          console.error('Failed to update error status in DB:', dbError)
        }
      }
    })

    return NextResponse.json({ executionId: execution.id })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
