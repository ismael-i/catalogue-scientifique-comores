"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi, type ArticleData } from "@/lib/api/articles"
import { publicationsApi, type PublicationData } from "@/lib/api/publications"
import { ChercheurDetail, chercheursApi } from "@/lib/api/chercheurs"
import Link from "next/link"
import { Newspaper, FileText, BookOpen, Loader2, ArrowRight, FlaskConical, Building2 } from "lucide-react"
import { getFileUrl } from "@/lib/utils/fileUrl"

export default function ChercheurDashboard() {
  const { user, token } = useAuth()
  const [articles, setArticles] = useState<ArticleData[]>([])
  const [publications, setPublications] = useState<PublicationData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ articles: 0, publications: 0 })
   const [chercheur, setChercheur] = useState<ChercheurDetail | null>(null)

  useEffect(() => {
    if (!token || !user) return

    async function loadDashboard() {
      setLoading(true)
      try {

         // Récupérer le profil complet du chercheur (laboratoire + institution)
        const profil = await chercheursApi.findById(user!.chercheurId!)
        setChercheur(profil)

        // Articles du chercheur
        const arts = await articlesApi.findAll({ chercheurId: user!.chercheurId, limit: 5 })
        setArticles(arts.data)
        setStats(prev => ({ ...prev, articles: arts.pagination.total }))

        // Publications : on récupère les dernières et on filtre par nom
        const allPubs = await publicationsApi.findAll({ limit: 50 })
        const myPubs = allPubs.data.filter(pub =>
          pub.authors?.some(a => a?.id === user!.chercheurId)
        )
        setPublications(myPubs.slice(0, 5))
        setStats(prev => ({ ...prev, publications: myPubs.length }))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [token, user])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user?.name || "Chercheur"}</h1>
        <p className="text-sm text-gray-400 mt-1">Bienvenue dans votre espace personnel</p>
      </div>

      {chercheur && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Institution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${chercheur.institution?.logoBg || "bg-blue-100"} flex items-center justify-center overflow-hidden flex-shrink-0`}>
              {chercheur.institution?.logo ? (
                <img src={getFileUrl(chercheur.institution.logo)} alt={chercheur.institution.acronym} className="w-10 h-10 object-contain" />
              ) : (
                <Building2 className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Institution</p>
              <p className="text-sm font-bold text-gray-900">
                {chercheur.institution ? chercheur.institution.name : "Chercheur externe"}
              </p>
              <p className="text-xs text-gray-500">{chercheur.institution?.acronym || ""}</p>
            </div>
          </div>

          {/* Laboratoire(s) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {chercheur.laboratoires?.[0]?.logo ? (
                <img src={getFileUrl(chercheur.laboratoires[0].logo)} alt={chercheur.laboratoires[0].acronym} className="w-10 h-10 object-contain" />
              ) : (
                <FlaskConical className="w-6 h-6 text-blue-500" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">
                {(chercheur.laboratoires?.length ?? 0) > 1 ? "Laboratoires" : "Laboratoire"}
              </p>
              <p className="text-sm font-bold text-gray-900">
                {chercheur.laboratoires && chercheur.laboratoires.length > 0
                  ? chercheur.laboratoires.map(l => l.name).join(", ")
                  : "Aucun laboratoire"}
              </p>
              <p className="text-xs text-gray-500">
                {chercheur.laboratoires?.map(l => l.acronym).join(", ") || ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Articles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.articles}</p>
            </div>
            <Newspaper className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Publications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.publications}</p>
            </div>
            <FileText className="w-8 h-8 text-emerald-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Domaine</p>
              <p className="text-sm font-medium text-gray-700 mt-1">—</p>
            </div>
            <BookOpen className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Derniers articles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Mes derniers articles</h2>
          <Link href="/dashboard/articles/nouveau" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Nouveau <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {articles.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Aucun article pour le moment</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {articles.map(article => (
              <div key={article.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{article.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(article.date).toLocaleDateString("fr-FR")} • {article.tags?.map(t => t.tag).join(", ")}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dernières publications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Mes publications récentes</h2>
          <Link href="/dashboard/publications/nouveau" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Nouvelle <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {publications.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Aucune publication trouvée</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {publications.map(pub => (
              <div key={pub.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{pub.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pub.journal} ({pub.year})</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}