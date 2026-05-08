'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Users } from 'lucide-react'
import type { Institution } from '@/types'
import { institutions } from '@/lib/data'
import { getChercheursByInstitution } from '@/lib/chercheurs'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { InstIcon } from '@/components/icons'
import { Spinner } from '@/components/ui/spinner'
import { Pagination } from '@/components/Pagination'

const FETCH_DELAY_MS = 500
const ITEMS_PER_PAGE = 9

const InstitutionsPage = () => {
  const [items, setItems] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(institutions)
      setLoading(false)
    }, FETCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo<Institution[]>(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.acronym.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    )
  }, [items, search])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Accueil
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-700">Institutions</span>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Institutions
              </h1>
              <p className="text-sm text-slate-500">
                Universités, instituts et centres de recherche de l&apos;Union des Comores.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 self-start flex-shrink-0">
              <span className="text-lg font-bold">{institutions.length}</span>
              <span className="text-xs">institutions répertoriées</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une institution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[420px] pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* Counter */}
          <p className="text-sm text-slate-600 mb-4">
            {loading ? (
              <span className="text-slate-400">Chargement…</span>
            ) : (
              <>
                <span className="font-semibold text-slate-900">{filtered.length}</span>{' '}
                institutions
              </>
            )}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-slate-200">
              <Spinner className="size-8 text-blue-500 mb-3" />
              <p className="text-slate-500 text-sm">Chargement des institutions…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">
                Aucune institution ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((i) => (
                  <li key={i.acronym}>
                    <InstitutionGridCard institution={i} />
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface InstitutionGridCardProps {
  institution: Institution
}

const InstitutionGridCard = ({ institution }: InstitutionGridCardProps) => {
  const { acronym, name, description, logo, logoBg } = institution
  const researchers = getChercheursByInstitution(acronym).length
  const slug = acronym.toLowerCase()

  return (
    <Link
      href={`/institutions/${slug}`}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
            logoBg ?? 'bg-slate-50'
          }`}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={`Logo ${acronym}`}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <InstIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <span className="text-xs font-semibold text-emerald-700 tracking-wide">
          {acronym}
        </span>
      </div>

      <h2 className="text-base font-semibold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
        {name}
      </h2>

      <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-4 flex-1">
        {description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        {researchers > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" />
            {researchers} chercheurs
          </span>
        ) : (
          <span />
        )}
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </Link>
  )
}

export default InstitutionsPage
