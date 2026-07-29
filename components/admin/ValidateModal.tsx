"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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

const AUCUNE_INSTITUTION = "" // valeur du select = "chercheur externe"

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
  const [laboSearch, setLaboSearch] = useState("")
  const [createForm, setCreateForm] = useState({
    name: userName,
    email: userEmail,
    specialty: "",
    institutionId: AUCUNE_INSTITUTION,
    faculty: "",
    laboratoireIds: [] as string[],
    phone: ""
  })
  const [creating, setCreating] = useState(false)

  // ─── Charger institutions ET laboratoires au montage ───
  // Découplé : un chercheur peut choisir un/des labo(s) même sans institution.
  useEffect(() => {
    if (show) {
      institutionsApi.findAllSimple()
        .then(data => setInstitutions(data))
        .catch(() => {})
      laboratoiresApi.findAllSimple()
        .then(data => setLaboratoires(data))
        .catch(() => {})
    }
  }, [show])

  // Réinitialiser le formulaire de création à chaque ouverture
  useEffect(() => {
    if (show) {
      setCreateForm({
        name: userName,
        email: userEmail,
        specialty: "",
        institutionId: AUCUNE_INSTITUTION,
        faculty: "",
        laboratoireIds: [],
        phone: ""
      })
      setLaboSearch("")
    }
  }, [show, userName, userEmail])

  const filteredLaboratoires = useMemo(() => {
    const q = laboSearch.trim().toLowerCase()
    if (!q) return laboratoires
    return laboratoires.filter(
      l => l.acronym.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
    )
  }, [laboratoires, laboSearch])

  const selectedLaboratoires = useMemo(
    () => laboratoires.filter(l => createForm.laboratoireIds.includes(l.id)),
    [laboratoires, createForm.laboratoireIds]
  )

  function toggleLaboratoire(id: string) {
    setCreateForm(prev => ({
      ...prev,
      laboratoireIds: prev.laboratoireIds.includes(id)
        ? prev.laboratoireIds.filter(x => x !== id)
        : [...prev.laboratoireIds, id]
    }))
  }

  function removeLaboratoire(id: string) {
    setCreateForm(prev => ({
      ...prev,
      laboratoireIds: prev.laboratoireIds.filter(x => x !== id)
    }))
  }

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

    if (!createForm.name.trim() || createForm.name.trim().length < 2) {
      setError("Le nom est obligatoire (2 caractères minimum)")
      return
    }
    if (!createForm.specialty) {
      setError("La spécialité est obligatoire")
      return
    }
    if (createForm.laboratoireIds.length === 0) {
      setError("Au moins un laboratoire est obligatoire")
      return
    }
    // Note : institutionId n'est PAS obligatoire — chercheur externe autorisé

    setCreating(true)
    setError(null)

    try {
      const payload = {
        ...createForm,
        institutionId: createForm.institutionId || undefined
      }
      const newChercheur = await authApi.createChercheur(payload, token)

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
                  searchResults.map((chercheur) => {
                    // Affichage défensif : institution et laboratoires sont optionnels
                    const laboAcronymes = (chercheur.laboratoires ?? [])
                      .map(l => l.acronym)
                      .join(", ")

                    return (
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
                              {chercheur.institution ? (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {chercheur.institution.acronym}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">
                                  Chercheur externe
                                </span>
                              )}
                              {laboAcronymes && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <FlaskConical className="w-3 h-3" />
                                  {laboAcronymes}
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
                    )
                  })
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
                    minLength={2}
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
                  Spécialité / Thématiques
                </label>
                <input
                  type="text"
                  value={createForm.specialty}
                  onChange={e => setCreateForm({ ...createForm, specialty: e.target.value })}
                  placeholder="Ex: Mathématiques appliquées, Analyse numérique"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                />
              </div>

              {/* Institution — désormais OPTIONNELLE */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Institution
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={createForm.institutionId}
                    onChange={e => setCreateForm({ ...createForm, institutionId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none bg-white"
                  >
                    <option value={AUCUNE_INSTITUTION}>Aucune institution / chercheur externe</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.acronym} — {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Faculté */}
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

              {/* Laboratoires — multi-sélection avec recherche + chips */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Laboratoire(s) <span className="text-red-500">*</span>
                </label>

                {/* Chips des labos sélectionnés */}
                {selectedLaboratoires.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedLaboratoires.map(labo => (
                      <span
                        key={labo.id}
                        className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {labo.acronym}
                        <button
                          type="button"
                          onClick={() => removeLaboratoire(labo.id)}
                          className="w-4 h-4 rounded-full hover:bg-blue-200 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Recherche + liste */}
                <div className="relative">
                  <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={laboSearch}
                    onChange={e => setLaboSearch(e.target.value)}
                    placeholder="Rechercher un laboratoire..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  />
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {filteredLaboratoires.length > 0 ? (
                    filteredLaboratoires.map(labo => {
                      const checked = createForm.laboratoireIds.includes(labo.id)
                      return (
                        <button
                          key={labo.id}
                          type="button"
                          onClick={() => toggleLaboratoire(labo.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                            checked ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>
                            <strong>{labo.acronym}</strong>
                            <span className="text-gray-400"> — {labo.name}</span>
                          </span>
                          {checked && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-3">Aucun laboratoire trouvé</p>
                  )}
                </div>
                {createForm.laboratoireIds.length === 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Au moins un laboratoire est requis pour créer une publication ou un article.
                  </p>
                )}
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