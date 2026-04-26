'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { DynamicForm } from '../dashboard/DynamicForm'
import { Sparkles, FormInput, Loader2, PlayCircle, X, FileText, Zap, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'

interface PublicMicroAppRunnerProps {
  app: any
  onClose: () => void
}

export function PublicMicroAppRunner({ app, onClose }: PublicMicroAppRunnerProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [showTutorial, setShowTutorial] = useState(false)
  const [hasUsedTrial, setHasUsedTrial] = useState(false)
  
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Verificar si ya usó la prueba gratuita en general
    const trialUsed = localStorage.getItem('ecoserving_public_trial_used')
    if (trialUsed === 'true') {
      setHasUsedTrial(true)
    }
  }, [])

  const handleCloseTutorial = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setShowTutorial(false)
  }

  const handleGenerate = async (values: Record<string, string>) => {
    if (hasUsedTrial) {
      toast({
        title: language === 'en' ? 'Free trial limit reached' : 'Límite de prueba gratuita alcanzado',
        type: 'error'
      })
      setTimeout(() => {
        router.push('/signup')
      }, 1500)
      return
    }

    setIsGenerating(true)
    try {
      const selectedLang = values.responseLanguage || 'es'
      const langWord = selectedLang === 'en' ? 'English' : 'Español'
      
      const response = await fetch('/api/public-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appSlug: app.slug, 
          inputs: { 
            ...values, 
            responseLanguage: langWord
          } 
        })
      })

      const data = await response.json()
      if (data.result && data.result.markdown) {
        setResult(data.result.markdown)
        // Marcar como usado
        localStorage.setItem('ecoserving_public_trial_used', 'true')
        setHasUsedTrial(true)
        
        // Auto-scroll
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      } else if (data.error) {
        toast({ title: data.error, type: 'error' })
      }
    } catch (error) {
      console.error('Generation failed:', error)
      toast({ title: 'Error generating response', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-color-base-content/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-color-base-content/10 text-color-base-content/60 hover:text-color-base-content hover:bg-color-base-content/20 rounded-full transition-colors">
          <X className="h-6 w-6" />
        </button>

        {/* Left Column: Form */}
        <div className="w-full md:w-[400px] shrink-0 flex flex-col h-auto md:h-full bg-color-base-100 border-r border-color-base-content/10 overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 mb-3 rounded-full bg-color-primary/10 text-color-primary text-[10px] font-black uppercase tracking-widest border border-color-primary/20">
                {language === 'en' ? 'Free Trial' : 'Prueba Gratuita'}
              </div>
              <h1 className="text-2xl font-black text-color-base-content flex items-center gap-2 italic uppercase tracking-tighter">
                <Sparkles className="h-6 w-6 text-color-primary" />
                {language === 'en' ? app.name_en || app.name_es : app.name_es}
              </h1>
              <p className="text-sm text-color-base-content/60 mt-2 mb-6 font-medium">
                {language === 'en' ? app.description_en || app.description_es : app.description_es}
              </p>
              <button 
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:text-color-primary/80 bg-color-primary/10 hover:bg-color-primary/20 px-4 py-2 rounded-xl transition-colors w-fit border border-color-primary/20"
              >
                <PlayCircle className="h-4 w-4" />
                {language === 'en' ? 'Watch Tutorial' : 'Ver Tutorial'}
              </button>
            </div>
            
            {hasUsedTrial && !result ? (
              <div className="p-6 bg-color-primary/10 border border-color-primary/20 rounded-2xl text-center space-y-4">
                <Sparkles className="h-8 w-8 text-color-primary mx-auto" />
                <h3 className="font-black text-color-base-content uppercase tracking-tight">
                  {language === 'en' ? 'Trial limit reached' : 'Límite de prueba alcanzado'}
                </h3>
                <p className="text-sm text-color-base-content/60">
                  {language === 'en' ? 'You have used your free trial. Sign up to unlock unlimited access and 120+ specialized tools.' : 'Has utilizado tu prueba gratuita. Regístrate para desbloquear acceso ilimitado y más de 120 herramientas especializadas.'}
                </p>
                <button onClick={() => router.push('/signup')} className="w-full py-3 bg-color-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-color-primary/90 transition-colors">
                  {language === 'en' ? 'Create Account' : 'Crear Cuenta'}
                </button>
              </div>
            ) : (
              <DynamicForm 
                schema={app.form_schema || []} 
                initialValues={formValues}
                onSubmit={handleGenerate}
                isLoading={isGenerating}
              />
            )}
          </div>
        </div>

        {/* Right Column: Result Workspace */}
        <div ref={resultRef} className="flex-1 flex flex-col h-auto md:h-full bg-white relative overflow-y-auto custom-scrollbar p-6 md:p-10">
          {!result && !isGenerating ? (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
               <LayoutTemplate className="h-16 w-16 mb-6 text-color-base-content/40" />
               <p className="text-lg font-bold text-color-base-content/60 max-w-sm">
                 {language === 'en' 
                   ? 'Fill out the form and click generate to see the AI engine in action.' 
                   : 'Completa el formulario y haz clic en generar para ver al motor de IA en acción.'}
               </p>
             </div>
          ) : isGenerating ? (
             <div className="h-full flex flex-col items-center justify-center gap-6">
               <div className="relative">
                 <div className="absolute inset-0 bg-color-primary/20 blur-xl rounded-full" />
                 <Loader2 className="h-12 w-12 text-color-primary animate-spin relative z-10" />
               </div>
               <p className="text-sm font-black text-color-base-content/60 animate-pulse uppercase tracking-widest">
                 {language === 'en' ? 'Generating Impact Report...' : 'Generando Reporte de Impacto...'}
               </p>
             </div>
          ) : (
            <div className="prose max-w-none">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {result}
               </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Tutorial Modal Overlay */}
        {showTutorial && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-white/90 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border border-color-base-content/10 relative">
              <button onClick={handleCloseTutorial} className="absolute top-4 right-4 text-color-base-content/40 hover:text-color-base-content p-1 bg-color-base-content/5 rounded-full">
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-xl font-black text-color-base-content flex items-center gap-2 mb-6 italic uppercase">
                <PlayCircle className="h-5 w-5 text-color-primary" />
                {language === 'en' ? 'How to use this App' : 'Cómo usar esta App'}
              </h3>
              
              <div className="aspect-video w-full bg-color-base-content/5 rounded-2xl overflow-hidden mb-6">
                <iframe 
                  width="100%" height="100%" 
                  src="https://www.youtube.com/embed/9vY9qxmNNP8?rel=0&showinfo=0" 
                  title="Tutorial Video" frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
