"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { adminApi } from "@/lib/api/admin"
import { Users, Building2, FlaskConical, FileText, Newspaper, Clock, Loader2 } from "lucide-react"

interface DashboardStats {
  totals: {
    chercheurs: number
    laboratoires: number
    institutions: number
    publications: number
    articles: number
    pendingRegistrations: number
  }
  usersByRole: { role: string; count: number }[]
  labosByCategory: { category: string; count: number }[]
  pubsByDomain: { domain: string; count: number }[]
}

export default function AdminDashboard() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchStats() {
      if (!token) return
      try {
        const data = await adminApi.getStats(token)
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchStats()
  }, [token])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    { label: "Chercheurs", value: stats.totals.chercheurs, icon: Users, color: "bg-blue-500", href: "/admin/chercheurs" },
    { label: "Laboratoires", value: stats.totals.laboratoires, icon: FlaskConical, color: "bg-green-500", href: "/admin/laboratoires" },
    { label: "Institutions", value: stats.totals.institutions, icon: Building2, color: "bg-purple-500", href: "/admin/institutions" },
    { label: "Publications", value: stats.totals.publications, icon: FileText, color: "bg-orange-500", href: "/admin/publications" },
    { label: "Articles", value: stats.totals.articles, icon: Newspaper, color: "bg-pink-500", href: "/admin/articles" },
    { 
      label: "En attente", 
      value: stats.totals.pendingRegistrations, 
      icon: Clock, 
      color: stats.totals.pendingRegistrations > 0 ? "bg-red-500" : "bg-gray-400",
      href: "/admin/demandes",
      badge: stats.totals.pendingRegistrations > 0 ? stats.totals.pendingRegistrations : undefined
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Cartes stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${card.color}`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value}
                  {card.badge && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      {card.badge}
                    </span>
                  )}
                </p>
              </div>
              <card.icon className="w-10 h-10 text-gray-300" />
            </div>
          </a>
        ))}
      </div>

      {/* Répartition labos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Laboratoires par catégorie</h2>
          <div className="space-y-3">
            {stats.labosByCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-gray-600">{item.category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(item.count / stats.totals.laboratoires) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Publications par domaine</h2>
          <div className="space-y-3">
            {stats.pubsByDomain.map((item) => (
              <div key={item.domain} className="flex items-center justify-between">
                <span className="text-gray-600">{item.domain}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(item.count / stats.totals.publications) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}