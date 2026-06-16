"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { authApi, type PendingUser } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { ValidateModal } from "@/components/admin/ValidateModal"
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
  Filter,
  ExternalLink
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
type Status = "ALL" | "PENDING" | "VALIDATED" | "ACTIVE" | "REJECTED"

interface UserWithStatus extends PendingUser {
  status: string
  institution?: string
  submittedAt?: string
}

interface StatusConfig {
  label: string
  color: string
  bg: string
  border: string
  icon: React.ReactNode
}

// ─── Configuration des statuts ─────────────────────────
const STATUS_CFG: Record<Exclude<Status, "ALL">, StatusConfig> = {
  PENDING: {
    label: "En attente",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock className="w-3 h-3" />
  },
  VALIDATED: {
    label: "Validé",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <CheckCircle className="w-3 h-3" />
  },
  ACTIVE: {
    label: "Actif",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <UserCheck className="w-3 h-3" />
  },
  REJECTED: {
    label: "Rejeté",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: <UserX className="w-3 h-3" />
  }
}

// ─── Composant Badge Statut ─────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status as keyof typeof STATUS_CFG]
  if (!cfg) return <span className="text-xs text-gray-400">{status}</span>

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── Modal de rejet ─────────────────────────────────────
function RejectModal({ 
  show, 
  userName, 
  onClose, 
  onConfirm, 
  loading 
}: { 
  show: boolean
  userName: string
  onClose: () => void
  onConfirm: (reason: string) => void
  loading: boolean
}) {
  const [reason, setReason] = useState("")

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Rejeter la demande</h3>
            <p className="text-xs text-gray-400">de {userName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Un email sera envoyé au chercheur avec le motif du rejet.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Motif du rejet <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none resize-none text-sm transition-all"
            rows={3}
            placeholder="Ex: Les informations fournies ne correspondent pas à un chercheur reconnu dans notre base..."
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            {reason.length}/500 caractères minimum
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || reason.trim().length < 10 || loading}
            className="px-5 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm shadow-rose-200"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal de détail ────────────────────────────────────
function DetailModal({ 
  show, 
  user, 
  onClose 
}: { 
  show: boolean
  user: UserWithStatus | null
  onClose: () => void
}) {
  if (!show || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center border border-blue-50">
              <span className="text-blue-700 font-bold text-lg">
                {user.name.split(" ").slice(-1)[0]?.[0] ?? "?"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          <StatusBadge status={user.status} />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1">Institution</p>
              <p className="text-sm font-medium text-gray-800">{user.institution || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1">Date demande</p>
              <p className="text-sm font-medium text-gray-800">
                {user.submittedAt 
                  ? new Date(user.submittedAt).toLocaleDateString("fr-FR", { 
                      day: "numeric", month: "long", year: "numeric" 
                    })
                  : new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric"
                    })
                }
              </p>
            </div>
          </div>

          {user.chercheur && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Informations chercheur</h4>
              <div className="space-y-2 text-sm">
                {user.chercheur.specialty && (
                  <p className="text-blue-800">🔬 {user.chercheur.specialty}</p>
                )}
                {user.chercheur.institution && (
                  <p className="text-blue-800">🏛️ {user.chercheur.institution.name}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

// ─── Page principale ────────────────────────────────────
export default function AdminDemandesPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // États
  const [users, setUsers] = useState<UserWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Status>("PENDING")
  const [searchTerm, setSearchTerm] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Modal
  const [rejectModal, setRejectModal] = useState<{
    show: boolean
    userId: string
    userName: string
  }>({ show: false, userId: "", userName: "" })
  const [detailModal, setDetailModal] = useState<{
    show: boolean
    user: UserWithStatus | null
  }>({ show: false, user: null })

  // ─── Dans le composant, ajouter l'état ────────────────────
const [validateModal, setValidateModal] = useState<{
  show: boolean
  userId: string
  userName: string
  userEmail: string
}>({ show: false, userId: "", userName: "", userEmail: "" })

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    rejected: 0
  })

  // ─── Vérification auth ────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/demandes")
    }
  }, [user, authLoading, router])

  // ─── Chargement des données ───────────────────────────
  async function fetchUsers() {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      // Récupérer les inscriptions en attente + tous les utilisateurs
      const [pendingUsers, allUsers] = await Promise.all([
        authApi.getPendingRegistrations(token),
        // Pour les autres statuts, utiliser l'API admin users
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []).catch(() => [])
      ])

      // Fusionner et formater
      const allUsersFormatted: UserWithStatus[] = [
        ...pendingUsers.map(u => ({
          ...u,
          status: "PENDING",
          submittedAt: u.createdAt,
          institution: u.chercheur?.institution?.name || "—"
        })),
        ...allUsers.map((u: any) => ({
          ...u,
          submittedAt: u.createdAt,
          institution: u.chercheur?.institution?.name || "—"
        }))
      ].filter((u, i, arr) => arr.findIndex(x => x.id === u.id) === i) // Dédupliquer

      setUsers(allUsersFormatted)

      // Calculer les stats
      setStats({
        total: allUsersFormatted.length,
        pending: allUsersFormatted.filter(u => u.status === "PENDING").length,
        active: allUsersFormatted.filter(u => u.status === "ACTIVE").length,
        rejected: allUsersFormatted.filter(u => u.status === "REJECTED").length
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchUsers()
  }, [token])

  // ─── Filtrage et recherche ────────────────────────────
  const filtered = useMemo(() => {
    let result = users

    // Filtre par statut
    if (filter !== "ALL") {
      result = result.filter(u => u.status === filter)
    }

    // Recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.institution?.toLowerCase().includes(term)
      )
    }

    return result
  }, [users, filter, searchTerm])

