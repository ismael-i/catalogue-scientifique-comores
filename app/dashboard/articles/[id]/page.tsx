"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi, type ArticleData } from "@/lib/api/articles"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Loader2,
  AlertCircle,
  User,
  FlaskConical,
  Calendar,
  Tag
} from "lucide-react"

export default function ArticleDetailChercheurPage() {
  const params = useParams()
  const { user, token } = useAuth()
  const id = params.id as string

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !id) return
    setLoading(true)
    articlesApi
      .findById(id)
      .then(data => {
        // Vérifier que l'article appartient bien au chercheur connecté
        if (data.chercheur?.id !== user?.chercheurId) {
          setError("Vous n'êtes pas autorisé à consulter cet article.")
          return
        }
        setArticle(data)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : "Article introuvable"))
      .finally(() => setLoading(false))
  }, [token, id, user])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">{error || "Article non trouvé"}</p>
            <Link href="/dashboard/articles" className="text-xs underline mt-1 inline-block">
              Retour à mes articles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à mes articles
        </Link>
        <Link
          href={`/dashboard/articles/${id}/modifier`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <Pencil className="w-4 h-4" /> Modifier
        </Link>
      </div>

      {/* Contenu de l'article */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {/* Métadonnées */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {new Date(article.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </span>
          {article.chercheur && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              {article.chercheur.name}
            </span>
          )}
          {article.laboratoire && (
            <span className="flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-gray-400" />
              {article.laboratoire.acronym} – {article.laboratoire.name}
            </span>
          )}
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h1>

        {/* Image d'illustration */}
        {article.imageUrl && (
          <div className="mb-6">
            <img
              src={getFileUrl(article.imageUrl)}
              alt={article.imageAlt || article.title}
              className="w-full max-h-96 object-cover rounded-xl border border-gray-100"
            />
          </div>
        )}

        {/* Description / accroche */}
        <p className="text-gray-600 text-base mb-6 leading-relaxed">{article.description}</p>

        {/* Corps de l'article */}
        <div className="space-y-4">
          {article.body?.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
            <Tag className="w-4 h-4 text-gray-400 mr-1" />
            {article.tags.map(tag => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
              >
                {tag.tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}