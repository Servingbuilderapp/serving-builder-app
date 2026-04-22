'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { Clock, MessageSquare, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppHistoryProps {
  appId: string
  onSelect: (executionId: string) => void
  currentExecutionId?: string | null
}

export function AppHistory({ appId, onSelect, currentExecutionId }: AppHistoryProps) {
  const { language } = useTranslation()
  const supabase = createClient()
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('app_executions')
        .select('*')
        .eq('app_id', appId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setHistory(data)
      }
      setIsLoading(false)
    }

    fetchHistory()

    const channel = supabase
      .channel(`history-${appId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'app_executions',
        filter: `app_id=eq.${appId}`
      }, () => {
        fetchHistory()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [appId, supabase])

  const getQuerySummary = (inputs: any) => {
    if (!inputs) return '...'
    const priorityKeys = ['topic', 'query', 'title', 'subject']
    for (const key of priorityKeys) {
      if (inputs[key]) return inputs[key]
    }
    
    let longest = ''
    for (const val of Object.values(inputs)) {
      if (typeof val === 'string' && val.length > longest.length) {
        longest = val
      }
    }
    return longest || (language === 'en' ? 'Empty petition' : 'Petición vacía')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
        <Clock className="h-8 w-8 text-white/20" />
        <p className="text-sm text-white/40">
          {language === 'en' ? 'No history yet' : 'Sin historial aún'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "flex items-start gap-3 w-full p-3 rounded-xl transition-all text-left border group",
            currentExecutionId === item.id 
              ? "bg-color-primary/10 border-color-primary/30" 
              : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
          )}
        >
          <div className={cn(
            "mt-1 p-1.5 rounded-lg shrink-0",
            currentExecutionId === item.id ? "bg-color-primary/20 text-color-primary" : "bg-white/5 text-white/40 group-hover:text-white/60"
          )}>
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium line-clamp-2 transition-colors",
              currentExecutionId === item.id ? "text-white" : "text-white/70 group-hover:text-white"
            )} title={getQuerySummary(item.inputs)}>
              {getQuerySummary(item.inputs)}
            </p>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">
              {new Date(item.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 self-center transition-all",
            currentExecutionId === item.id ? "text-color-primary translate-x-0" : "text-white/20 group-hover:translate-x-1"
          )} />
        </button>
      ))}
    </div>
  )
}
