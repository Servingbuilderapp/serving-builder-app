'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error'

export interface ToastMessage {
  title: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: ToastMessage) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastMessage & { id: number })[]>([])

  const toast = useCallback((message: ToastMessage) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { ...message, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-xl border",
              "animate-in slide-in-from-bottom-5 fade-in duration-300",
              t.type === 'success' ? "bg-green-950/70 border-green-900/50 text-green-100" : "bg-red-950/70 border-red-900/50 text-red-100"
            )}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            <p className="text-sm font-medium">{t.title}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
