"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, type AuthResponse } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"

interface User {
  id: string
  email: string
  name: string
  role: "ADMIN" | "CHERCHEUR"
  status: string
  chercheurId?: string,
  institution?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string }) => Promise<{ message: string }>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialiser depuis le localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))

        //  Resynchroniser le cookie si absent
      if (!document.cookie.includes("auth_token")) {
        document.cookie = `auth_token=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Vérifier la validité du token au démarrage
  useEffect(() => {
    if (token) {
      authApi.getProfile(token)
        .then((profile) => {
          setUser(profile)
          localStorage.setItem(USER_KEY, JSON.stringify(profile))
        })
        .catch(() => {
          // Token invalide ou expiré
          logout()
        })
    }
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    
    setToken(response.token)
    setUser(response.user)
    
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))

    //  Stocker dans un cookie lisible par le middleware
    document.cookie = `auth_token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`

    // Redirection selon le rôle
    if (response.user.role === "ADMIN") {
      router.push("/admin/dashboard")
    } else {
      router.push("/dashboard")
    }
  }, [router])

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    return authApi.register(data)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    document.cookie = "auth_token=; path=/; max-age=0"
    router.push("/")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider")
  }
  return context
}