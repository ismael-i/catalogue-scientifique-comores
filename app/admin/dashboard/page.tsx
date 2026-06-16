"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { adminApi } from "@/lib/api/admin"
import { Users, Building2, FlaskConical, FileText, Newspaper, Clock, Loader2, Sparkles } from "lucide-react"

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
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-6 space-y-6">
         {/* ── Hero card (FinPay-style) ── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 p-6 shadow-xl shadow-blue-200">
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute top-8 -right-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 left-32 w-32 h-32 rounded-full bg-teal-400/20" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span className="text-xs text-blue-100 font-semibold uppercase tracking-widest">Vue globale</span>
                </div>
                <p className="text-white/70 text-xs mb-1">Total chercheurs référencés</p>
                <p className="text-white text-4xl font-extrabold tracking-tight leading-none">{stats.totals.chercheurs}</p>
              </div>

              <div className="flex gap-4 sm:gap-6 flex-wrap">
                {[
                  { label:"Institutions", val:stats.totals.institutions},
                  { label:"Laboratoires", val:stats.totals.laboratoires },
                  { label:"En attente", val:stats.totals.pendingRegistrations },
                ].map((it) => (
                  <div key={it.label} className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[80px]">
                    <p className="text-white text-2xl font-extrabold leading-none">{it.val}</p>
                    <p className="text-blue-100 text-[10px] mt-1 font-medium">{it.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

      {/* Cartes stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${card.color} `} />
            <div className="p-5">
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