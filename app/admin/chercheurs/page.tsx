"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { chercheursApi, type ChercheurCard } from "@/lib/api/chercheurs"
import { institutionsApi } from "@/lib/api/institutions"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { ApiError } from "@/lib/api/client"
import {
  Search,
  ChevronRight,
  Plus,
  Filter,
  X,
  Building2,
  FlaskConical,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  Users
} from "lucide-react"
import Link from "next/link"
import { SafeImage } from "@/components/ui/SafeImage"

// ─── Types pour les filtres ──────────────────────────────
interface FilterOption {
  id: string
  label: string
  acronym?: string
}

// ─── Page Principale ─────────────────────────────────────
export default function AdminChercheursPage() {
  const { token, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // États
  const [chercheurs, setChercheurs] = useState<ChercheurCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [searchQuery, setSearchQuery] = useState("")
  const [institutionFilter, setInstitutionFilter] = useState("")
  const [laboratoireFilter, setLaboratoireFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Données pour les sélecteurs
  const [institutions, setInstitutions] = useState<FilterOption[]>([])
  const [laboratoires, setLaboratoires] = useState<FilterOption[]>([])

  // Pagination
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, limit: 12 })

  // Modal suppression
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean
    chercheur: ChercheurCard | null
    loading: boolean
  }>({ show: false, chercheur: null, loading: false })

  // ─── Vérification auth ──────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/chercheurs")
    }
  }, [user, authLoading, router])

  // ─── Charger filtres ────────────────────────────────────
  useEffect(() => {
    async function loadFilters() {
      try {
        const [instData, laboData] = await Promise.all([
          institutionsApi.findAllSimple(),
          laboratoiresApi.findAllSimple()
        ])
        setInstitutions(instData.data || instData || [])
        setLaboratoires(laboData.data || laboData || [])
      } catch (err) {
        console.error("Erreur chargement filtres:", err)
      }
    }
    loadFilters()
  }, [])

  // ─── Charger chercheurs ─────────────────────────────────
  const fetchChercheurs = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const result = await chercheursApi.findAll({
        search: searchQuery || undefined,
        institution: institutionFilter || undefined,
        laboratoire: laboratoireFilter || undefined,
        page,
        limit: pagination.limit
      })

      setChercheurs(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [token, searchQuery, institutionFilter, laboratoireFilter, page])

  useEffect(() => {
    if (token) fetchChercheurs()
  }, [fetchChercheurs, token])

  // ─── Suppression ────────────────────────────────────────
  async function handleDelete() {
    if (!deleteModal.chercheur || !token) return

    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      await chercheursApi.delete(deleteModal.chercheur.id, token)
      setChercheurs(prev => prev.filter(c => c.id !== deleteModal.chercheur!.id))
      setDeleteModal({ show: false, chercheur: null, loading: false })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  // ─── Réinitialiser filtres ──────────────────────────────
  function resetFilters() {
    setSearchQuery("")
    setInstitutionFilter("")
    setLaboratoireFilter("")
    setPage(1)
  }

  const hasActiveFilters = searchQuery || institutionFilter || laboratoireFilter

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
          <h1 className="text-2xl font-bold text-gray-900">Chercheurs</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez la liste des chercheurs référencés
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
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>

          {/* Bouton actualiser */}
          <button
            onClick={fetchChercheurs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>

          {/* Bouton ajouter */}
          <Link
            href="/admin/chercheurs/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-3 mb-6">
        {/* Recherche principale */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder="Rechercher par nom, spécialité..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <select
                value={institutionFilter}
                onChange={(e) => { setInstitutionFilter(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
              >
                <option value="">Toutes les institutions</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.acronym || inst.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-gray-400" />
              <select
                value={laboratoireFilter}
                onChange={(e) => { setLaboratoireFilter(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
              >
                <option value="">Tous les laboratoires</option>
                {laboratoires.map((labo) => (
                  <option key={labo.id} value={labo.id}>
                    {labo.acronym || labo.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <button onClick={fetchChercheurs} className="text-xs underline mt-1 hover:text-red-800">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* En-tête table */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Total : {pagination.total} chercheur{pagination.total > 1 ? "s" : ""}
            </h2>
            {hasActiveFilters && (
              <p className="text-[11px] text-blue-500 mt-0.5">Filtres actifs</p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-5 py-3">
                    Nom
                  </th>
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    Institution
                  </th>
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
                    Laboratoire
                  </th>
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-4 py-3">
                    Spécialité
                  </th>
                  <th className="text-right text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {chercheurs.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Colonne Nom */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0 border border-blue-50 group-hover:border-blue-200 transition-colors">
                          <SafeImage src={c.photoUrl} alt={c.name} size="sm" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-none">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {c.faculty ?? c.institutionName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Colonne Institution */}
                    <td className="px-4 py-4 text-xs text-gray-500 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-gray-300" />
                        {c.institution?.acronym || c.institutionName || "—"}
                      </span>
                    </td>

                    {/* Colonne Laboratoire */}
                    <td className="px-4 py-4 text-xs text-gray-500 hidden lg:table-cell">
                      {c.laboratoire ? (
                        <span className="inline-flex items-center gap-1.5">
                          <FlaskConical className="w-3 h-3 text-gray-300" />
                          {c.laboratoire.acronym}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Colonne Spécialité */}
                    <td className="px-4 py-4 text-xs text-gray-500">
                      <span className="line-clamp-1 max-w-[200px]">
                        {c.specialty}
                      </span>
                    </td>

                    {/* Colonne Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Voir détails */}
                        <Link
                          href={`/admin/chercheurs/${c.id}`}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Modifier */}
                        <Link
                          href={`/admin/chercheurs/${c.id}/modifier`}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-amber-100 flex items-center justify-center text-gray-400 hover:text-amber-600 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>

                        {/* Supprimer */}
                        <button
                          onClick={() => setDeleteModal({ show: true, chercheur: c, loading: false })}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* État vide */}
          {!loading && chercheurs.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">
                {hasActiveFilters
                  ? "Aucun chercheur ne correspond aux filtres"
                  : "Aucun chercheur enregistré"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Réinitialiser les filtres
                </button>
              )}
              {!hasActiveFilters && (
                <Link
                  href="/admin/chercheurs/nouveau"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un chercheur
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
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
      </div>

      {/* Modal de confirmation suppression */}
      {deleteModal.show && deleteModal.chercheur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteModal({ show: false, chercheur: null, loading: false })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer le chercheur</h3>
                <p className="text-xs text-gray-400">{deleteModal.chercheur.name}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-800">
                ⚠️ Cette action est <strong>irréversible</strong>. Le compte utilisateur associé sera également supprimé.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, chercheur: null, loading: false })}
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
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}