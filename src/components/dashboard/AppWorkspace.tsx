'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, X, Loader2, FileText, Code, BarChart3, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

interface AppWorkspaceProps {
  appId: string
  currentExecutionId: string | null
  schema: any[]
  profile?: any
}

export function AppWorkspace({ appId, currentExecutionId, schema, profile }: AppWorkspaceProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const supabase = createClient()
  const [execution, setExecution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const responseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentExecutionId) {
      setExecution(null)
      setIsLoading(false)
      return
    }

    async function fetchExecution() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('app_executions')
        .select('*')
        .eq('id', currentExecutionId)
        .single()

      if (!error && data) {
        setExecution(data)
        if (data.status === 'completed' || data.status === 'error') {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    fetchExecution()

    const channel = supabase
      .channel(`execution-${currentExecutionId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'app_executions',
        filter: `id=eq.${currentExecutionId}`
      }, (payload) => {
        setExecution(payload.new)
        if (payload.new.status === 'completed' || payload.new.status === 'error') {
          setIsLoading(false)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentExecutionId, supabase])

  const copyToClipboard = async (type: 'text' | 'markdown' | 'html') => {
    if (!responseRef.current && type !== 'markdown') return

    let content = ''
    if (type === 'text') {
      content = responseRef.current?.innerText || ''
    } else if (type === 'markdown') {
      content = execution?.result?.markdown || ''
    } else if (type === 'html') {
      content = responseRef.current?.innerHTML || ''
    }

    try {
      await navigator.clipboard.writeText(content)
      toast({ 
        title: language === 'en' ? 'Copied to clipboard!' : '¡Copiado al portapapeles!', 
        type: 'success' 
      })
    } catch (err) {
      toast({ 
        title: language === 'en' ? 'Failed to copy' : 'Error al copiar', 
        type: 'error' 
      })
    }
  }

  const renderInputValue = (key: string, value: any) => {
    const field = schema.find(f => (f.id === key || f.name === key))
    const label = field ? (language === 'en' ? field.label_en : field.label_es) : key

    if (value === 'true' || value === true) {
      return (
        <div key={key} className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
          <div className="flex items-center gap-2 text-green-500 py-1">
            <Check className="h-4 w-4" />
          </div>
        </div>
      )
    }
    if (value === 'false' || value === false) {
      return (
        <div key={key} className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
          <div className="flex items-center gap-2 text-red-500 py-1">
            <X className="h-4 w-4" />
          </div>
        </div>
      )
    }

    return (
      <div key={key} className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
        <span className="text-sm text-white/80">{value}</span>
      </div>
    )
  }

  if (!currentExecutionId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
          <Loader2 className="h-10 w-10 text-white/10" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          {language === 'en' ? 'Ready for your next creation' : 'Listo para tu próxima creación'}
        </h2>
        <p className="text-white/40 max-w-sm">
          {language === 'en' 
            ? 'Fill out the form and click generate to start the magic.' 
            : 'Completa el formulario y haz clic en generar para comenzar la magia.'}
        </p>
      </div>
    )
  }

  const isProcessing = execution?.status === 'pending' || execution?.status === 'processing'
  const isGrowthEligible = profile?.plan_slug === 'growth' || profile?.plan_slug === 'professional' || profile?.plan_slug === 'elite'

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-0">
      {/* Analytics Section (Conditional) */}
      {isGrowthEligible && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a233a]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-color-primary/10 flex items-center justify-center text-color-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Executions</p>
              <p className="text-xl font-black text-white">47</p>
            </div>
          </div>
          <div className="bg-[#1a233a]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-color-accent-pink/10 flex items-center justify-center text-color-accent-pink">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Avg. Response Time</p>
              <p className="text-xl font-black text-white">1.2s</p>
            </div>
          </div>
          <div className="bg-[#1a233a]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-color-accent-blue/10 flex items-center justify-center text-color-accent-blue">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Efficiency Score</p>
              <p className="text-xl font-black text-white">98%</p>
            </div>
          </div>
        </div>
      )}

      {/* The Petition Block */}
      <div className="bg-[#1a233a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-4">
          <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            {language === 'en' ? 'The Petition' : 'La Petición'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {execution?.inputs && Object.entries(execution.inputs).map(([key, value]) => renderInputValue(key, value))}
        </div>
      </div>

      {/* The Response Block */}
      <div className="flex-1 flex flex-col min-h-100">
        {isProcessing ? (
          <div className="flex-1 bg-[#1a233a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent animate-pulse" />
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-white/5 border-t-color-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-color-primary blur-xl animate-pulse" />
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-color-primary/20 text-color-primary text-[10px] font-bold uppercase tracking-widest animate-bounce">
                  {language === 'en' ? 'Generating Content...' : 'Generando Contenido...'}
                </span>
              </div>
              
              <div className="w-64 flex flex-col gap-2">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-color-primary to-color-accent-pink w-1/3 animate-[shimmer_2s_infinite]" />
                </div>
                <div className="h-2 w-2/3 bg-white/5 rounded-full mx-auto" />
              </div>
            </div>
          </div>
        ) : execution?.status === 'error' ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Generation Error' : 'Error de Generación'}
            </h3>
            <p className="text-red-400/80 text-sm max-w-md mx-auto">
              {execution.error_message || (language === 'en' ? 'Unknown error' : 'Error desconocido')}
            </p>
          </div>
        ) : execution?.status === 'completed' ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-color-primary/20 flex items-center justify-center text-color-primary">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-white">
                  {language === 'en' ? 'Final Result' : 'Resultado Final'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard('text')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {language === 'en' ? 'Text' : 'Texto'}
                </button>
                <button
                  onClick={() => copyToClipboard('markdown')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Code className="h-3.5 w-3.5" />
                  {language === 'en' ? 'Markdown' : 'Markdown'}
                </button>
                <button
                  onClick={() => copyToClipboard('html')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-color-primary text-xs font-bold text-white hover:bg-color-primary transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] opacity-90 hover:opacity-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {language === 'en' ? 'Copy HTML' : 'Copiar HTML'}
                </button>
              </div>
            </div>

            {/* Result Card with Glassmorphism */}
            <div className="glass-card p-6 md:p-10 overflow-hidden relative group">
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-color-primary/50 via-color-accent-pink/50 to-color-primary/50" />
              
              <div ref={responseRef} className="prose prose-invert prose-sm md:prose-base max-w-none relative z-10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {execution?.result?.markdown || ''}
                </ReactMarkdown>
              </div>

              {/* Dynamic Watermark / White Label Logic */}
              <div className="absolute bottom-6 right-8 pointer-events-none select-none opacity-20 group-hover:opacity-40 transition-opacity">
                {(!profile?.plan_slug || profile?.plan_slug === 'explorador') ? (
                  // Watermark for Free Plan
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Generated by</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded bg-linear-to-tr from-color-primary to-color-accent-pink flex items-center justify-center">
                        <span className="text-[8px] font-black text-white italic">S</span>
                      </div>
                      <span className="text-xs font-black tracking-tighter uppercase italic text-white">
                        SERVING <span className="text-color-primary">BUILDER</span>
                      </span>
                    </div>
                  </div>
                ) : (profile?.plan_slug === 'professional' || profile?.plan_slug === 'elite') && profile?.brand_logo_url ? (
                  // White Label Logo for High Tiers
                  <div className="flex flex-col items-end">
                    <img 
                      src={profile.brand_logo_url} 
                      alt="Brand Logo" 
                      className="max-h-8 w-auto object-contain grayscale brightness-200" 
                    />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 mt-1">
                      {profile.brand_name || 'Your Brand'}
                    </span>
                  </div>
                ) : null /* No Watermark for Entrepreneur/Growth unless configured */}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
