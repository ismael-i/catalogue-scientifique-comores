"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { X, LayoutDashboard, Users, FlaskConical, BookOpen, Building2, Newspaper, Settings, HelpCircle, LogOut, UserRoundPlus } from "lucide-react"

type SidebarProps = { activeHref?: string; onClose?: () => void; mobile?: boolean }

export default function Sidebar({ activeHref, onClose, mobile }: SidebarProps) {
  const pathname = usePathname() || ""
  const NAV = [
    { label:"Tableau de bord", icon:<LayoutDashboard size={17} />, href:"/admin/dashboard" },
    { label:"Chercheurs",      icon:<Users size={17} />,           href:"/admin/chercheurs", badge:7 },
    { label:"Laboratoires",    icon:<FlaskConical size={17} />,    href:"/admin/laboratoires" },
    { label:"Publications",    icon:<BookOpen size={17} />,        href:"/admin/publications" },
    { label:"Institutions",    icon:<Building2 size={17} />,       href:"/admin/institutions" },
    { label:"Fil info",        icon:<Newspaper size={17} />,       href:"/admin/fil-info" },
    { label:"Demandes",        icon:<UserRoundPlus size={17} />,       href:"/admin/demandes" },
  ]


  const NAV_BOTTOM = [
    { label:"Paramètres", icon:<Settings size={17} />, href:"/admin/settings" },
    { label:"Aide & FAQ", icon:<HelpCircle size={17} />,href:"/admin/aide" },
  ]

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-100 ${mobile ? "w-64" : "w-[220px]"}`}>

      <div className="px-5 pt-6 pb-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-200">
            <span className="text-white text-xs font-extrabold tracking-tight">CS</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Catalogue</p>
            <p className="text-[11px] text-teal-500 font-semibold leading-none mt-0.5">Scientifique</p>
          </div>
        </div>
        {mobile && <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={17} /></button>}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-5 pb-2 space-y-0.5">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.12em] px-3 mb-2">Menu principal</p>
        {NAV.map((item) => {
          const active = (activeHref ? activeHref === item.href : pathname === item.href || pathname.startsWith(item.href + "/"))
          return (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group
                ${active ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
            >
              {active && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-100" />
              )}
              <span className={active ? "text-white/90" : "text-gray-400 group-hover:text-gray-600"}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && !active && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
              {item.badge && active && (
                <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
            </a>
          )
        })}

        <div className="pt-4">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.12em] px-3 mb-2">Autre</p>
          {NAV_BOTTOM.map((item) => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all group"
            >
              <span className="text-gray-300 group-hover:text-gray-500">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 cursor-pointer transition-all group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">Administrateur</p>
            <p className="text-[10px] text-gray-400 truncate">admin@catalogue-scientifique.km</p>
          </div>
          <LogOut size={14} className="text-gray-300 group-hover:text-red-400 transition-colors flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
