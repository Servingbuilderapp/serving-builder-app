'use client'

import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export interface AutofillPreset {
  id?: string
  label_es: string
  label_en: string
  values: Record<string, string>
}

interface AutofillBadgesProps {
  presets: AutofillPreset[]
  onSelect: (values: Record<string, string>, id: string) => void
  activePresetId?: string
}

export function AutofillBadges({ presets, onSelect, activePresetId }: AutofillBadgesProps) {
  const { language } = useTranslation()

  if (!presets || presets.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {presets.map((preset, idx) => {
        const id = preset.id || `preset-${idx}`
        const label = language === 'en' ? preset.label_en : preset.label_es
        const isActive = activePresetId === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(preset.values, id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border relative overflow-hidden group",
              isActive 
                ? "bg-color-primary/20 border-color-primary text-color-base-content shadow-[0_0_10px_rgba(124,58,237,0.3)]" 
                : "bg-color-base-content/ border-color-base-content/ text-color-base-content/ hover:bg-color-base-content/ hover:border-color-base-content/ hover:text-color-base-content"
            )}
          >
            {label}
            <div className="absolute inset-0 bg-color-base-content/ scale-0 group-active:scale-150 transition-transform duration-500 rounded-full pointer-events-none" />
          </button>
        )
      })}
    </div>
  )
}
