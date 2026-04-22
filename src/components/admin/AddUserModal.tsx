'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { X, Zap, RefreshCw, Loader2, Key } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'

const FIRST_NAMES = ['Carlos', 'Ana', 'Luis', 'María', 'Pedro', 'Sofía', 'Jorge', 'Laura', 'Andrés', 'Valentina']
const LAST_NAMES = ['García', 'López', 'Martínez', 'Rodríguez', 'Hernández', 'Pérez', 'González', 'Sánchez', 'Torres', 'Ramírez']

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  plans: any[]
}

export function AddUserModal({ isOpen, onClose, plans }: AddUserModalProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [planId, setPlanId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [planCycleIndex, setPlanCycleIndex] = useState(0)

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleQuickGenerate = () => {
    const randomFirst = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
    const randomLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    const randomId = Math.random().toString(36).substring(2, 7)
    
    setFirstName(randomFirst)
    setLastName(randomLast)
    setEmail(`demo_${randomId}@gmail.com`)
    setPassword(generatePassword())
    
    // Ciclo de planes
    if (plans.length > 0) {
      const selectedPlan = plans[planCycleIndex % plans.length]
      setPlanId(selectedPlan.id)
      setPlanCycleIndex(prev => prev + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, planId })
      })

      const data = await response.json()

      if (response.ok) {
        toast({ 
          title: language === 'en' 
            ? `User created! Email: ${email} Password: ${password}` 
            : `¡Usuario creado! Email: ${email} Contraseña: ${password}`, 
          type: 'success' 
        })
        onClose()
        router.refresh()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: error.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-color-base-200 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-bold text-white">
            {language === 'en' ? 'Add New User' : 'Agregar Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <button 
            type="button"
            onClick={handleQuickGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-primary to-accent-pink text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Zap className="h-4 w-4 fill-white" />
            {language === 'en' ? '⚡ Quick Generate Demo User' : '⚡ Generar Usuario Demo'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-color-base-200 px-3 text-white/20">{language === 'en' ? 'Or Manual Entry' : 'O Entrada Manual'}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{language === 'en' ? 'First Name' : 'Nombre'}</label>
                <input 
                  required
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{language === 'en' ? 'Last Name' : 'Apellido'}</label>
                <input 
                  required
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-primary/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{language === 'en' ? 'Password' : 'Contraseña'}</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-primary/50 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{language === 'en' ? 'Initial Plan' : 'Plan Inicial'}</label>
              <select 
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-primary/50"
              >
                <option value="" className="bg-color-base-300">{language === 'en' ? 'No Plan' : 'Sin Plan'}</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id} className="bg-color-base-300">
                    {language === 'en' ? plan.name_en : plan.name_es}
                  </option>
                ))}
              </select>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full mt-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              {language === 'en' ? 'Create User' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
