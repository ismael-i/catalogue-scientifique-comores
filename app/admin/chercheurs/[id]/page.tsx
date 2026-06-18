"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { chercheursApi, type ChercheurDetail } from "@/lib/api/chercheurs"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import { SafeImage } from "@/components/ui/SafeImage"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  FlaskConical,
  BookOpen,
  Globe,
  FileText,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Tag
} from "lucide-react"
import { getFileUrl } from "@/lib/utils/fileUrl"

export default function AdminChercheurDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  const [chercheur, setChercheur] = useState<ChercheurDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchChercheur() {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const data = await chercheursApi.findById(id)
        setChercheur(data)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Chercheur non trouvé")
      } finally {
        setLoading(false)
      }
    }
    if (token && id) fetchChercheur()
  }, [token, id])

  async function handleDelete() {
    if (!token) return
    setDeleting(true)
    try {
      await chercheursApi.delete(id, token)
      router.push("/admin/chercheurs")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
      setDeleting(false)
      setDeleteModal(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error || !chercheur) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error || "Chercheur non trouvé"}</p>
            <Link href="/admin/chercheurs" className="text-xs underline mt-1 inline-block">
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/chercheurs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/chercheurs/${id}/modifier`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Modifier
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* En-tête */}
        <div className="p-6 sm:p-8 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-30 h-30 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-50">
              {/* {chercheur.photoUrl ? (
                <img
                  src={chercheur.photoUrl}
                  alt={chercheur.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-blue-400" />
              )} */}
              <SafeImage src={chercheur.photoUrl} alt={chercheur.name} size="lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{chercheur.name}</h1>
              <p className="text-gray-500 mt-1">{chercheur.specialty}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {chercheur.institution && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    <Building2 className="w-3 h-3" />
                    {chercheur.institution.acronym} — {chercheur.institution.name}
                  </span>
                )}
                {chercheur.faculty && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                    <BookOpen className="w-3 h-3" />
                    {chercheur.faculty}
                  </span>
                )}
                {chercheur.laboratoire && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    <FlaskConical className="w-3 h-3" />
                    {chercheur.laboratoire.acronym} — {chercheur.laboratoire.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Contact
            </h3>
            <div className="space-y-3">
              {chercheur.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-semibold">Email</p>
                    <a href={`mailto:${chercheur.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {chercheur.email}
                    </a>
                  </div>
                </div>
              )}
              {chercheur.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-semibold">Téléphone</p>
                    <a href={`tel:${chercheur.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {chercheur.phone}
                    </a>
                  </div>
                </div>
              )}
              {!chercheur.email && !chercheur.phone && (
                <p className="text-sm text-gray-400">Aucune information de contact</p>
              )}
            </div>
          </div>

          {/* Informations académiques */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              Informations académiques
            </h3>
            <div className="space-y-3">
              {chercheur.effectif && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-semibold">Effectif laboratoire</p>
                    <p className="text-sm text-gray-700">{chercheur.effectif} chercheurs</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publications */}
          {chercheur.publications && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Publications
              </h3>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{chercheur.publications}</p>
              </div>
            </div>
          )}

          {/* Partenariats */}
          {chercheur.partenariats && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Partenariats
              </h3>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{chercheur.partenariats}</p>
              </div>
            </div>
          )}

          {/* Notes internes */}
          {chercheur.note && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                Notes internes
              </h3>
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                <p className="text-sm text-yellow-800 whitespace-pre-wrap">{chercheur.note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
          <span>ID: {chercheur.id}</span>
          {chercheur.fiche && (
            <Link href={getFileUrl(chercheur.fiche)} className="text-blue-600 hover:text-blue-800">
              Fiche complète →
            </Link>
          )}
        </div>
      </div>

      {/* Modal suppression */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer {chercheur.name} ?</h3>
                <p className="text-xs text-gray-400">Action irréversible</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Icône Users manquante dans les imports
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}