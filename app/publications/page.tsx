'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, FileText, Search } from 'lucide-react'
import type { Publication, PublicationDomain } from '@/types'
import {
  publications,
  PUBLICATION_DOMAINS,
  domainBadgeClass,
} from '@/lib/publications'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Spinner } from '@/components/ui/spinner'
import { Pagination } from '@/components/Pagination'

const ALL_DOMAINS = '' as const
const ALL_YEARS = '' as const
const FETCH_DELAY_MS = 600
const ITEMS_PER_PAGE = 8

const PublicationsPage = () => {
  const [items, setItems] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState<PublicationDomain | ''>(ALL_DOMAINS)
  const [year, setYear] = useState<number | ''>(ALL_YEARS)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(publications)
      setLoading(false)
    }, FETCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const years = useMemo<number[]>(() => {
    const set = new Set<number>(items.map((p) => p.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [items])

  const filtered = useMemo<Publication[]>(() => {
    const q = search.trim().toLowerCase()
    return items.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q)) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
      const matchDomain = !domain || p.domain === domain
      const matchYear = !year || p.year === year
      return matchSearch && matchDomain && matchYear
    })
  }, [items, search, domain, year])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, domain, year])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Accueil
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-700">Publications</span>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Publications</h1>
            <p className="text-sm text-slate-500">
              Articles, communications et travaux de recherche des chercheurs comoriens.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, auteur ou mot-clé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <select
              value={domain}
              onChange={(e) =>
                setDomain((e.target.value as PublicationDomain) || ALL_DOMAINS)
              }
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              <option value="">Tous les domaines</option>
              {PUBLICATION_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) =>
                setYear(e.target.value === '' ? ALL_YEARS : Number(e.target.value))
              }
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              <option value="">Toutes les années</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Counter */}
          <p className="text-sm text-slate-600 mb-4">
            {loading ? (
              <span className="text-slate-400">Chargement…</span>
            ) : (
              <>
                <span className="font-semibold text-slate-900">{filtered.length}</span>{' '}
                publications
              </>
            )}
          </p>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-slate-200">
              <Spinner className="size-8 text-blue-500 mb-3" />
              <p className="text-slate-500 text-sm">
                Chargement des publications…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">
                Aucune publication ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {paginated.map((p) => (
                  <li key={p.id}>
                    <PublicationListItem publication={p} />
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

interface PublicationListItemProps {
  publication: Publication
}

const PublicationListItem = ({ publication }: PublicationListItemProps) => {
  const {
    id,
    title,
    domain,
    year,
    type,
    authors,
    journal,
    description,
    keywords,
  } = publication

  return (
    <Link
      href={`/publications/${id}`}
      className="group block bg-white border border-slate-200 rounded-lg px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${domainBadgeClass[domain]}`}
            >
              {domain}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {year}
            </span>
            <span className="text-xs text-slate-500">{type}</span>
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 leading-snug">
            {title}
          </h2>

          {/* Authors */}
          <p className="text-xs text-slate-600 mb-1">{authors.join(', ')}</p>

          {/* Journal */}
          <p className="text-xs italic text-blue-500 mb-2">{journal}</p>

          {/* Description */}
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{description}</p>

          {/* Keywords */}
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs"
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors">
          <FileText className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

export default PublicationsPage
