'use client'

import React, { createContext, useState, useEffect, useTransition } from 'react'

export type Language = 'es' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with the server-safe default
  const [language, setLanguageState] = useState<Language>('es')
  const [, startTransition] = useTransition()

  // Sync from localStorage AFTER hydration
  useEffect(() => {
    const stored = localStorage.getItem('language') as Language
    if (stored === 'en' || stored === 'es') {
      startTransition(() => {
        setLanguageState(stored)
      })
    }
  }, [])

  const setLanguage = (lang: Language) => {
    startTransition(() => {
      setLanguageState(lang)
    })
    localStorage.setItem('language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
