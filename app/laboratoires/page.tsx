'use client'
// app/laboratoires/page.tsx

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { AlertCircle, Search } from 'lucide-react'
import type { LaboratoireDetail, LabCategorie } from '../../types'
import { LaboCard }         from '@/components/labs/LaboCard'
import { LaboSkeletonGrid } from '@/components/LaboSkeleton'
import { MOCK_LABORATOIRES } from '@/lib/data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LaboratoireCard, laboratoiresApi } from '@/lib/api/laboratoires'
import { ApiError } from '@/lib/api/client'

const CATEGORIES: { value: string; label: string }[] = [
  { value: '',              label: 'Toutes les catégories' },
  { value: 'Sciences',      label: 'Sciences' },
  { value: 'Environnement', label: 'Environnement' },
  { value: 'Santé',         label: 'Santé' },
  { value: 'Économie',      label: 'Économie' },
  { value: 'Lettres',       label: 'Lettres' },
]

export default function LaboratoiresPage() {
  const [labos, setLabos]         = useState<LaboratoireCard[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [categorie, setCategorie] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, limit: 12 })
    const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLabos() {
      setLoading(true)
      setError(null)
      try {
         const result = await laboratoiresApi.findAll({
                page,
                limit: pagination.limit
              }) 
        // const data = await res.json()
        setLabos(result.data)
        setPagination(result.pagination)
      } catch (err){
        setError(err instanceof ApiError ? err.message : "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    fetchLabos()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return labos.filter((l) => {
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.acronym.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.institution?.name.toLowerCase().includes(q)
      const matchCat = !categorie || l.categorie === categorie
      return matchSearch && matchCat
    })
  }, [labos, search, categorie])

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-slate-600">Laboratoires</span>
        </nav>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Laboratoires</h1>
          <p className="text-sm text-slate-500">
            Unités de recherche actives au sein des institutions comoriennes.
          </p>
        </div>

        {/* Recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un laboratoire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[480px] pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* Filtres catégorie */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategorie(cat.value)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors
                ${categorie === cat.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Compteur */}
        <p className="text-sm text-slate-500 mb-5">
          <span className="font-semibold text-slate-800">{filtered.length}</span> laboratoires
        </p>

            {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
          </div>
        )}
        {/* Grille */}
        {loading ? (
          <LaboSkeletonGrid count={8} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-10 h-10 text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">Aucun laboratoire ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((labo) => (
              <LaboCard key={labo.id} labo={labo} />
            ))}
          </div>
        )}

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

      </div>
         <Footer />
    </div>
  )
}