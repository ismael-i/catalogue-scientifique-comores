"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { authApi, type ChercheurSearchResult } from "@/lib/api/auth"
import { institutionsApi } from "@/lib/api/institutions"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import {
  Search,
  CheckCircle,
  UserPlus,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
  Building2,
  FlaskConical,
  Mail,
  Phone,
  User,
  Plus,
  ArrowLeft
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface ValidateModalProps {
  show: boolean
  userName: string
  userEmail: string
  userId: string
  onClose: () => void
  onValidated: (chercheurId: string) => void
}

interface InstitutionSimple {
  id: string
  acronym: string
  name: string
}

interface LaboratoireSimple {
  id: string
  acronym: string
  name: string
}

type Step = "search" | "create"

// ─── Composant principal ────────────────────────────────
export function ValidateModal({ show, userName, userEmail, userId, onClose, onValidated }: ValidateModalProps) {
  const { token } = useAuth()

  // États
  const [step, setStep] = useState<Step>("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ChercheurSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedChercheur, setSelectedChercheur] = useState<ChercheurSearchResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Création nouveau chercheur
  const [institutions, setInstitutions] = useState<InstitutionSimple[]>([])
  const [laboratoires, setLaboratoires] = useState<LaboratoireSimple[]>([])
  const [createForm, setCreateForm] = useState({
    name: userName,
    email: userEmail,
    specialty: "",
    institutionId: "",
    faculty: "",
    laboratoireId: "",
    phone: ""
  })
  const [creating, setCreating] = useState(false)

  // ─── Charger institutions au montage ───────────────────
  useEffect(() => {
    if (show) {
      institutionsApi.findAllSimple()
        .then(data => setInstitutions(data))
        .catch(() => {})
    }
  }, [show])

  // ─── Charger laboratoires quand institution change ──────
  useEffect(() => {
    if (createForm.institutionId) {
      laboratoiresApi.findAllSimple(createForm.institutionId)
        .then(data => setLaboratoires(data))
        .catch(() => {})
    } else {
      setLaboratoires([])
    }
  }, [createForm.institutionId])

  // ─── Recherche de chercheurs ────────────────────────────
  const searchChercheurs = useCallback(async (query: string) => {
    if (!token || query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const results = await authApi.searchChercheurs(query, token)
      setSearchResults(results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }, [token])

  // Debounce recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      searchChercheurs(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchChercheurs])

  // ─── Valider avec le chercheur sélectionné ──────────────
  async function handleValidate() {
    if (!selectedChercheur || !token) return
    
    setValidating(true)
    setError(null)

    try {
      await authApi.validateRegistration(userId, selectedChercheur.id, token)
      onValidated(selectedChercheur.id)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setValidating(false)
    }
  }

  // ─── Créer un nouveau chercheur ─────────────────────────
  async function handleCreateChercheur(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    if (!createForm.specialty || !createForm.institutionId) {
      setError("La spécialité et l'institution sont obligatoires")
      return
    }

    setCreating(true)
    setError(null)

    try {
      const newChercheur = await authApi.createChercheur(createForm, token)
      
      // Valider directement avec le nouveau chercheur
      await authApi.validateRegistration(userId, newChercheur.id, token)
      onValidated(newChercheur.id)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  // ─── Reset au changement de step ────────────────────────
  function goToStep(s: Step) {
    setStep(s)
    setError(null)
  }

  // ─── Si fermé, ne rien rendre ───────────────────────────
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === "create" && (
              <button
                onClick={() => goToStep("search")}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-gray-900">
                {step === "search" ? "Associer un chercheur" : "Créer un nouveau chercheur"}
              </h3>
              <p className="text-xs text-gray-400">
                Validation pour <strong>{userName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "search" ? (
            /* ─── ÉTAPE 1 : RECHERCHE ───────────────────── */
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Recherchez le chercheur correspondant à cette demande d'inscription.
              </p>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou spécialité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                  autoFocus
                />
              </div>

              {/* Résultats */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((chercheur) => (
                    <button
                      key={chercheur.id}
                      onClick={() => setSelectedChercheur(
                        selectedChercheur?.id === chercheur.id ? null : chercheur
                      )}
                      disabled={chercheur.hasAccount}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        chercheur.hasAccount
                          ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                          : selectedChercheur?.id === chercheur.id
                            ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200"
                            : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 text-sm font-bold">
                            {chercheur.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {chercheur.name}
                            </p>
                            {selectedChercheur?.id === chercheur.id && (
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{chercheur.specialty}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {chercheur.institution.acronym}
                            </span>
                            {chercheur.laboratoire && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <FlaskConical className="w-3 h-3" />
                                {chercheur.laboratoire.acronym}
                              </span>
                            )}
                          </div>
                          {chercheur.hasAccount && (
                            <p className="text-[10px] text-amber-600 mt-1">
                              ⚠️ Ce chercheur a déjà un compte
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </div>
                    </button>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-3">Aucun chercheur trouvé</p>
                    <button
                      onClick={() => goToStep("create")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Créer un nouveau chercheur
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Commencez à taper pour rechercher un chercheur existant
                    </p>
                  </div>
                )}
              </div>

              {/* Lien création */}
              {searchResults.length > 0 && (
                <button
                  onClick={() => goToStep("create")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Le chercheur n'existe pas ? Créer un nouveau profil
                </button>
              )}

              {/* Bouton valider */}
              {selectedChercheur && (
                <button
                  onClick={handleValidate}
                  disabled={validating}
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
                >
                  {validating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Valider avec {selectedChercheur.name}
                </button>
              )}
            </div>
          ) : (
            /* ─── ÉTAPE 2 : CRÉATION ─────────────────────── */
            <form onSubmit={handleCreateChercheur} className="space-y-4">
              <p className="text-sm text-gray-600">
                Créez un nouveau profil chercheur qui sera automatiquement lié à ce compte.
              </p>

              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  />
                </div>
              </div>

              {/* Email et Téléphone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Spécialité */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Spécialité / Thématiques <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.specialty}
                  onChange={e => setCreateForm({ ...createForm, specialty: e.target.value })}
                  placeholder="Ex: Mathématiques appliquées, Analyse numérique"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                />
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Institution <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    required
                    value={createForm.institutionId}
                    onChange={e => setCreateForm({ ...createForm, institutionId: e.target.value, laboratoireId: "" })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none bg-white"
                  >
                    <option value="">Sélectionner une institution</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.acronym} — {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Faculté et Laboratoire */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Faculté
                  </label>
                  <input
                    type="text"
                    value={createForm.faculty}
                    onChange={e => setCreateForm({ ...createForm, faculty: e.target.value })}
                    placeholder="Ex: FST"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Laboratoire
                  </label>
                  <div className="relative">
                    <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={createForm.laboratoireId}
                      onChange={e => setCreateForm({ ...createForm, laboratoireId: e.target.value })}
                      disabled={!createForm.institutionId}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Sélectionner</option>
                      {laboratoires.map(labo => (
                        <option key={labo.id} value={labo.id}>
                          {labo.acronym}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bouton créer et valider */}
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
              >
                {creating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                Créer le chercheur et valider l'inscription
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}