function handleValidated(chercheurId: string) {
  setUsers(prev => prev.map(u => 
    u.id === validateModal.userId ? { ...u, status: "VALIDATED" } : u
  ))
  setValidateModal({ show: false, userId: "", userName: "", userEmail: "" })
}

  async function handleReject(reason: string) {
    if (!token) return
    setProcessingId(rejectModal.userId)

    try {
      await authApi.rejectRegistration(rejectModal.userId, reason, token)
      
      // Mettre à jour localement
      setUsers(prev => prev.map(u => 
        u.id === rejectModal.userId ? { ...u, status: "REJECTED" } : u
      ))
      
      setRejectModal({ show: false, userId: "", userName: "" })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors du rejet")
    } finally {
      setProcessingId(null)
    }
  }

  // ─── Loading state ─────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // ─── Rendu ─────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes d'inscription</h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez les demandes d'accès des chercheurs
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "bg-gray-50", textColor: "text-gray-700", icon: Users },
          { label: "En attente", value: stats.pending, color: "bg-amber-50", textColor: "text-amber-700", icon: Clock, pulse: stats.pending > 0 },
          { label: "Actifs", value: stats.active, color: "bg-emerald-50", textColor: "text-emerald-700", icon: UserCheck },
          { label: "Rejetés", value: stats.rejected, color: "bg-rose-50", textColor: "text-rose-700", icon: UserX },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-semibold">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                  {stat.value}
                  {stat.pulse && (
                    <span className="ml-2 inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.textColor} opacity-30`} />
            </div>
          </div>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <button onClick={fetchUsers} className="text-xs underline mt-1 hover:text-red-800">
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* En-tête avec filtres */}
        <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Inscriptions chercheurs</h2>
            <p className="text-[11px] text-gray-400">Validation des demandes d'accès</p>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {((
              [
                { key: "ALL", label: "Tous" },
                { key: "PENDING", label: STATUS_CFG.PENDING.label },
                { key: "VALIDATED", label: STATUS_CFG.VALIDATED.label },
                { key: "ACTIVE", label: STATUS_CFG.ACTIVE.label },
                { key: "REJECTED", label: STATUS_CFG.REJECTED.label }
              ] as const
            )).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as Status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  filter === key
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {label}
                {key === "PENDING" && stats.pending > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    filter === key ? "bg-white/20 text-white" : "bg-amber-200 text-amber-800"
                  }`}>
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu de la table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-5 py-3">
                    Chercheur
                  </th>
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-4 py-3">
                    Statut
                  </th>
                  <th className="text-right text-[11px] text-gray-400 font-semibold uppercase tracking-wide px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-t border-gray-50 hover:bg-blue-50/30 transition-colors group ${
                      i === filtered.length - 1 ? "" : ""
                    }`}
                  >
                    {/* Colonne Chercheur */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0 border border-blue-50 group-hover:border-blue-200 transition-colors">
                          <span className="text-blue-700 text-xs font-bold">
                            {user.name.split(" ").slice(-1)[0]?.[0] ?? "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-none">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {user.email}
                          </p>
                          {user.institution && user.institution !== "—" && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              🏛️ {user.institution}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Colonne Date */}
                    <td className="px-4 py-4 text-xs text-gray-400 hidden md:table-cell">
                      {user.submittedAt
                        ? new Date(user.submittedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })
                        : new Date(user.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })
                      }
                    </td>

                    {/* Colonne Statut */}
                    <td className="px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* Colonne Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.status === "PENDING" && (
                          <>
                            <button
                                onClick={() => setValidateModal({
                                    show: true,
                                    userId: user.id,
                                    userName: user.name,
                                    userEmail: user.email
                                })}
                                disabled={processingId === user.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                <CheckCircle className="w-3 h-3" />
                                Valider
                                </button>
                            <button
                              onClick={() => setRejectModal({
                                show: true,
                                userId: user.id,
                                userName: user.name
                              })}
                              disabled={processingId === user.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors border border-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3 h-3" />
                              Rejeter
                            </button>
                          </>
                        )}

                        {/* Bouton détail */}
                        <button
                          onClick={() => setDetailModal({ show: true, user })}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                          title="Voir détails"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* État vide */}
          {!loading && filtered.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-gray-300 text-2xl mb-2">🔍</p>
              <p className="text-gray-400 text-sm font-medium">
                {searchTerm ? "Aucun résultat pour cette recherche" : "Aucune demande trouvée"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pied de table */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              {filter !== "ALL" && ` • Filtre: ${STATUS_CFG[filter as keyof typeof STATUS_CFG]?.label || filter}`}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RejectModal
        show={rejectModal.show}
        userName={rejectModal.userName}
        onClose={() => setRejectModal({ show: false, userId: "", userName: "" })}
        onConfirm={handleReject}
        loading={processingId === rejectModal.userId}
      />

      <DetailModal
        show={detailModal.show}
        user={detailModal.user}
        onClose={() => setDetailModal({ show: false, user: null })}
      />
      <ValidateModal
        show={validateModal.show}
        userName={validateModal.userName}
        userEmail={validateModal.userEmail}
        userId={validateModal.userId}
        onClose={() => setValidateModal({ show: false, userId: "", userName: "", userEmail: "" })}
        onValidated={handleValidated}
        />
    </div>
  )
}