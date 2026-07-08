'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  CreditCard, Plus, Trash2, Edit3, Save, 
  X, Check, LayoutGrid, Users, DollarSign,
  ListPlus, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'

interface PlansManagementProps {
  initialPlans: any[]
  allApps: any[]
}

export function PlansManagement({ initialPlans, allApps }: PlansManagementProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)

  const handleStartEdit = (plan: any) => {
    setEditingId(plan.id)
    setEditForm({ ...plan })
  }

  const handleToggleApp = async (planId: string, appId: string, isCurrentlyIncluded: boolean) => {
    try {
      if (isCurrentlyIncluded) {
        await supabase
          .from('plan_apps')
          .delete()
          .eq('plan_id', planId)
          .eq('app_id', appId)
      } else {
        await supabase
          .from('plan_apps')
          .insert({ plan_id: planId, app_id: appId })
      }
      router.refresh()
    } catch (error) {
      toast({ title: 'Error updating app assignment', type: 'error' })
    }
  }

  const handleSavePlan = async () => {
    try {
      if (editingId === 'new') {
        const { error } = await supabase
          .from('plans')
          .insert({
            name_en: editForm.name_en,
            name_es: editForm.name_es,
            slug: editForm.slug || editForm.name_en.toLowerCase().replace(/\s+/g, '-'),
            price_monthly: editForm.price_monthly,
            items_en: editForm.items_en,
            items_es: editForm.items_es,
            is_active: true,
            sort_order: editForm.sort_order
          })

        if (error) throw error
        toast({ title: language === 'en' ? 'Plan created' : 'Plan creado', type: 'success' })
      } else {
        const { error } = await supabase
          .from('plans')
          .update({
            name_en: editForm.name_en,
            name_es: editForm.name_es,
            price_monthly: editForm.price_monthly,
            items_en: editForm.items_en,
            items_es: editForm.items_es,
            sort_order: editForm.sort_order
          })
          .eq('id', editingId)

        if (error) throw error
        toast({ title: language === 'en' ? 'Plan updated' : 'Plan actualizado', type: 'success' })
      }
      
      setEditingId(null)
      setIsCreating(false)
      router.refresh()
    } catch (error: any) {
      toast({ title: error.message, type: 'error' })
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this plan?' : '¿Estás seguro de que quieres eliminar este plan?')) return

    try {
      const { error } = await supabase.from('plans').delete().eq('id', id)
      if (error) throw error
      toast({ title: language === 'en' ? 'Plan deleted' : 'Plan eliminado', type: 'success' })
      router.refresh()
    } catch (error: any) {
      toast({ title: error.message, type: 'error' })
    }
  }

  const handleAddItem = (lang: 'en' | 'es') => {
    const key = lang === 'en' ? 'items_en' : 'items_es'
    setEditForm({
      ...editForm,
      [key]: [...(editForm[key] || []), '']
    })
  }

  const handleUpdateItem = (lang: 'en' | 'es', index: number, value: string) => {
    const key = lang === 'en' ? 'items_en' : 'items_es'
    const newItems = [...editForm[key]]
    newItems[index] = value
    setEditForm({ ...editForm, [key]: newItems })
  }

  const handleDeleteItem = (lang: 'en' | 'es', index: number) => {
    const key = lang === 'en' ? 'items_en' : 'items_es'
    const newItems = editForm[key].filter((_: any, i: number) => i !== index)
    setEditForm({ ...editForm, [key]: newItems })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-color-base-content tracking-tight">Gestión de Planes</h1>
          <p className="text-color-base-content/60 text-sm max-w-3xl">
            <strong>¿Qué es y para qué sirve?</strong> Desde aquí puedes crear o modificar los planes de suscripción de tu plataforma. Puedes decidir qué micro-apps incluye cada plan marcándolas o desmarcándolas. También puedes ajustar el precio y los textos descriptivos que verán tus usuarios en la página principal.
          </p>
        </div>
        <button 
          onClick={() => {
            setIsCreating(true);
            setEditForm({
              name_en: '',
              name_es: '',
              slug: '',
              price_monthly: 0,
              items_en: [],
              items_es: [],
              is_active: true,
              sort_order: (initialPlans.length + 1) * 10
            });
            setEditingId('new');
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-color-base-content px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          {language === 'en' ? 'Add New Plan' : 'Nuevo Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Render New Plan Card if creating */}
        {isCreating && (
          <div className="bg-color-base-content/5 border-2 border-primary rounded-3xl overflow-hidden ring-2 ring-primary/20 shadow-2xl scale-[1.02] flex flex-col h-full animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-color-base-content/5 bg-color-base-content/2">
              <div className="flex items-center justify-between mb-4">
                <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/30">
                  {language === 'en' ? 'NEW PLAN' : 'NUEVO PLAN'}
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={editForm.name_es}
                    onChange={(e) => setEditForm({...editForm, name_es: e.target.value})}
                    className="bg-color-base-content/5 border border-color-base-content/10 rounded-lg px-3 py-1.5 text-sm text-color-base-content"
                    placeholder="Nombre (ES)"
                  />
                  <input 
                    type="text" 
                    value={editForm.name_en}
                    onChange={(e) => setEditForm({...editForm, name_en: e.target.value})}
                    className="bg-color-base-content/5 border border-color-base-content/10 rounded-lg px-3 py-1.5 text-sm text-color-base-content"
                    placeholder="Nombre (EN)"
                  />
                </div>
                <input 
                  type="text" 
                  value={editForm.slug}
                  onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                  className="w-full bg-color-base-content/5 border border-color-base-content/10 rounded-lg px-3 py-1.5 text-xs text-color-base-content/50"
                  placeholder="slug-del-plan"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/40" />
                    <input 
                      type="number" 
                      value={editForm.price_monthly}
                      onChange={(e) => setEditForm({...editForm, price_monthly: parseFloat(e.target.value)})}
                      className="w-full bg-color-base-content/5 border border-color-base-content/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-color-base-content font-bold"
                      placeholder="Precio"
                    />
                  </div>
                  <div className="relative">
                    <ListPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/40" />
                    <input 
                      type="number" 
                      value={editForm.sort_order}
                      onChange={(e) => setEditForm({...editForm, sort_order: parseInt(e.target.value)})}
                      className="w-full bg-color-base-content/5 border border-color-base-content/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-color-base-content"
                      placeholder="Orden"
                      title="Orden de aparición"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-color-base-content/40 uppercase tracking-widest flex items-center gap-2">
                  <ListPlus className="h-3 w-3" />
                  {language === 'en' ? 'Features' : 'Características'}
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-color-base-content/20">ESPAÑOL</span>
                    {editForm.items_es.map((item: string, i: number) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleUpdateItem('es', i, e.target.value)}
                          className="flex-1 bg-color-base-content/5 border border-color-base-content/10 rounded-lg px-3 py-1.5 text-xs text-color-base-content"
                        />
                        <button onClick={() => handleDeleteItem('es', i)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => handleAddItem('es')} className="text-[10px] text-primary hover:underline">+ {language === 'en' ? 'Add Item' : 'Añadir Item'}</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-color-base-content/5 bg-color-base-content/2 flex gap-2">
              <button 
                onClick={handleSavePlan}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-color-base-content text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Save className="h-4 w-4" />
                {language === 'en' ? 'Create' : 'Crear'}
              </button>
              <button 
                onClick={() => { setIsCreating(false); setEditingId(null); }}
                className="p-2.5 bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/40 hover:text-color-base-content rounded-xl transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {initialPlans.map((plan) => {
          const isEditing = editingId === plan.id
          const userCount = plan.users?.[0]?.count || 0
          const planAppIds = plan.plan_apps?.map((pa: any) => pa.app_id) || []

          return (
            <div key={plan.id} className={cn(
              "bg-color-base-content/5 border border-color-base-content/10 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col h-full",
              isEditing && "ring-2 ring-primary border-transparent shadow-2xl scale-[1.02]"
            )}>
              {/* Header */}
              <div className="p-6 border-b border-color-base-content/5 bg-color-base-content/2">
                <div className="flex items-center justify-between mb-4">
                  <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/30">
                    {plan.slug}
                  </div>
                  <div className="flex items-center gap-2 text-color-base-content/40 text-xs">
                    <Users className="h-4 w-4" />
                    {userCount} {language === 'en' ? 'Users' : 'Usuarios'}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={editForm.name_es}
                        onChange={(e) => setEditForm({...editForm, name_es: e.target.value})}
                        className="bg-color-base-content/5 border border-color-base-content/10 rounded-lg px-3 py-1.5 text-sm text-color-base-content"
                        placeholder="Nombre (ES)"
                      />
                      <input 
                        type="text" 
                        value={editForm.name_en}
                        onChange={(e) => setEditForm({...editForm, name_en: e.target.value})}
                        className="bg-color-base-content/5 border border-color-base-content/10 rounded-lg px-3 py-1.5 text-sm text-color-base-content"
                        placeholder="Nombre (EN)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/40" />
                        <input 
                          type="number" 
                          value={editForm.price_monthly}
                          onChange={(e) => setEditForm({...editForm, price_monthly: parseFloat(e.target.value)})}
                          className="w-full bg-color-base-content/5 border border-color-base-content/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-color-base-content font-bold"
                          placeholder="Precio"
                        />
                      </div>
                      <div className="relative">
                        <ListPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/40" />
                        <input 
                          type="number" 
                          value={editForm.sort_order}
                          onChange={(e) => setEditForm({...editForm, sort_order: parseInt(e.target.value)})}
                          className="w-full bg-color-base-content/5 border border-color-base-content/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-color-base-content"
                          placeholder="Orden"
                          title="Orden de aparición"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-color-base-content mb-1">
                      {language === 'en' ? plan.name_en : plan.name_es}
                    </h3>
                    <div className="text-2xl font-black text-color-base-content">
                      ${plan.price_monthly}<span className="text-xs text-color-base-content/40 font-normal">/mo</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Items / Features */}
              <div className="flex-1 p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-color-base-content/40 uppercase tracking-widest flex items-center gap-2">
                    <ListPlus className="h-3 w-3" />
                    {language === 'en' ? 'Features' : 'Características'}
                  </h4>
                  
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] text-color-base-content/20">ESPAÑOL</span>
                        {editForm.items_es.map((item: string, i: number) => (
                          <div key={i} className="flex gap-2">
                            <input 
                              type="text" 
                              value={item}
                              onChange={(e) => handleUpdateItem('es', i, e.target.value)}
                              className="flex-1 bg-color-base-content/5 border border-color-base-content/10 rounded-lg px-3 py-1.5 text-xs text-color-base-content"
                            />
                            <button onClick={() => handleDeleteItem('es', i)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><X className="h-4 w-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => handleAddItem('es')} className="text-[10px] text-primary hover:underline">+ {language === 'en' ? 'Add Item' : 'Añadir Item'}</button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {(language === 'en' ? plan.items_en : plan.items_es).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-color-base-content/70">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Apps included */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-color-base-content/40 uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid className="h-3 w-3" />
                    {language === 'en' ? 'Included Apps' : 'Apps Incluidas'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allApps.map(app => {
                      const isIncluded = planAppIds.includes(app.id)
                      return (
                        <button
                          key={app.id}
                          onClick={() => handleToggleApp(plan.id, app.id, isIncluded)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                            isIncluded 
                              ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(124,58,237,0.2)]" 
                              : "bg-color-base-content/5 text-color-base-content/20 border-color-base-content/5 hover:bg-color-base-content/10"
                          )}
                        >
                          {language === 'en' ? app.name_en : app.name_es}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-color-base-content/5 bg-color-base-content/2 flex gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSavePlan}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-color-base-content text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-color-base-content/90 transition-all"
                    >
                      <Save className="h-4 w-4" />
                      {language === 'en' ? 'Save' : 'Guardar'}
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="p-2.5 bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/40 hover:text-color-base-content rounded-xl transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleStartEdit(plan)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/40 hover:text-color-base-content hover:bg-color-base-content/10 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                      <Edit3 className="h-4 w-4" />
                      {language === 'en' ? 'Edit Plan' : 'Editar Plan'}
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={userCount > 0}
                      className="p-2.5 bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:text-color-base-content/20 disabled:hover:bg-color-base-content/5"
                      title={userCount > 0 ? (language === 'en' ? 'Cannot delete - users exist' : 'No se puede borrar - hay usuarios') : ''}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
