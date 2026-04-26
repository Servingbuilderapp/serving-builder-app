import { NextResponse } from 'next/server'
import { buildPrompt } from '@/lib/prompts'
import { callGemini } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { appSlug, inputs } = await req.json()

    // Para la ruta pública, podemos hacer la generación directamente
    // sin guardar en la tabla de app_executions, ya que no hay usuario.
    
    const supabase = await createClient()
    
    let promptTemplate = ''

    // If it's a specific slug, we fetch the template.
    if (appSlug) {
      const { data: app, error: appError } = await supabase
        .from('micro_apps')
        .select('prompt_template')
        .eq('slug', appSlug)
        .single()

      if (!appError && app) {
        promptTemplate = app.prompt_template
      }
    }

    // Fallback if not found or if it's the Idea/Project generator
    if (!promptTemplate) {
      // Basic fallback template if needed for trial
      promptTemplate = `Actúa como un experto en proyectos ambientales. Genera un plan detallado para: {{idea_description}}. Contexto: {{context}}`
    }

    const fullPrompt = buildPrompt(promptTemplate, inputs)
    const resultMarkdown = await callGemini(fullPrompt)

    return NextResponse.json({ result: { markdown: resultMarkdown } })
  } catch (error: any) {
    console.error('Public API Error:', error)
    return NextResponse.json({ error: error.message || 'Error during generation' }, { status: 500 })
  }
}
