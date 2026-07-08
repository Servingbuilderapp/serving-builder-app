'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Search, User as UserIcon, Shield, ChevronLeft, ChevronRight, Eye, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { AddUserModal } from './AddUserModal'

interface UserRow {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  created_at: string
  plans?: {
    name_en: string
    name_es: string
    slug: string
  } | null
}

interface UsersTableProps {
  initialUsers: any[]
  plans: any[]
}

export function UsersTable({ initialUsers, plans }: UsersTableProps) {
  const { language } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const itemsPerPage = 10

  // Filtrado local
  const filteredUsers = initialUsers.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const email = user.email.toLowerCase()
    const search = searchTerm.toLowerCase()
    return fullName.includes(search) || email.includes(search)
  })

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return language === 'en' ? 'Today' : 'Hoy'
    if (diffDays === 1) return language === 'en' ? 'Yesterday' : 'Ayer'
    return language === 'en' ? `${diffDays} days ago` : `hace ${diffDays} días`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/30" />
          <input 
            type="text"
            placeholder={language === 'en' ? "Search users..." : "Buscar usuarios..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-[#0f1629] border border-color-base-content/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-color-base-content placeholder:text-color-base-content/20 focus:outline-hidden focus:border-color-primary/50 transition-all shadow-inner"
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-color-primary to-color-accent-pink hover:scale-105 text-color-base-content px-5 py-3 rounded-xl text-sm font-black transition-all shadow-[0_0_25px_rgba(249,115,22,0.4)] uppercase tracking-widest"
        >
          <UserPlus className="h-4 w-4" />
          {language === 'en' ? 'Add User' : 'Agregar Usuario'}
        </button>
      </div>

      <div className="bg-[#111d35] border border-color-base-content/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#1a233a]">
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">
                  {language === 'en' ? 'User' : 'Usuario'}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">
                  {language === 'en' ? 'Role' : 'Rol'}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">
                  {language === 'en' ? 'Plan' : 'Plan'}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">
                  {language === 'en' ? 'Joined' : 'Registro'}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest text-right">
                  {language === 'en' ? 'Actions' : 'Acciones'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-color-base-content/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-color-primary/20 to-color-accent-pink/20 border border-color-base-content/10 flex items-center justify-center text-color-primary font-black shadow-lg overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.first_name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{user.first_name[0]}{user.last_name[0]}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-color-base-content group-hover:text-primary transition-colors">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-xs text-color-base-content/40">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      user.role === 'admin' 
                        ? "bg-primary/20 text-primary border border-primary/30" 
                        : "bg-color-base-content/5 text-color-base-content/40 border border-color-base-content/10"
                    )}>
                      {user.role === 'admin' && <Shield className="h-3 w-3" />}
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.plans ? (
                      <span className="text-sm text-color-base-content/80">
                        {language === 'en' ? user.plans.name_en : user.plans.name_es}
                      </span>
                    ) : (
                      <span className="text-sm text-color-base-content/20 italic">
                        {language === 'en' ? 'No Plan' : 'Sin Plan'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-color-base-content/40">
                    {formatRelativeDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${user.id}`}>
                      <button className="p-2 rounded-lg bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/40 hover:text-color-base-content hover:bg-primary transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-color-base-content/10 flex items-center justify-between">
            <span className="text-xs text-color-base-content/40">
              {language === 'en' 
                ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredUsers.length)} of ${filteredUsers.length} users` 
                : `Mostrando ${(currentPage - 1) * itemsPerPage + 1} a ${Math.min(currentPage * itemsPerPage, filteredUsers.length)} de ${filteredUsers.length} usuarios`}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/40 hover:text-color-base-content disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/40 hover:text-color-base-content disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        plans={plans}
      />
    </div>
  )
}
