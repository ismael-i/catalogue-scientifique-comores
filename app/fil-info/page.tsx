'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Newspaper,
  Search,
  Tag as TagIcon,
} from 'lucide-react'
import type { Article } from '@/types/article'
import { articles } from '@/lib/articles'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Spinner } from '@/components/ui/spinner'
import { Pagination } from '@/components/Pagination'
import { ArticleData, articlesApi } from '@/lib/api/articles'
import { ApiError } from '@/lib/api/client'
import { getFileUrl } from '@/lib/utils/fileUrl'
import Image from 'next/image'

const FETCH_DELAY_MS = 500
const ITEMS_PER_PAGE = 9

const FilInfoPage = () => {
  const [items, setItems] = useState<ArticleData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

   const [pagination, setPagination] = useState({ total: 0, totalPages: 0, limit: 9 })

    const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await articlesApi.findAll({
        search: search || undefined,
        page,
        limit: 9
      })
      setItems(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      
     fetchArticles()
      setLoading(false)
    }, FETCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [fetchArticles])

  const filtered = useMemo<ArticleData[]>(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.tag.toLowerCase().includes(q)) ||
        a.chercheur?.name.toLowerCase().includes(q),
    )
  }, [items, search])

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
          <span className="text-slate-700">Fil info</span>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Fil info
              </h1>
              <p className="text-sm text-slate-500">
                Les dernières actualités scientifiques des chercheurs et laboratoires des Comores.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 self-start flex-shrink-0">
              <span className="text-lg font-bold">{items.length}</span>
              <span className="text-xs">actualités</span>
            </div>
          </div>

          {/* Search */}
          {!loading && (
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une actualité..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[420px] pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
          )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
          </div>
        )}
          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-slate-200">
              <Spinner className="size-8 text-blue-500 mb-3" />
              <p className="text-slate-500 text-sm">Chargement des actualités…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">
                Aucune actualité ne correspond à votre recherche.
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((a) => (
                  <li key={a.id}>
                    <FilInfoCard article={a} />
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

interface FilInfoCardProps {
  article: ArticleData
}

const FilInfoCard = ({ article }: FilInfoCardProps) => {
  const { id, date, title, description, imageUrl, imageAlt, tags, chercheur } =
    article

  return (
    <Link
      href={`/fil-info/${id}`}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all h-full"
    >
      {/* Cover */}
      <div className="h-52 w-full overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={getFileUrl(imageUrl)}
            alt={imageAlt ?? title}
            fill={true}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-50 to-sky-100 flex items-center justify-center">
            <Newspaper className="w-12 h-12 text-sky-300" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>

        <h2 className="text-base font-semibold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>

        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3 flex-1">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((t) => (
              <TagChip key={t.tag} label={t.tag} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-600 font-medium truncate">
            {chercheur?.name}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}

interface TagChipProps {
  label: string
}

const TagChip = ({ label }: TagChipProps) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-xs">
    <TagIcon className="w-3 h-3" />
    {label}
  </span>
)

export default FilInfoPage
