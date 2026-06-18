"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi, type ArticleData } from "@/lib/api/articles"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Loader2, AlertCircle, User, FlaskConical, Calendar, Tag } from "lucide-react"

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    // Modal suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) router.push("/auth/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (token && id) {
      setLoading(true)
      articlesApi.findById(id)
        .then(data => setArticle(data))
        .catch(err => setError(err instanceof ApiError ? err.message : "Article introuvable"))
        .finally(() => setLoading(false))
    }
  }, [token, id])

    const handleDelete = async () => {
    if (!token) return
    setDeleting(true)
    try {
      await articlesApi.delete(id, token)
      router.push("/admin/articles")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (error || !article) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p>{error || "Article non trouvé"}</p><Link href="/admin/articles" className="text-xs underline">Retour</Link></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/articles" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Retour à la liste</Link>
        <div className="flex gap-2">
          <Link href={`/admin/articles/${id}/modifier`} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl border border-amber-200 hover:bg-amber-100"><Pencil className="w-4 h-4" /> Modifier</Link>
          <button onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-100"><Trash2 className="w-4 h-4" /> Supprimer</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          {article.chercheur && (
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {article.chercheur.name}</span>
          )}
          {article.laboratoire && (
            <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4" /> {article.laboratoire.acronym}</span>
          )}
        </div>
        <p className="text-gray-600 mb-6">{article.description}</p>
        {article.imageUrl && (
          <img src={getFileUrl(article.imageUrl)} alt={article.imageAlt || ""} className="rounded-xl max-w-full mb-6" />
        )}
        <div className="prose prose-sm max-w-none">
          {article.body?.map((paragraph, idx) => (
            <p key={idx} className="mb-2">{paragraph}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {article.tags?.map(tag => (
            <span key={tag.id} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">{tag.tag}</span>
          ))}
        </div>
      </div>
      {/* ─── Modal de confirmation ──────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer l'article</h3>
                <p className="text-xs text-gray-400 truncate max-w-[250px]">{article.title}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-800">
                ⚠️ Cette action est <strong>irréversible</strong>. Les tags associés seront également supprimés.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:bg-red-300 transition-all flex items-center gap-2 shadow-sm shadow-red-200"
              >
                {deleting ? (
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