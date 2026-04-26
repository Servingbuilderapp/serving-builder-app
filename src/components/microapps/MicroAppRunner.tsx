'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { DynamicForm } from '../dashboard/DynamicForm'
import { AutofillBadges } from '../dashboard/AutofillBadges'
import { AppHistory } from '../dashboard/AppHistory'
import { AppWorkspace } from '../dashboard/AppWorkspace'
import { Sparkles, History, FormInput, Loader2, PlayCircle, X, FileText, Zap, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MicroAppRunnerProps {
  appSlug: string
}

export function MicroAppRunner({ appSlug }: MicroAppRunnerProps) {
  const { language } = useTranslation()
  const supabase = createClient()
  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [activePresetId, setActivePresetId] = useState<string>('')
  const [profile, setProfile] = useState<any>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  
  const workspaceRef = useRef<HTMLDivElement>(null)

  const handleCloseTutorial = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel() // Stop speech when closing modal
    }
    setShowTutorial(false)
  }

  useEffect(() => {
    async function fetchApp() {
      setIsLoading(true)
      
      // Fetch User Profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(prof)
      }

      // Fetch App
      const { data, error } = await supabase
        .from('micro_apps')
        .select('*')
        .eq('slug', appSlug)
        .single()

      if (!error && data) {
        setApp(data)
      }
      setIsLoading(false)
    }
    fetchApp()
  }, [appSlug, supabase])

  const handleGenerate = async (values: Record<string, string>) => {
    setIsGenerating(true)
    try {
      // Map 'en' / 'es' code to actual prompt language word
      const selectedLang = values.responseLanguage || 'es'
      const langWord = selectedLang === 'en' ? 'English' : 'Español'
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appSlug, 
          inputs: { 
            ...values, 
            responseLanguage: langWord
          } 
        })
      })

      const data = await response.json()
      if (data.executionId) {
        setCurrentExecutionId(data.executionId)
        // Auto-scroll on mobile
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          workspaceRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectPreset = (values: Record<string, string>, id: string) => {
    setFormValues(values)
    setActivePresetId(id)
  }

  const handleSelectHistory = (executionId: string) => {
    setCurrentExecutionId(executionId)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-color-primary animate-spin" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center h-full text-color-base-content/40">
        {language === 'en' ? 'App not found' : 'Aplicación no encontrada'}
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-4 md:gap-6 lg:gap-8 overflow-y-auto md:overflow-hidden p-6 pb-4">
      {/* Left Column: Form & History */}
      <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 flex flex-col h-auto md:h-full bg-white border border-color-base-content/10 rounded-3xl overflow-hidden shadow-sm">
        {/* Tabs Header */}
        <div className="flex border-b border-color-base-content/10">
          <button
            onClick={() => setActiveTab('form')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all relative",
              activeTab === 'form' ? "text-color-base-content" : "text-color-base-content/40 hover:text-color-base-content/60"
            )}
          >
            <FormInput className="h-4 w-4" />
            {language === 'en' ? 'Form' : 'Formulario'}
            {activeTab === 'form' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-color-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all relative",
              activeTab === 'history' ? "text-color-base-content" : "text-color-base-content/40 hover:text-color-base-content/60"
            )}
          >
            <History className="h-4 w-4" />
            {language === 'en' ? 'History' : 'Historial'}
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-color-primary" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'form' ? (
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-color-base-content flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-color-primary" />
                  {language === 'en' ? app.name_en : app.name_es}
                </h1>
                <p className="text-sm text-color-base-content/60 mt-1 mb-4">
                  {language === 'en' ? app.description_en : app.description_es}
                </p>
                <button 
                  onClick={() => setShowTutorial(true)}
                  className="flex items-center gap-2 text-xs font-bold text-color-primary hover:text-color-primary/80 bg-color-primary/10 hover:bg-color-primary/20 px-3 py-1.5 rounded-lg transition-colors w-fit"
                >
                  <PlayCircle className="h-4 w-4" />
                  {language === 'en' ? 'Watch Tutorial' : 'Ver Tutorial'}
                </button>
              </div>

              <AutofillBadges 
                presets={app.autofill_presets} 
                onSelect={handleSelectPreset}
                activePresetId={activePresetId}
              />
              
              <DynamicForm 
                schema={app.form_schema} 
                initialValues={formValues}
                onSubmit={handleGenerate}
                isLoading={isGenerating}
              />
            </div>
          ) : (
            <AppHistory 
              appId={app.id} 
              onSelect={handleSelectHistory} 
              currentExecutionId={currentExecutionId}
            />
          )}
        </div>
      </div>

      {/* Right Column: Workspace */}
      <div 
        ref={workspaceRef}
        className="flex-1 flex flex-col h-auto md:h-full md:overflow-hidden relative min-h-[400px] md:min-h-0 shrink-0 mb-10 md:mb-0"
      >
        <div className="flex-1 md:overflow-y-auto custom-scrollbar md:pr-2">
          <AppWorkspace 
            appId={app.id} 
            currentExecutionId={currentExecutionId} 
            schema={app.form_schema}
            profile={profile}
          />
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-color-base-content/80 backdrop-blur-sm" onClick={handleCloseTutorial} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-color-base-content flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-color-primary" />
                {language === 'en' ? 'How to use this App' : 'Cómo usar esta App'}
              </h3>
              <button onClick={handleCloseTutorial} className="text-color-base-content/40 hover:text-color-base-content p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="aspect-video w-full bg-color-base-content/5 rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-color-base-content/10 relative group">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/9vY9qxmNNP8?rel=0&showinfo=0" 
                title="Tutorial Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-color-base-100 p-5 rounded-2xl border border-color-base-content/5 flex flex-col gap-3 transition-all hover:shadow-md hover:border-color-primary/20">
                <div className="flex items-center gap-2 text-color-primary">
                  <FileText className="h-5 w-5" />
                  <h4 className="font-bold text-sm">{language === 'en' ? 'Input Limit' : 'Límite de Entrada'}</h4>
                </div>
                <p className="text-xs text-color-base-content/70 leading-relaxed">
                  {language === 'en' ? 'Paste up to ~3,000 words (about 4-5 pages) of rich context.' : 'Puedes pegar hasta ~3,000 palabras (unas 4-5 páginas) de contexto estratégico sin problemas.'}
                </p>
              </div>

              <div className="bg-color-base-100 p-5 rounded-2xl border border-color-base-content/5 flex flex-col gap-3 transition-all hover:shadow-md hover:border-color-primary/20">
                <div className="flex items-center gap-2 text-color-primary">
                  <Zap className="h-5 w-5" />
                  <h4 className="font-bold text-sm">{language === 'en' ? 'Output Size' : 'Tamaño de Salida'}</h4>
                </div>
                <p className="text-xs text-color-base-content/70 leading-relaxed">
                  {language === 'en' ? 'The AI generates highly concentrated responses of up to 1,000 words.' : 'La IA generará respuestas altamente concentradas y procesables de hasta 1,000 palabras.'}
                </p>
              </div>

              <div className="bg-color-base-100 p-5 rounded-2xl border border-color-base-content/5 flex flex-col gap-3 transition-all hover:shadow-md hover:border-color-primary/20">
                <div className="flex items-center gap-2 text-color-primary">
                  <LayoutTemplate className="h-5 w-5" />
                  <h4 className="font-bold text-sm">{language === 'en' ? 'Format Output' : 'Formato de Salida'}</h4>
                </div>
                <p className="text-xs text-color-base-content/70 leading-relaxed">
                  {language === 'en' ? 'Produces advanced Text, Code, and Markdown. No raw media.' : 'Genera estructuras en Texto avanzado, Tablas y Código. No produce imágenes ni audios nativos.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
