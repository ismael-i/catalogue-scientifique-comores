"use client"

import React, { useState } from "react"
import Sidebar from "../../components/admin/Sidebar"
import SignOutButton from "../../components/auth/SignOutButton"
import { Menu, X } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar activeHref="/admin/dashboard" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10"><Sidebar activeHref="/admin/dashboard" mobile onClose={() => setSidebarOpen(false)} /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur border-b border-gray-100 px-5 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-base font-extrabold text-gray-900 leading-none tracking-tight">Espace Admin</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">Gestion du catalogue</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
