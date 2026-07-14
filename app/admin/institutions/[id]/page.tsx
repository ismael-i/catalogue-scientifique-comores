"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { institutionsApi, type InstitutionDetail } from "@/lib/api/institutions"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  Users,
  FlaskConical,
  Loader2,
  AlertCircle,
  ChevronRight,
  Mail
} from "lucide-react"

export default function AdminInstitutionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  const [institution, setInstitution] = useState<InstitutionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

// ─── Pagination ──────────────────────────────────────────
const [laboratoiresPage, setLaboratoiresPage] = useState(1)
const [chercheursPage, setChercheursPage] = useState(1)
const ITEMS_PER_PAGE = 10

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (token && id) {
      setLoading(true)
      institutionsApi.findById(id)
        .then(data => setInstitution(data))
        .catch(err => setError(err instanceof ApiError ? err.message : "Institution introuvable"))
        .finally(() => setLoading(false))
    }
  }, [token, id])

  useEffect(() => {
  setLaboratoiresPage(1)
  setChercheursPage(1)
}, [id])



  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  if (error || !institution) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error || "Institution non trouvée"}</p>
          <Link href="/admin/institutions" className="text-xs underline">Retour</Link>
        </div>
      </div>
    )
  }
  const totalLaboratoires = institution.laboratoires?.length || 0
  const totalLaboratoiresPages = Math.max(1, Math.ceil(totalLaboratoires / ITEMS_PER_PAGE))
  const paginatedLaboratoires = (institution.laboratoires || []).slice(
    (laboratoiresPage - 1) * ITEMS_PER_PAGE,
    laboratoiresPage * ITEMS_PER_PAGE
  )

  const totalChercheurs = institution.chercheurs?.length || 0
  const totalChercheursPages = Math.max(1, Math.ceil(totalChercheurs / ITEMS_PER_PAGE))
  const paginatedChercheurs = (institution.chercheurs || []).slice(
    (chercheursPage - 1) * ITEMS_PER_PAGE,
    chercheursPage * ITEMS_PER_PAGE
  )


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/institutions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </Link>
        <div className="flex gap-2">
          <Link href={`/admin/institutions/${id}/modifier`} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl border border-amber-200 hover:bg-amber-100">
            <Pencil className="w-4 h-4" /> Modifier
          </Link>
          <button onClick={() => router.push(`/admin/institutions/${id}/modifier`)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-100">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      </div>

      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className={`w-20 h-20 rounded-2xl ${institution.logoBg || "bg-blue-100"} flex items-center justify-center flex-shrink-0`}>
            {institution.logo ? (
              <img src={getFileUrl(institution.logo)} alt={institution.acronym} className="w-20 h-20 object-contain p-2" />
            ) : (
              <Building2 className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{institution.acronym}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{institution.name}</h1>
            <p className="text-sm text-gray-500 mt-3 max-w-2xl">{institution.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Laboratoires */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-gray-400" /> Laboratoires ({totalLaboratoires})
            </h3>
          </div>
          {paginatedLaboratoires.length > 0 ? (
            <>
              <div className="divide-y divide-gray-50">
                {paginatedLaboratoires.map((labo: any) => (
                  <Link key={labo.id} href={`/admin/laboratoires/${labo.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
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
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{labo.acronym}</p>
                        <p className="text-xs text-gray-500">{labo.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                ))}
              </div>
              <PaginationControls
                currentPage={laboratoiresPage}
                totalPages={totalLaboratoiresPages}
                onPageChange={setLaboratoiresPage}
              />
            </>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">Aucun laboratoire rattaché</div>
          )}
        </div>

        {/* Chercheurs */}
        {/* Chercheurs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> Chercheurs ({totalChercheurs})
            </h3>
          </div>
          {paginatedChercheurs.length > 0 ? (
            <>
              <div className="divide-y divide-gray-50">
                {paginatedChercheurs.map((chercheur: any) => (
                  <Link key={chercheur.id} href={`/admin/chercheurs/${chercheur.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                      {chercheur.photoUrl ? (
                        <img
                        src={getFileUrl(chercheur.photoUrl)}
                        alt={chercheur.name}
                        className="w-9 h-9 rounded-xl object-cover"
                        />
                        ) : (
                          <span className="text-blue-700 text-xs font-bold">
                            {chercheur.name.charAt(0)}
                          </span>
                          )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{chercheur.name}</p>
                        <p className="text-xs text-gray-500">{chercheur.specialty}</p>
                      </div>
                    </div>
                    {chercheur.email && (
                    <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.location.href = `mailto:${chercheur.email}`
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500"
                        title={chercheur.email}
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </Link>
                ))}
              </div>
              <PaginationControls
                currentPage={chercheursPage}
                totalPages={totalChercheursPages}
                onPageChange={setChercheursPage}
              />
            </>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">Aucun chercheur rattaché</div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50 bg-gray-50/50">
      <p className="text-xs text-gray-400">
        Page {currentPage} sur {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          Précédent
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
          )
          .map((page, idx, arr) => (
            <span key={page} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== page - 1 && (
                <span className="px-1 text-xs text-gray-300">…</span>
              )}
              <button
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            </span>
          ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}