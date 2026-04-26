'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlowButton } from '@/components/ui/GlowButton'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormFieldSchema {
  id?: string
  name?: string
  label_es: string
  label_en: string
  placeholder_es?: string
  placeholder_en?: string
  type: 'text' | 'textarea' | 'select' | 'toggle'
  options_es?: string[]
  options_en?: string[]
  required?: boolean
}

interface DynamicFormProps {
  schema: FormFieldSchema[]
  initialValues?: Record<string, string>
  onSubmit: (values: Record<string, string>) => void
  isLoading?: boolean
}

export function DynamicForm({ schema, initialValues = {}, onSubmit, isLoading }: DynamicFormProps) {
  const { language } = useTranslation()
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    // Spread initialValues LAST to overwrite state
    setValues(prev => ({ ...prev, ...initialValues }))
  }, [initialValues])

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Default responseLanguage to current global language if not set
    const finalValues = { 
      responseLanguage: language,
      ...values 
    }
    onSubmit(finalValues)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {schema.map((field, idx) => {
        const fieldName = field.id || field.name || `field_${idx}`
        const label = language === 'en' ? field.label_en : field.label_es
        const placeholder = language === 'en' ? field.placeholder_en : field.placeholder_es

        return (
          <div key={fieldName} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-color-base-content/70">
              {label} {field.required && <span className="text-color-accent-pink">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={values[fieldName] || ''}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={placeholder || (language === 'en' ? 'E.g., Write your request or paste information here...' : 'Ej. Escribe tu solicitud o pega información aquí...')}
                required={field.required}
                rows={4}
                className="w-full bg-white border border-color-base-content/10 rounded-xl px-4 py-3 text-color-base-content placeholder-color-base-content/30 focus:outline-none focus:border-color-primary/50 focus:ring-1 focus:ring-color-primary/50 transition-all resize-none shadow-sm"
              />
            ) : field.type === 'select' ? (
              <div className="relative">
                <select
                  value={values[fieldName] || ''}
                  onChange={(e) => handleChange(fieldName, e.target.value)}
                  required={field.required}
                  className="w-full bg-white border border-color-base-content/10 rounded-xl px-4 py-3 text-color-base-content focus:outline-none focus:border-color-primary/50 focus:ring-1 focus:ring-color-primary/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-white">{placeholder || (language === 'en' ? 'Select an option' : 'Selecciona una opción')}</option>
                  {(language === 'en' ? field.options_en : field.options_es)?.map((opt, i) => (
                    <option key={i} value={field.options_es?.[i] || opt} className="bg-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/40 pointer-events-none" />
              </div>
            ) : field.type === 'toggle' ? (
              <button
                type="button"
                onClick={() => handleChange(fieldName, values[fieldName] === 'true' ? 'false' : 'true')}
                className="flex items-center gap-3 w-fit group"
              >
                <div className={cn(
                  "relative w-11 h-6 rounded-full transition-colors duration-200 outline-none",
                  values[fieldName] === 'true' ? "bg-color-primary" : "bg-white/10"
                )}>
                  <div className={cn(
                    "absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    values[fieldName] === 'true' ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </button>
            ) : (
              <input
                type="text"
                value={values[fieldName] || ''}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                placeholder={placeholder || (language === 'en' ? 'E.g., Example text...' : 'Ej. Texto de ejemplo...')}
                required={field.required}
                className="w-full bg-white border border-color-base-content/10 rounded-xl px-4 py-3 text-color-base-content placeholder-color-base-content/30 focus:outline-none focus:border-color-primary/50 focus:ring-1 focus:ring-color-primary/50 transition-all shadow-sm"
              />
            )}
          </div>
        )
      })}

      {/* responseLanguage selection group */}
      <div className="flex flex-col gap-3 pt-4 border-t border-color-base-content/10">
        <label className="text-sm font-bold text-color-base-content">
          {language === 'en' ? 'Response Language' : 'Idioma de Respuesta'}
        </label>
        <div className="flex gap-3">
          {[
            { value: 'es', label: language === 'en' ? 'Spanish' : 'Español' },
            { value: 'en', label: language === 'en' ? 'English' : 'Inglés' }
          ].map((opt) => {
            const isSelected = (values['responseLanguage'] || language) === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('responseLanguage', opt.value)}
                className={cn(
                  "flex-1 flex items-center justify-center py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm",
                  isSelected
                    ? "border-color-primary bg-color-primary text-white shadow-md shadow-color-primary/20 scale-[1.02]"
                    : "border-color-base-content/10 bg-color-base-content/5 text-color-base-content/60 hover:bg-color-base-content/10 hover:border-color-base-content/20"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <GlowButton
        type="submit"
        disabled={isLoading}
        className="mt-6 py-4 text-base font-bold tracking-wide uppercase"
      >
        {isLoading 
          ? (language === 'en' ? 'Generating...' : 'Generando...') 
          : (language === 'en' ? 'Generate' : 'Generar')}
      </GlowButton>
    </form>
  )
}
