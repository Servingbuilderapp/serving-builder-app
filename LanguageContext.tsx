'use client'

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react'

// Los 9 idiomas confirmados hoy. Para agregar uno nuevo más adelante, solo hay que
// sumarlo aquí (en este arreglo) y crear su archivo JSON correspondiente en /locales.
export const IDIOMAS_DISPONIBLES = [
  { codigo: 'es', nombre: 'Español' },
  { codigo: 'en', nombre: 'English' },
  { codigo: 'zh', nombre: '中文' },
  { codigo: 'ko', nombre: '한국어' },
  { codigo: 'pt', nombre: 'Português' },
  { codigo: 'it', nombre: 'Italiano' },
  { codigo: 'fr', nombre: 'Français' },
  { codigo: 'de', nombre: 'Deutsch' },
  { codigo: 'ru', nombre: 'Русский' },
] as const

export type Language = (typeof IDIOMAS_DISPONIBLES)[number]['codigo']

// Diccionarios de traducción. Empiezan con solo español lleno; los demás se
// van llenando con IA más adelante. Si un idioma no tiene una clave todavía,
// el sistema automáticamente muestra el texto en español como respaldo,
// para que nunca se vea una pantalla vacía o rota.
import es from '@/locales/es.json'
import en from '@/locales/en.json'
import zh from '@/locales/zh.json'
import ko from '@/locales/ko.json'
import pt from '@/locales/pt.json'
import it from '@/locales/it.json'
import fr from '@/locales/fr.json'
import de from '@/locales/de.json'
import ru from '@/locales/ru.json'

const DICCIONARIOS: Record<Language, Record<string, string>> = {
  es,
  en,
  zh,
  ko,
  pt,
  it,
  fr,
  de,
  ru,
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (clave: string) => string
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: (clave: string) => clave,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Siempre inicia en español (seguro para el servidor), y después de cargar
  // la página revisa si el visitante ya había elegido otro idioma antes.
  const [language, setLanguageState] = useState<Language>('es')
  const [, startTransition] = useTransition()

  useEffect(() => {
    const guardado = localStorage.getItem('language') as Language | null
    if (guardado && IDIOMAS_DISPONIBLES.some((idioma) => idioma.codigo === guardado)) {
      startTransition(() => {
        setLanguageState(guardado)
      })
    }
  }, [])

  const setLanguage = (lang: Language) => {
    startTransition(() => {
      setLanguageState(lang)
    })
    localStorage.setItem('language', lang)
  }

  const t = (clave: string): string => {
    const diccionarioActual = DICCIONARIOS[language] || {}
    return diccionarioActual[clave] || DICCIONARIOS.es[clave] || clave
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Forma sencilla de usar el idioma y la traducción en cualquier componente:
// const { t, language, setLanguage } = useLanguage()
export function useLanguage() {
  return useContext(LanguageContext)
}
