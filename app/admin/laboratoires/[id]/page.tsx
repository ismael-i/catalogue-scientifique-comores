"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { laboratoiresApi, type LaboratoireDetail } from "@/lib/api/laboratoires"
import { chercheursApi, type ChercheurCard } from "@/lib/api/chercheurs"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FlaskConical,
  Users,
  Building2,
  Globe,
  Phone,
  Mail,
  Tag,
  User,
  UserCheck,
  UserPlus,
  X,
  Check,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  BookOpen,
  FileText,
  MapPin
} from "lucide-react"

// ─── Configuration des badges ────────────────────────────
type LabCategorie = "Sciences" | "Environnement" | "Santé" | "Économie" | "Lettres"

const BADGE_COLORS: Record<LabCategorie, string> = {
  Sciences:      "bg-blue-50 text-blue-600 border-blue-100",
  Environnement: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Santé:         "bg-rose-50 text-rose-600 border-rose-100",
  Économie:      "bg-amber-50 text-amber-600 border-amber-100",
  Lettres:       "bg-violet-50 text-violet-600 border-violet-100",
}

// ─── Composant principal ─────────────────────────────────
export default function AdminLaboratoireDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  // États du laboratoire
  const [laboratoire, setLaboratoire] = useState<LaboratoireDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // États suppression
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

    // ─── Pagination chercheurs ──────────────────────────────
  const [chercheursPage, setChercheursPage] = useState(1)
  const CHERCHEURS_PER_PAGE = 10

  // ─── Gestion du responsable ────────────────────────────
  const [showResponsableModal, setShowResponsableModal] = useState(false)
  const [searchResponsable, setSearchResponsable] = useState("")
  const [searchResults, setSearchResults] = useState<ChercheurCard[]>([])
  const [searchingResponsable, setSearchingResponsable] = useState(false)
  const [assigningResponsable, setAssigningResponsable] = useState(false)
  const [responsableError, setResponsableError] = useState<string | null>(null)

  // ─── Vérification auth ──────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // ─── Charger le laboratoire ────────────────────────────
  const fetchLaboratoire = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const data = await laboratoiresApi.findById(id)
      setLaboratoire(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Laboratoire non trouvé")
    } finally {
      setLoading(false)
    }
  }, [token, id])

  useEffect(() => {
    if (token && id) fetchLaboratoire()
  }, [token, id, fetchLaboratoire])
  // Reset pagination quand on change de laboratoire (ex: changement d'id)
  useEffect(() => {
    setChercheursPage(1)
  }, [id])

  // ─── Recherche de chercheurs pour responsable ──────────
  const searchChercheursForResponsable = useCallback(async (query: string) => {
    if (!token || query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchingResponsable(true)
    try {
      const result = await chercheursApi.findAll({
        search: query,
        limit: 10,
        laboratoire: laboratoire?.id
      })
      setSearchResults(result.data)
    } catch (err) {
      console.error("Erreur recherche:", err)
    } finally {
      setSearchingResponsable(false)
    }
  }, [token, laboratoire?.institution?.id])

  // Debounce recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showResponsableModal) {
        searchChercheursForResponsable(searchResponsable)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchResponsable, showResponsableModal, searchChercheursForResponsable])

  // ─── Assigner un responsable ───────────────────────────
  async function handleAssignResponsable(chercheurId: string) {
    if (!token) return

    setAssigningResponsable(true)
    setResponsableError(null)

    try {
      await laboratoiresApi.update(id, { responsableId: chercheurId }, token)
      await fetchLaboratoire()
      setShowResponsableModal(false)
      setSearchResponsable("")
      setSearchResults([])
    } catch (err) {
      setResponsableError(err instanceof ApiError ? err.message : "Erreur lors de l'assignation")
    } finally {
      setAssigningResponsable(false)
    }
  }

  // ─── Retirer le responsable ────────────────────────────
  async function handleRemoveResponsable() {
    if (!token) return

    try {
      await laboratoiresApi.update(id, { responsableId: null }, token)
      await fetchLaboratoire()
    } catch (err) {
      console.error("Erreur retrait responsable:", err)
    }
  }

  // ─── Suppression ───────────────────────────────────────
  async function handleDelete() {
    if (!token) return
    setDeleting(true)

    try {
      await laboratoiresApi.delete(id, token)
      router.push("/admin/laboratoires")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression")
      setDeleting(false)
      setDeleteModal(false)
    }
  }

  // ─── Helper : Obtenir l'institution name ───────────────
  const institutionName = laboratoire?.institution?.name || "—"
  const institutionAcronym = laboratoire?.institution?.acronym || "—"

  const totalChercheurs = laboratoire?.chercheurs?.length || 0
  const totalChercheursPages = Math.max(1, Math.ceil(totalChercheurs / CHERCHEURS_PER_PAGE))
  const paginatedChercheurs = laboratoire?.chercheurs?.slice(
    (chercheursPage - 1) * CHERCHEURS_PER_PAGE,
    chercheursPage * CHERCHEURS_PER_PAGE
  ) || []

  function goToChercheursPage(page: number) {
    if (page < 1 || page > totalChercheursPages) return
    setChercheursPage(page)
  }
  // ─── Loading ────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // ─── Erreur ─────────────────────────────────────────────
  if (error || !laboratoire) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error || "Laboratoire non trouvé"}</p>
            <Link href="/admin/laboratoires" className="text-xs underline mt-1 inline-block">
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── RENDU ──────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/laboratoires"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/laboratoires/${id}/modifier`}
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

      {/* ════════════════════════════════════════════════
          EN-TÊTE DU LABORATOIRE
          ════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 sm:p-8 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-50">
              {laboratoire.logo ? (
                <img
                  src={getFileUrl(laboratoire.logo)}
                  alt={laboratoire.acronym}
                  className="w-20 h-20 rounded-2xl object-contain p-2"
                />
              ) : (
                <FlaskConical className="w-10 h-10 text-blue-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-wide uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {laboratoire.acronym}
                </span>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${BADGE_COLORS[laboratoire.categorie as LabCategorie] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {laboratoire.categorie}
                </span>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                  laboratoire.statut === "Actif"
                    ? "bg-green-50 text-green-600 border border-green-100"
                    : "bg-gray-50 text-gray-500 border border-gray-200"
                }`}>
                  {laboratoire.statut}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mt-1">{laboratoire.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {institutionAcronym} — {institutionName}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="w-4 h-4 text-gray-400" />
                  {laboratoire.researchers} chercheur{laboratoire.researchers > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 sm:p-8">
          <p className="text-sm text-gray-600 leading-relaxed">{laboratoire.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ════════════════════════════════════════════════
            COLONNE GAUCHE : INFOS
            ════════════════════════════════════════════════ */}
        <div className="lg:col-span-1 space-y-6">
          {/* ─── Responsable ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gray-400" />
              Responsable
            </h3>

            {laboratoire.responsable ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {laboratoire.responsable.photoUrl ? (
                      <img
                        src={getFileUrl(laboratoire.responsable.photoUrl)}
                        alt={laboratoire.responsable.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {laboratoire.responsable.name}
                    </p>
                    {laboratoire.responsable.email && (
                      <p className="text-xs text-gray-500 truncate">{laboratoire.responsable.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResponsableModal(true)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Changer
                  </button>
                  <button
                    onClick={handleRemoveResponsable}
                    className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Retirer
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-3">Aucun responsable assigné</p>
                <button
                  onClick={() => setShowResponsableModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Assigner un responsable
                </button>
              </div>
            )}
          </div>

          {/* ─── Contact ──────────────────────────────── */}
          {(laboratoire.contactEmail || laboratoire.contactTelephone || laboratoire.contactSite) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Contact
              </h3>
              <div className="space-y-3">
                {laboratoire.contactEmail && (
                  <a
                    href={`mailto:${laboratoire.contactEmail}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <Mail className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-sm text-blue-600 group-hover:text-blue-700 truncate">
                      {laboratoire.contactEmail}
                    </span>
                  </a>
                )}
                {laboratoire.contactTelephone && (
                  <a
                    href={`tel:${laboratoire.contactTelephone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-sm text-gray-700">{laboratoire.contactTelephone}</span>
                  </a>
                )}
                {laboratoire.contactSite && (
                  <a
                    href={laboratoire.contactSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-sm text-blue-600 group-hover:text-blue-700 truncate">
                      Site web
                    </span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ─── Thématiques ──────────────────────────── */}
          {laboratoire.thematiques && laboratoire.thematiques.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                Thématiques
              </h3>
              <div className="flex flex-wrap gap-2">
                {laboratoire.thematiques.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ─── Partenariats ─────────────────────────── */}
          {laboratoire.partenariats && laboratoire.partenariats.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Partenariats
              </h3>
              <div className="space-y-2">
                {laboratoire.partenariats.map((partenaire, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                    {partenaire}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════
            COLONNE DROITE : CHERCHEURS & PUBLICATIONS
            ════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── Chercheurs affiliés ──────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Chercheurs affiliés
              </h3>
              <span className="text-xs text-gray-400">
                {totalChercheurs} chercheur{totalChercheurs > 1 ? "s" : ""}
              </span>
            </div>

            {laboratoire.chercheurs && paginatedChercheurs.length > 0 ? (
              <>
              <div className="divide-y divide-gray-50">
                {paginatedChercheurs.map((chercheur) => (
                  <div
                    key={chercheur.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        {chercheur.photoUrl ? (
                          <img
                            src={getFileUrl(chercheur.photoUrl)}
                            alt={chercheur.name}
                            className="w-9 h-9 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-blue-700 text-xs font-bold">
                            {chercheur.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{chercheur.name}</p>
                        <p className="text-xs text-gray-500">{chercheur.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {chercheur.email && (
                        <a
                          href={`mailto:${chercheur.email}`}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title={chercheur.email}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link
                        href={`/admin/chercheurs/${chercheur.id}`}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    
                  </div>
                ))}
              </div>
                          {/* ─── Contrôles de pagination ────────────── */}
              {totalChercheursPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50 bg-gray-50/50">
                  <p className="text-xs text-gray-400">
                    Page {chercheursPage} sur {totalChercheursPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToChercheursPage(chercheursPage - 1)}
                      disabled={chercheursPage === 1}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      Précédent
                    </button>

                    {Array.from({ length: totalChercheursPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Affiche : première, dernière, et pages proches de la page actuelle
                        return (
                          page === 1 ||
                          page === totalChercheursPages ||
                          Math.abs(page - chercheursPage) <= 1
                        )
                      })
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-1 text-xs text-gray-300">…</span>
                          )}
                          <button
                            onClick={() => goToChercheursPage(page)}
                            className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                              page === chercheursPage
                                ? "bg-blue-600 text-white"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      onClick={() => goToChercheursPage(chercheursPage + 1)}
                      disabled={chercheursPage === totalChercheursPages}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <div className="py-10 text-center">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucun chercheur affilié</p>
              </div>
            )}
          </div>

          {/* ─── Publications ─────────────────────────── */}
          {laboratoire.publications && laboratoire.publications.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Publications récentes
                </h3>
                <span className="text-xs text-gray-400">
                  {laboratoire.publications.length} publication{laboratoire.publications.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {laboratoire.publications.slice(0, 5).map((pub: any) => (
                  <div key={pub.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">{pub.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{pub.year}</span>
                      <span>•</span>
                      <span>{pub.journal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          MODAL : Assigner un responsable
          ════════════════════════════════════════════════ */}
      {showResponsableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowResponsableModal(false)
              setSearchResponsable("")
              setSearchResults([])
            }}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* En-tête modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Assigner un responsable</h3>
                <p className="text-xs text-gray-400">{laboratoire.acronym} — {laboratoire.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowResponsableModal(false)
                  setSearchResponsable("")
                  setSearchResults([])
                }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Recherche */}
            <div className="p-4 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un chercheur par nom ou spécialité..."
                  value={searchResponsable}
                  onChange={(e) => setSearchResponsable(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  autoFocus
                />
              </div>
              {responsableError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {responsableError}
                </p>
              )}
            </div>

            {/* Résultats */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchingResponsable ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((chercheur) => (
                    <button
                      key={chercheur.id}
                      onClick={() => handleAssignResponsable(chercheur.id)}
                      disabled={assigningResponsable}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left disabled:opacity-50"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 text-xs font-bold">
                          {chercheur.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{chercheur.name}</p>
                        <p className="text-xs text-gray-500 truncate">{chercheur.specialty}</p>
                      </div>
                      <Check className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : searchResponsable.length >= 2 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Aucun chercheur trouvé</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Recherchez un chercheur par son nom ou sa spécialité
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <p className="text-xs text-gray-400 text-center">
                Le responsable sera affiché publiquement sur la page du laboratoire
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL : Confirmation suppression
          ════════════════════════════════════════════════ */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer le laboratoire</h3>
                <p className="text-xs text-gray-400">{laboratoire.acronym} — {laboratoire.name}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-800">
                ⚠️ Cette action est <strong>irréversible</strong>. Les chercheurs ne seront pas supprimés mais perdront leur affiliation à ce laboratoire.
              </p>
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