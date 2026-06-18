"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { publicationsApi, type PublicationData } from "@/lib/api/publications"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
import Link from "next/link"
import {
  ArrowLeft, Pencil, Trash2, Loader2, AlertCircle, Users, FlaskConical, Calendar, BookOpen, ExternalLink, Tag
} from "lucide-react"

export default function PublicationDetailChercheurPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const id = params.id as string

  const [publication, setPublication] = useState<PublicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    // État du modal de suppression
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!token || !id) return
    setLoading(true)
    publicationsApi.findById(id)
      .then(data => {
        // Vérifier que le chercheur est auteur
        if (!data.authors?.some(a => a.id === user?.chercheurId)) {
          setError("Vous n'êtes pas autorisé à voir cette publication.")
          return
        }
        setPublication(data)
      })
      .catch(err => setError(err instanceof ApiError ? err.message : "Publication introuvable"))
      .finally(() => setLoading(false))
  }, [token, id, user])

     // ─── Suppression ────────────────────────────────────────
    const handleDelete = async () => {
      if (!token) return
      setDeleting(true)
      try {
        await publicationsApi.delete(id, token)
        router.push("/dashboard/publications")
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
        setShowDeleteModal(false)
      } finally {
        setDeleting(false)
      }
    }
  

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  if (error || !publication) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p>{error || "Non trouvé"}</p><Link href="/dashboard/publications" className="text-xs underline">Retour</Link></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/publications" className="inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft className="w-4 h-4" /> Retour</Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/publications/${id}/modifier`} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl border border-amber-200 hover:bg-amber-100"><Pencil className="w-4 h-4" /> Modifier</Link>
          <button onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-100"><Trash2 className="w-4 h-4" /> Supprimer</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        {/* ... même contenu que la page admin, avec les infos ... */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border">{publication.type.replace("_", " ")}</span>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 border">{publication.domain}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{publication.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {publication.year}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {publication.journal}</span>
          {publication.laboratoire && (
            <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4" /> {publication.laboratoire.acronym} – {publication.laboratoire.name}</span>
          )}
        </div>
        <p className="text-gray-600 mb-6">{publication.description}</p>
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Auteurs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publication.authors?.map(author => (
              <div key={author.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{author.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{author.name}</p>
                  {author.institution && <p className="text-xs text-gray-500">{author.institution}{author.faculty ? `, ${author.faculty}` : ""}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        {publication.keywords?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Mots‑clés</h3>
            <div className="flex flex-wrap gap-2">
              {publication.keywords.map(kw => <span key={kw.id} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">{kw.keyword}</span>)}
            </div>
          </div>
        )}
        {publication.pdfUrl && (
          <div>
            <a href={getFileUrl(publication.pdfUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium">
              <ExternalLink className="w-4 h-4" /> Télécharger le PDF
            </a>
          </div>
        )}
      </div>


            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Supprimer la publication</h3>
                      <p className="text-xs text-gray-400 truncate max-w-[250px]">{publication.title}</p>
                    </div>
                  </div>
      
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                    <p className="text-sm text-red-800">
                      ⚠️ Cette action est <strong>irréversible</strong>. Les auteurs et mots-clés associés seront également supprimés.
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