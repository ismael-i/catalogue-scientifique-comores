"use client"

import { LoadingProvider } from "@/components/LoadingProvider"
import { AuthProvider } from "@/hooks/useAuth"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider timeout={10000}>

    <AuthProvider>
      {children}
    </AuthProvider>
    </LoadingProvider>
  )
}