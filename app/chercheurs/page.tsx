'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, LayoutGrid, List, AlertCircle } from 'lucide-react'
import type { ViewMode } from '@/types'
import { ChercheurCard } from '@/components/researcher/researchercardPage'
import { ChercheurSkeletonList } from '@/components/ChercheurSkeleton'
import { Pagination } from '@/components/Pagination'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MOCK_CHERCHEURS, MOCK_RELATED } from '@/lib/data'
import { ChercheurCard as Chercheur, chercheursApi} from '@/lib/api/chercheurs'
import { ApiError } from '@/lib/api/client'

// ── Constantes ───────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12

const INSTITUTIONS = [
  { value: '',       label: 'Toutes les institutions' },
  { value: 'UDC',    label: 'UDC – Université des Comores' },
  { value: 'INRAPE', label: 'INRAPE – Institut National de Recherche…' },
  { value: 'CNDRS',  label: 'CNDRS – Centre National de Documentati…' },
  { value: 'BGC',    label: 'BGC – Bureau Géologique des Comores' },
  { value: 'LNTPB',  label: 'LNTPB-EPIC – Laboratoire National de Travau…' },
]

// ── Page ─────────────────────────────────────────────────────────────
export default function ChercheurPage() {
  const [chercheurs, setChercheurs] = useState<Chercheur[]>([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState<ViewMode>('grid')
  const [search, setSearch]         = useState('')
  const [institution, setInstitution] = useState('')
  const [page, setPage]             = useState(1)
  const [error, setError]           = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchChercheurs() {
      setLoading(true)
      try {
        // Remplace cette URL par ton endpoint réel
        const result = await chercheursApi.findAll({
              })
        // const res = await fetch('/api/chercheurs')
        // const data: Chercheur[] = await res.json()
        setChercheurs(result.data)
      } catch (err) {
        // En dev, données fictives pour prévisualiser
          setError(err instanceof ApiError ? err.message : "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    fetchChercheurs()
  }, [])

  // ── Filtrage ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return chercheurs.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.specialty.toLowerCase().includes(q) ||
        c.institution?.acronym.toLowerCase().includes(q)
      const matchInstitution =
        !institution || c.institution?.acronym === institution
      return matchSearch && matchInstitution
    })
  }, [chercheurs, search, institution])

  // Reset page si les filtres changent
  useEffect(() => { setPage(1) }, [search, institution])

  // ── Pagination ─────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50">
           <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-slate-600">Chercheurs</span>
        </nav>

        {/* ── En-tête ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Chercheurs</h1>
            <p className="text-sm text-slate-500">
              Découvrez les chercheurs référencés sur la plateforme scientifique comorienne.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 self-start flex-shrink-0">
            <span className="text-lg font-bold">{chercheurs.length}</span>
            <span className="text-xs">chercheurs répertoriés</span>
          </div>
        </div>

        {/* ── Barre de recherche ────────────────────────────────── */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité ou institution…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[480px] pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* ── Filtre institution ────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span>Filtres :</span>
          </div>
          <select
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            {INSTITUTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Toolbar : compteur + toggle vue ───────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{filtered.length}</span> résultats
          </p>

          {/* Toggle grille / liste */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setView('grid')}
              aria-label="Vue grille"
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${view === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="Vue liste"
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors
                ${view === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
         {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
          </div>
        )}

        {/* ── Contenu ───────────────────────────────────────────── */}
        {loading ? (
          <ChercheurSkeletonList count={ITEMS_PER_PAGE} mode={view} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-10 h-10 text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">Aucun chercheur ne correspond à votre recherche.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((c) => (
              <ChercheurCard key={c.id} chercheur={c} mode="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginated.map((c) => (
              <ChercheurCard key={c.id} chercheur={c} mode="list" />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────── */}
        {!loading && filtered.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
       <Footer />
    </div>
  )
}

