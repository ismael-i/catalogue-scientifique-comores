'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, LayoutGrid, List } from 'lucide-react'
import type { Chercheur, ViewMode } from '@/types'
import { ChercheurCard } from '@/components/cards/researchercardPage'
import { ChercheurSkeletonList } from '@/components/ChercheurSkeleton'
import { Pagination } from '@/components/Pagination'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

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

  // ── Fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchChercheurs() {
      setLoading(true)
      try {
        // Remplace cette URL par ton endpoint réel
        const res = await fetch('/api/chercheurs')
        const data: Chercheur[] = await res.json()
        setChercheurs(data)
      } catch {
        // En dev, données fictives pour prévisualiser
        setChercheurs(MOCK_CHERCHEURS)
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
        c.institution.toLowerCase().includes(q)
      const matchInstitution =
        !institution || c.institution === institution
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

// ── Données fictives (dev) ───────────────────────────────────────────
const MOCK_CHERCHEURS: Chercheur[] = [
  { id: '1',  name: 'Dr Nadjim Ahmed Mohamed',      institution: 'UDC', faculty: 'FST', specialty: 'Écosystème et Biodiversité marine, pollution marine et côtière' },
  { id: '2',  name: 'Dr Andiliyat Said Mohamed',    institution: 'UDC', faculty: 'FST', specialty: 'Biodiversité, botanique, géomatique' },
  { id: '3',  name: 'Dr Said Hassani Mohamed',      institution: 'UDC', faculty: 'FST', specialty: 'Biologie et Santé' },
  { id: '4',  name: 'Dr Malik El-Houyoun Ahamada',  institution: 'UDC', faculty: 'FST', specialty: 'Énergétique et mécanique appliquée' },
  { id: '5',  name: 'Dr Salim Ahmed',               institution: 'UDC', faculty: 'FST', specialty: 'Physique de l\'environnement et du climat' },
  { id: '6',  name: 'Dr Halassi Abdoulhafar',       institution: 'UDC', faculty: 'FST', specialty: 'Mathématiques, Informatique et IA' },
  { id: '7',  name: 'Dr Azali Ahamada',             institution: 'UDC', faculty: 'FST', specialty: 'Aliments, Réactivité et Synthèse des Substances Naturelles' },
  { id: '8',  name: 'Dr Ibrahim Said Ali',          institution: 'UDC', faculty: 'FST', specialty: 'Valorisation des ressources alimentaires locales' },
  { id: '9',  name: 'Rastami Ahamadi',              institution: 'UDC', faculty: 'FST', specialty: 'Inventaires des plantes médicinales et aromatiques' },
  { id: '10', name: 'Allaoui Ahamadi',              institution: 'UDC', faculty: 'FST', specialty: 'Santé des plantes et animaux' },
  { id: '11', name: 'Dr Anli Mohamed',              institution: 'UDC', faculty: 'FST', specialty: 'Valorisation et transformation des déchets' },
  { id: '12', name: 'Dr Mohamed Abdou',             institution: 'BGC', specialty: 'Gestion et exploitation des ressources géologiques' },
  { id: '13', name: 'Dr Azali Ahamada',             institution: 'INRAPE', specialty: 'Aliments, Réactivité et Synthèse des Substances Naturelles' },
  { id: '14', name: 'Dr Chakira Hamada',            institution: 'UDC', faculty: 'FST', specialty: 'Entomologie, Neurosciences et Santé' },
]