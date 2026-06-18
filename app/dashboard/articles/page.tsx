"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi, type ArticleData } from "@/lib/api/articles"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  Plus,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Newspaper,
  Tag,
  ChevronRight,
  Eye
} from "lucide-react"

export default function MesArticlesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<ArticleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, limit: 10 })

  // Modal suppression
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean
    article: ArticleData | null
    loading: boolean
  }>({ show: false, article: null, loading: false })

  const fetchArticles = useCallback(async () => {
    if (!token || !user?.chercheurId) return
    setLoading(true)
    setError(null)
    try {
      const result = await articlesApi.findAll({
        chercheurId: user.chercheurId,
        page,
        limit: 10
      })
      setArticles(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [token, user, page])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleDelete = async () => {
    if (!deleteModal.article || !token) return
    setDeleteModal(prev => ({ ...prev, loading: true }))
    try {
      await articlesApi.delete(deleteModal.article.id, token)
      setArticles(prev => prev.filter(a => a.id !== deleteModal.article!.id))
      setDeleteModal({ show: false, article: null, loading: false })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
      setDeleteModal(prev => ({ ...prev, loading: false }))
    }
  }

  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes articles</h1>
          <p className="text-sm text-gray-400">Gérez vos articles et actualités</p>
        </div>
        <Link
          href="/dashboard/articles/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nouvel article
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {articles.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl border py-16 text-center">
          <Newspaper className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Vous n'avez publié aucun article</p>
          <Link
            href="/dashboard/articles/nouveau"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600"
          >
            <Plus className="w-4 h-4" /> Écrire mon premier article
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase px-5 py-3">Titre</th>
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase px-4 py-3">Tags</th>
                  <th className="text-right text-[11px] text-gray-400 font-semibold uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{article.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(article.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {article.tags?.slice(0, 3).map(tag => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full"
                          >
                            {tag.tag}
                          </span>
                        ))}
                        {article.tags?.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                          <Link
                          href={`/dashboard/articles/${article.id}`}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-400 hover:text-green-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/dashboard/articles/${article.id}/modifier`}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-amber-100 flex items-center justify-center text-gray-400 hover:text-amber-600"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ show: true, article, loading: false })}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-50 flex justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                    page === p ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal suppression */}
      {deleteModal.show && deleteModal.article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteModal({ show: false, article: null, loading: false })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer l'article</h3>
                <p className="text-xs text-gray-400 truncate">{deleteModal.article.title}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-800">⚠️ Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, article: null, loading: false })}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteModal.loading}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2"
              >
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