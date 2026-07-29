"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { chercheursApi } from "@/lib/api/chercheurs"
import { institutionsApi } from "@/lib/api/institutions"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { uploadApi } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  FlaskConical,
  BookOpen,
  FileText,
  Globe,
  Tag,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  FileUp,
  Download,
  Eye,
  ChevronDown,
  Check,
  Search
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface InstitutionOption {
  id: string
  acronym: string
  name: string
}

interface LaboratoireOption {
  id: string
  acronym: string
  name: string
}

interface FormData {
  name: string
  email: string
  phone: string
  specialty: string
  institutionId: string
  institutionName: string
  faculty: string
  laboratoireIds: string[]
  partenariats: string
  note: string
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  specialty: "",
  institutionId: "",
  institutionName: "",
  faculty: "",
  laboratoireIds: [],
  partenariats: "",
  note: ""
}

// ─── Composant principal ────────────────────────────────
export default function NouveauChercheurPage() {
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()

  // États formulaire
  const [form, setForm] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // États UI
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Données pour sélecteurs
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [filteredLaboratoires, setFilteredLaboratoires] = useState<LaboratoireOption[]>([])
  const [loadingLaboratoires, setLoadingLaboratoires] = useState(false)
  const [laboratoiresCache, setLaboratoiresCache] = useState<Record<string, LaboratoireOption[]>>({})

  // ─── Upload Photo ──────────────────────────────────────
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // ─── Upload PDF Fiche ──────────────────────────────────
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPreviewName, setPdfPreviewName] = useState<string | null>(null)

  // ─── Vérification auth ──────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/chercheurs/nouveau")
    }
  }, [user, authLoading, router])

  // ─── Charger institutions ───────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const instRes = await institutionsApi.findAllSimple()
        setInstitutions(instRes.data || instRes || [])
      } catch (err) {
        console.error("Erreur chargement données:", err)
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  // ─── Gestion changement champ ───────────────────────────
  function handleChange(field: keyof FormData, value: string) {
    setForm(prev => {
      const updated = { ...prev, [field]: value }

      if (field === "institutionId") {
        const inst = institutions.find(i => i.id === value)
        updated.institutionName = inst?.name || ""
      }

      return updated
    })

    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // ─── Dropdown multi-sélection laboratoires ──────────────
  const [labDropdownOpen, setLabDropdownOpen] = useState(false)
  const [labSearch, setLabSearch] = useState("")
  const labDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (labDropdownRef.current && !labDropdownRef.current.contains(e.target as Node)) {
        setLabDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function toggleLaboratoire(labId: string) {
    setForm(prev => ({
      ...prev,
      laboratoireIds: prev.laboratoireIds.includes(labId)
        ? prev.laboratoireIds.filter(lid => lid !== labId)
        : [...prev.laboratoireIds, labId]
    }))

    if (errors.laboratoireIds) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy.laboratoireIds
        return copy
      })
    }
  }

  // ─── Laboratoires disponibles (filtrés par institution si présente) ────
  useEffect(() => {
    async function loadLaboratoires() {
      const cacheKey = form.institutionId || "__all__"

      if (laboratoiresCache[cacheKey]) {
        setFilteredLaboratoires(laboratoiresCache[cacheKey])
        return
      }

      setLoadingLaboratoires(true)
      try {
        const labos = await laboratoiresApi.findAllSimple(form.institutionId || undefined)
        const data = Array.isArray(labos) ? labos : []

        setLaboratoiresCache(prev => ({
          ...prev,
          [cacheKey]: data
        }))

        setFilteredLaboratoires(data)
      } catch (err) {
        setFilteredLaboratoires([])
      } finally {
        setLoadingLaboratoires(false)
      }
    }

    loadLaboratoires()
  }, [form.institutionId]) // eslint-disable-line

  // Réinitialiser la sélection de labos quand l'institution change
  useEffect(() => {
    setForm(prev => ({ ...prev, laboratoireIds: [] }))
  }, [form.institutionId])

  // ─── Gestion photo ──────────────────────────────────────
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, photo: "Format d'image non supporté" }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: "L'image ne doit pas dépasser 10MB" }))
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors(prev => { const copy = { ...prev }; delete copy.photo; return copy })
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  // ─── Gestion PDF ────────────────────────────────────────
  function handlePDFSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, pdf: "Seuls les fichiers PDF sont acceptés" }))
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, pdf: "Le PDF ne doit pas dépasser 20MB" }))
      return
    }

    setPdfFile(file)
    setPdfPreviewName(file.name)
    setErrors(prev => { const copy = { ...prev }; delete copy.pdf; return copy })
  }

  function clearPDF() {
    setPdfFile(null)
    setPdfPreviewName(null)
  }

  // ─── Validation ─────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères"
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (form.laboratoireIds.length === 0) {
      newErrors.laboratoireIds = "Sélectionnez au moins un laboratoire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── Soumission ─────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      setSubmitError("Veuillez corriger les erreurs ci-dessous")
      return
    }

    if (!token) return
    setSaving(true)

    try {
      // Préparer les données du chercheur
      const data: any = {
        name: form.name.trim(),
        specialty: form.specialty.trim() || undefined,
        institutionId: form.institutionId || undefined,
        institutionName: form.institutionId ? form.institutionName : undefined,
        faculty: form.faculty.trim() || undefined,
        laboratoireIds: form.laboratoireIds.length ? form.laboratoireIds : undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        partenariats: form.partenariats.trim() || undefined,
        note: form.note.trim() || undefined
      }

      // Nettoyer les undefined
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key]
      })

      // 1. Créer le chercheur
      const chercheur = await chercheursApi.create(data, token)

      // 2. Upload de la photo (si présente)
      if (photoFile) {
        try {
          await uploadApi.uploadPhoto(photoFile, "chercheurs", chercheur.id, token)
        } catch (err) {
          console.error("Erreur upload photo:", err)
          // Ne pas bloquer
        }
      }

      // 3. Upload du PDF (si présent)
      if (pdfFile) {
        try {
          await uploadApi.uploadPDF(pdfFile, chercheur.id, token)
        } catch (err) {
          console.error("Erreur upload PDF:", err)
          // Ne pas bloquer
        }
      }

      setSuccess(true)

      // Rediriger après un court délai
      setTimeout(() => {
        router.push(`/admin/chercheurs/${chercheur.id}`)
      }, 1500)

    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur lors de la création")
      setSaving(false)
    }
  }

  // ─── Loading ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // ─── Succès ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chercheur créé !</h2>
        <p className="text-gray-500 mb-6">Redirection vers la fiche...</p>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
      </div>
    )
  }

  // ─── Rendu ───────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/chercheurs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau chercheur</h1>
        <p className="text-sm text-gray-400 mt-1">
          Ajoutez un nouveau chercheur au catalogue
        </p>
      </div>

      {/* Erreur de soumission */}
      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* ─── Carte : Identité + Photo ────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Identité
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Photo */}
              <div className="flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Photo
                </label>
                <div className="relative w-24 h-24">
                  {photoPreview ? (
                    <>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
                      />
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                      <Camera className="w-6 h-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      <span className="text-[9px] text-gray-400 mt-1 group-hover:text-blue-500">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
                <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP • Max 10MB</p>
              </div>

              {/* Champs identité */}
              <div className="flex-1 space-y-4">
                {/* Nom */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Dr. Mohamed Ahmed"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email + Téléphone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="chercheur@institution.km"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                          errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+269 3XX XX XX"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
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
                    value={form.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    placeholder="Ex: Mathématiques appliquées, Analyse numérique"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Carte : Rattachement ────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Rattachement institutionnel
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Institution */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Institution
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.institutionId}
                    onChange={(e) => handleChange("institutionId", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none bg-white transition-all"
                  >
                    <option value="">Aucune institution / chercheur externe</option>
                    {institutions.map((inst) => (
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
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.faculty}
                    onChange={(e) => handleChange("faculty", e.target.value)}
                    placeholder="Ex: FST, FSJPEG"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Laboratoires — dropdown multi-sélection avec recherche */}
              <div className="sm:col-span-2" ref={labDropdownRef}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Laboratoires <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLabDropdownOpen(o => !o)}
                    className={`w-full min-h-[46px] px-3 py-2 border rounded-xl text-sm text-left flex flex-wrap items-center gap-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                      errors.laboratoireIds ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    {form.laboratoireIds.length === 0 ? (
                      <span className="text-gray-400">Sélectionner un ou plusieurs laboratoires</span>
                    ) : (
                      filteredLaboratoires
                        .filter((labo) => form.laboratoireIds.includes(labo.id))
                        .map((labo) => (
                          <span
                            key={labo.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                          >
                            {labo.acronym}
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); toggleLaboratoire(labo.id) }}
                              className="hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </span>
                        ))
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform ${labDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {labDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            value={labSearch}
                            onChange={(e) => setLabSearch(e.target.value)}
                            placeholder="Rechercher un laboratoire..."
                            autoFocus
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {loadingLaboratoires ? (
                          <div className="flex items-center gap-2 text-xs text-gray-400 p-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Chargement...
                          </div>
                        ) : filteredLaboratoires.filter((labo) =>
                            `${labo.acronym} ${labo.name}`.toLowerCase().includes(labSearch.toLowerCase())
                          ).length === 0 ? (
                          <p className="text-xs text-gray-400 p-3">Aucun laboratoire trouvé</p>
                        ) : (
                          filteredLaboratoires
                            .filter((labo) =>
                              `${labo.acronym} ${labo.name}`.toLowerCase().includes(labSearch.toLowerCase())
                            )
                            .map((labo) => {
                              const isSelected = form.laboratoireIds.includes(labo.id)
                              return (
                                <button
                                  type="button"
                                  key={labo.id}
                                  onClick={() => toggleLaboratoire(labo.id)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                                    isSelected ? "bg-blue-50/60" : ""
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </span>
                                  <FlaskConical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                  <span className="truncate">{labo.acronym} — {labo.name}</span>
                                </button>
                              )
                            })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.laboratoireIds && (
                  <p className="text-xs text-red-500 mt-1">{errors.laboratoireIds}</p>
                )}
                {form.institutionId && !errors.laboratoireIds && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Filtré par l'institution sélectionnée.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Carte : Fiche PDF ───────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Fiche chercheur (PDF)
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Uploadez la fiche complète du chercheur au format PDF. Ce document sera accessible depuis la page publique du chercheur.
            </p>

            {/* Zone d'upload PDF */}
            {pdfPreviewName ? (
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{pdfPreviewName}</p>
                  <p className="text-xs text-gray-500">
                    {(pdfFile!.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearPDF}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer le PDF"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                  <FileUp className="w-7 h-7 text-red-400 group-hover:text-red-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  Cliquez pour uploader un PDF
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ou glissez-déposez le fichier ici
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                  PDF uniquement • Max 10MB
                </p>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePDFSelect}
                  className="hidden"
                />
              </label>
            )}
            {errors.pdf && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.pdf}
              </p>
            )}
          </div>

          {/* ─── Carte : Partenariats ──────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              Collaborations
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Partenariats
              </label>
              <textarea
                value={form.partenariats}
                onChange={(e) => handleChange("partenariats", e.target.value)}
                placeholder="Listez les partenariats et collaborations..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* ─── Carte : Notes internes ───────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              Notes internes
            </h2>

            <textarea
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Notes visibles uniquement par les administrateurs..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none transition-all"
            />
          </div>

          {/* ─── Boutons d'action ─────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-4 pb-8">
            <Link
              href="/admin/chercheurs"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm shadow-blue-200"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Créer le chercheur
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}