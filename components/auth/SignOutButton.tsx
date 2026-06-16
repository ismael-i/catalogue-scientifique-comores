"use client"

import React from "react"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function SignOutButton({ onClick }: { onClick?: () => void }) {
   const { logout } = useAuth()
  return (
    <button onClick={logout}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
    >
      <LogOut size={14} />
      Se déconnecter
    </button>
  )
}
