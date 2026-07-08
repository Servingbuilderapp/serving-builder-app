'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useTranslation()

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => setLanguage('es')}
        className={cn(
          "text-sm font-medium transition-colors hover:text-color-primary",
          language === 'es' ? "text-color-primary font-black" : "text-color-base-content/50"
        )}
      >
        ES
      </button>
      <span className="text-color-base-content/20">/</span>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "text-sm font-medium transition-colors hover:text-color-primary",
          language === 'en' ? "text-color-primary font-black" : "text-color-base-content/50"
        )}
      >
        EN
      </button>
    </div>
  )
}
