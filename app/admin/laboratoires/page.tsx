"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { laboratoiresApi, type LaboratoireCard } from "@/lib/api/laboratoires"
import { institutionsApi } from "@/lib/api/institutions"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
import Link from "next/link"
import {
  Search,
  Plus,
  Filter,
  X,
  Building2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  FlaskConical,
  Users,
  ChevronRight
} from "lucide-react"

// ─── Configuration des badges par catégorie ────────────
type LabCategorie = "Sciences" | "Environnement" | "Santé" | "Économie" | "Lettres"

const BADGE_COLORS: Record<LabCategorie, string> = {
  Sciences:      "bg-blue-50 text-blue-600 border-blue-100",
  Environnement: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Santé:         "bg-rose-50 text-rose-600 border-rose-100",
  Économie:      "bg-amber-50 text-amber-600 border-amber-100",
  Lettres:       "bg-violet-50 text-violet-600 border-violet-100",
}

const CATEGORIES: LabCategorie[] = ["Sciences", "Environnement", "Santé", "Économie", "Lettres"]

// ─── Types pour les filtres ──────────────────────────────
interface FilterOption {
  id: string
  acronym?: string
  name?: string
  label?: string
}

// ─── Page Principale ─────────────────────────────────────
export default function AdminLaboratoiresPage() {
  const { token, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // États
  const [laboratoires, setLaboratoires] = useState<LaboratoireCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [institutionFilter, setInstitutionFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Données pour les sélecteurs
  const [institutions, setInstitutions] = useState<FilterOption[]>([])

  // Pagination
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, limit: 12 })

  // Modal suppression
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean
    labo: LaboratoireCard | null
    loading: boolean
  }>({ show: false, labo: null, loading: false })

  // ─── Vérification auth ──────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/laboratoires")
    }
  }, [user, authLoading, router])

  // ─── Charger institutions pour le filtre ────────────────
  useEffect(() => {
    async function loadInstitutions() {
      try {
        const data = await institutionsApi.findAllSimple()
        setInstitutions(data.data || data || [])
      } catch (err) {
        console.error("Erreur chargement institutions:", err)
      }
    }
    loadInstitutions()
  }, [])

  // ─── Charger laboratoires ───────────────────────────────
  const fetchLaboratoires = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const result = await laboratoiresApi.findAll({
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        institution: institutionFilter || undefined,
        page,
        limit: pagination.limit
      })

      setLaboratoires(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [token, searchQuery, categoryFilter, institutionFilter, page])

  useEffect(() => {
    if (token) fetchLaboratoires()
  }, [fetchLaboratoires, token])

  // ─── Suppression ────────────────────────────────────────
  async function handleDelete() {
    if (!deleteModal.labo || !token) return

    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      await laboratoiresApi.delete(deleteModal.labo.id, token)
      setLaboratoires(prev => prev.filter(l => l.id !== deleteModal.labo!.id))
      setDeleteModal({ show: false, labo: null, loading: false })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  // ─── Réinitialiser filtres ──────────────────────────────
  function resetFilters() {
    setSearchQuery("")
    setCategoryFilter("")
    setInstitutionFilter("")
    setPage(1)
  }

  const hasActiveFilters = searchQuery || categoryFilter || institutionFilter

  // ─── Filtrage local pour la recherche instantanée ────────
  const filteredLaboratoires = useMemo(() => {
    if (!searchQuery.trim()) return laboratoires

    const query = searchQuery.toLowerCase()
    return laboratoires.filter(labo =>
      labo.name.toLowerCase().includes(query) ||
      labo.acronym.toLowerCase().includes(query) ||
      labo.description?.toLowerCase().includes(query) ||
      labo.institution?.acronym?.toLowerCase().includes(query)
    )
  }, [laboratoires, searchQuery])

  // ─── Loading ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // ─── Rendu ───────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratoires</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les laboratoires de recherche
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              showFilters || hasActiveFilters
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Actualiser */}
          <button
            onClick={fetchLaboratoires}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Ajouter */}
          <Link
            href="/admin/laboratoires/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, acronyme, description..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6 animate-in slide-in-from-top-2 duration-200">
          {/* Filtre par catégorie */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 uppercase font-semibold">Catégorie</span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCategoryFilter("")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !categoryFilter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                Toutes
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? "" : cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    categoryFilter === cat
                      ? `${BADGE_COLORS[cat]} shadow-sm`
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div className="w-px h-6 bg-gray-200 hidden sm:block" />

          {/* Filtre par institution */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <select
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
            >
              <option value="">Toutes les institutions</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.acronym || inst.label} — {inst.name || inst.label}
                </option>
              ))}
            </select>
          </div>

          {/* Réinitialiser */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <button onClick={fetchLaboratoires} className="text-xs underline mt-1 hover:text-red-800">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Compteur */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {pagination.total} laboratoire{pagination.total > 1 ? "s" : ""}
          {hasActiveFilters && " • Filtres actifs"}
        </p>
        {hasActiveFilters && (
          <span className="text-xs text-blue-500">
            {filteredLaboratoires.length} résultat{filteredLaboratoires.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredLaboratoires.length === 0 ? (
        /* État vide */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <FlaskConical className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">
            {hasActiveFilters
              ? "Aucun laboratoire ne correspond aux filtres"
              : "Aucun laboratoire enregistré"}
          </p>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
              Réinitialiser les filtres
            </button>
          )}
          {!hasActiveFilters && (
            <Link
              href="/admin/laboratoires/nouveau"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Ajouter un laboratoire
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Grille de cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filteredLaboratoires.map((labo) => (
              <div key={labo.id} className="group relative">
                {/* Carte */}
                <Link href={`/admin/laboratoires/${labo.id}`}>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                    
                    {/* En-tête : Logo + Acronyme + Catégorie */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-500">
                        {labo.logo ? (
                          <img
                            src={getFileUrl(labo.logo)}
                            alt={labo.acronym}
                            className="w-8 h-8 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <FlaskConical className="w-4 h-4 text-blue-500" strokeWidth={1.8} />
                          </div>
                        )}
                        <span className="text-xs font-bold tracking-wide uppercase text-gray-700">
                          {labo.acronym}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${BADGE_COLORS[labo.categorie as LabCategorie] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {labo.categorie}
                      </span>
                    </div>

                    {/* Nom */}
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                      {labo.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
                      {labo.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                          {labo.researchers} chercheur{labo.researchers > 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                          <Building2 className="w-3 h-3 flex-shrink-0" />
                          {labo.institution?.acronym || "—"}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </Link>

                {/* Actions rapides (hover) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Link
                    href={`/admin/laboratoires/${labo.id}/modifier`}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-colors"
                    title="Modifier"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteModal({ show: true, labo, loading: false })
                    }}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Badge statut */}
                {labo.statut === "Inactif" && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                      Inactif
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
              <p className="text-xs text-gray-400">
                Page {page} sur {pagination.totalPages} • {pagination.total} résultats
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum: number
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de suppression */}
      {deleteModal.show && deleteModal.labo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteModal({ show: false, labo: null, loading: false })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer le laboratoire</h3>
                <p className="text-xs text-gray-400">{deleteModal.labo.acronym} — {deleteModal.labo.name}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-800">
                ⚠️ Cette action est <strong>irréversible</strong>. Les chercheurs rattachés ne seront pas supprimés mais perdront leur affiliation.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, labo: null, loading: false })}
                disabled={deleteModal.loading}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteModal.loading}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:bg-red-300 transition-all flex items-center gap-2 shadow-sm shadow-red-200"
              >
                {deleteModal.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}