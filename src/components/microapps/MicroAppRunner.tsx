'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { DynamicForm } from '../dashboard/DynamicForm'
import { AutofillBadges } from '../dashboard/AutofillBadges'
import { AppHistory } from '../dashboard/AppHistory'
import { AppWorkspace } from '../dashboard/AppWorkspace'
import { Sparkles, History, FormInput, Loader2 } from 'lucide-react'
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
  
  const workspaceRef = useRef<HTMLDivElement>(null)

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
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appSlug, 
          inputs: { 
            ...values, 
            responseLanguage: language === 'en' ? 'English' : 'Español' 
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
      <div className="flex items-center justify-center h-full text-white/40">
        {language === 'en' ? 'App not found' : 'Aplicación no encontrada'}
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-4 md:gap-6 lg:gap-8 overflow-y-auto md:overflow-hidden p-6 pb-4">
      {/* Left Column: Form & History */}
      <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 flex flex-col h-auto md:h-full bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
        {/* Tabs Header */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('form')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all relative",
              activeTab === 'form' ? "text-white" : "text-white/40 hover:text-white/60"
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
              activeTab === 'history' ? "text-white" : "text-white/40 hover:text-white/60"
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
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-color-primary" />
                  {language === 'en' ? app.name_en : app.name_es}
                </h1>
                <p className="text-sm text-white/50 mt-1">
                  {language === 'en' ? app.description_en : app.description_es}
                </p>
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
    </div>
  )
}
