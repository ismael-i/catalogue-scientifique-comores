"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { institutionsApi, type InstitutionData } from "@/lib/api/institutions"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
import Link from "next/link"
import {
  Search,
  Plus,
  Building2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  Users,
  FlaskConical,
  ChevronRight
} from "lucide-react"

export default function AdminInstitutionsPage() {
  const { token, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [institutions, setInstitutions] = useState<InstitutionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Pagination
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, limit: 12 })

  // Modal suppression
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean
    institution: InstitutionData | null
    loading: boolean
  }>({ show: false, institution: null, loading: false })

  // ─── Auth ──────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/institutions")
    }
  }, [user, authLoading, router])

  // ─── Charger les institutions ──────────────────────────
  const fetchInstitutions = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await institutionsApi.findAll({
        search: searchQuery || undefined,
        page,
        limit: pagination.limit
      })
      setInstitutions(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [token, searchQuery, page])

  useEffect(() => {
    if (token) fetchInstitutions()
  }, [token, fetchInstitutions])

  // ─── Suppression ────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal.institution || !token) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      await institutionsApi.delete(deleteModal.institution.id, token)
      setInstitutions(prev => prev.filter(i => i.id !== deleteModal.institution!.id))
      setDeleteModal({ show: false, institution: null, loading: false })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-sm text-gray-400 mt-1">Gérez les institutions de recherche</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInstitutions}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/institutions/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            placeholder="Rechercher par nom ou acronyme..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Compteur */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">{pagination.total} institution{pagination.total > 1 ? "s" : ""}</p>
      </div>

      {/* Grille de cartes */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : institutions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Aucune institution enregistrée</p>
          <Link href="/admin/institutions/nouveau" className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
            <Plus className="w-4 h-4" /> Ajouter une institution
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {institutions.map((inst) => (
            <div key={inst.id} className="group relative">
              <Link href={`/admin/institutions/${inst.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                  {/* Logo & Acronyme */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${inst.logoBg || "bg-blue-100"} flex items-center justify-center overflow-hidden`}>
                        {inst.logo ? (
                          <img src={getFileUrl(inst.logo)} alt={inst.acronym} className="w-10 h-10 object-contain p-1" />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{inst.acronym}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>

                  {/* Nom */}
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {inst.name}
                  </h3>

                  {/* Description courte */}
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1">{inst.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{inst._count?.chercheurs || 0} chercheurs</span>
                    <span className="flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" />{inst._count?.laboratoires || 0} labos</span>
                  </div>
                </div>
              </Link>

              {/* Actions hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Link
                  href={`/admin/institutions/${inst.id}/modifier`}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteModal({ show: true, institution: inst, loading: false }) }}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-blue-600 text-white" : "bg-white border border-gray-200 hover:bg-gray-50"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal suppression */}
      {deleteModal.show && deleteModal.institution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, institution: null, loading: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer l'institution</h3>
                <p className="text-xs text-gray-400">{deleteModal.institution.acronym} — {deleteModal.institution.name}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-800">⚠️ Cette action est <strong>irréversible</strong>. Les laboratoires et chercheurs rattachés seront également supprimés.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal({ show: false, institution: null, loading: false })} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl">Annuler</button>
              <button onClick={handleDelete} disabled={deleteModal.loading} className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2">
                {deleteModal.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}