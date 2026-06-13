"use client"

import { useState, useEffect, useCallback } from "react"
import { chercheursApi, type ChercheurCard } from "@/lib/api/chercheurs"
import { institutionsApi } from "@/lib/api/institutions"
import { Search, Filter, LayoutGrid, List, Loader2 } from "lucide-react"

export default function ChercheursPage() {
  const [chercheurs, setChercheurs] = useState<ChercheurCard[]>([])
  const [institutions, setInstitutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtres
  const [search, setSearch] = useState("")
  const [institutionFilter, setInstitutionFilter] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })

  const fetchChercheurs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await chercheursApi.findAll({
        search: search || undefined,
        institution: institutionFilter || undefined,
        page,
        limit: 12,
      })

      setChercheurs(result.data)
      setPagination(result.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, institutionFilter, page])

  const fetchInstitutions = useCallback(async () => {
    try {
      const result = await institutionsApi.findAll({ limit: 50 })
      setInstitutions(result.data)
    } catch (err) {
      console.error("Erreur chargement institutions:", err)
    }
  }, [])

  useEffect(() => {
    fetchInstitutions()
  }, [fetchInstitutions])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchChercheurs()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [fetchChercheurs])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Chercheurs</h1>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <select
          value={institutionFilter}
          onChange={(e) => { setInstitutionFilter(e.target.value); setPage(1) }}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Toutes les institutions</option>
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.acronym} - {inst.name}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-lg border ${viewMode === "grid" ? "bg-blue-50 border-blue-300" : "border-gray-300"}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-3 rounded-lg border ${viewMode === "list" ? "bg-blue-50 border-blue-300" : "border-gray-300"}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button onClick={fetchChercheurs} className="ml-4 underline">Réessayer</button>
        </div>
      )}

      {/* Liste des chercheurs */}
      {!loading && !error && (
        <>
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {chercheurs.map((chercheur) => (
              <ChercheurCard key={chercheur.id} chercheur={chercheur} viewMode={viewMode} />
            ))}
          </div>

          {chercheurs.length === 0 && (
            <p className="text-center text-gray-500 py-16">Aucun chercheur trouvé</p>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Composant carte (à mettre dans un fichier séparé)
function ChercheurCard({ chercheur, viewMode }: { chercheur: ChercheurCard; viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <a href={`/chercheurs/${chercheur.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {chercheur.photoUrl ? (
              <img src={chercheur.photoUrl} alt={chercheur.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-lg">
                {chercheur.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{chercheur.name}</h3>
            <p className="text-sm text-gray-600">{chercheur.specialty}</p>
            <p className="text-xs text-gray-400">{chercheur.institutionName}{chercheur.laboratoireName ? ` — ${chercheur.laboratoireName}` : ""}</p>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a href={`/chercheurs/${chercheur.id}`} className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          {chercheur.photoUrl ? (
            <img src={chercheur.photoUrl} alt={chercheur.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <span className="text-blue-600 font-bold text-2xl">
              {chercheur.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{chercheur.name}</h3>
          <p className="text-sm text-gray-500">{chercheur.institutionName}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{chercheur.specialty}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        {chercheur.laboratoireName && <span>🏛️ {chercheur.laboratoireName}</span>}
        {chercheur.faculty && <span>📚 {chercheur.faculty}</span>}
      </div>
    </a>
  )
}