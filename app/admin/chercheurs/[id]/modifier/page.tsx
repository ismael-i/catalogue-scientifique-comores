"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { chercheursApi, type ChercheurDetail } from "@/lib/api/chercheurs"
import { institutionsApi } from "@/lib/api/institutions"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { uploadApi } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/client"
import { getFileUrl } from "@/lib/utils/fileUrl"
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
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  Trash2,
  Eye,
  FileUp,
  ImagePlus,
  RotateCcw,
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

// ─── Helper : comparaison de tableaux sans tenir compte de l'ordre ──
function arraysEqualUnordered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((v, i) => v === sortedB[i])
}

// ─── Composant principal ────────────────────────────────
export default function ModifierChercheurPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  // États formulaire
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", specialty: "",
    institutionId: "", institutionName: "", faculty: "",
    laboratoireIds: [], partenariats: "", note: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalData, setOriginalData] = useState<ChercheurDetail | null>(null)

  // États UI
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Données pour sélecteurs
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([])

  const [filteredLaboratoires, setFilteredLaboratoires] = useState<LaboratoireOption[]>([])
  const [loadingLaboratoires, setLoadingLaboratoires] = useState(false)
  const [laboratoiresCache, setLaboratoiresCache] = useState<Record<string, LaboratoireOption[]>>({})

  // ─── GESTION PHOTO ────────────────────────────────────
  enum PhotoAction {
    KEEP = "keep",           // Garder la photo actuelle (aucun changement)
    UPLOAD_NEW = "upload",   // Uploader une nouvelle photo
    REMOVE = "remove"        // Supprimer la photo
  }

  const [photoAction, setPhotoAction] = useState<PhotoAction>(PhotoAction.KEEP)
  const [currentPhotoPath, setCurrentPhotoPath] = useState<string | null>(null)
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  // ─── GESTION PDF ──────────────────────────────────────
  enum PdfAction {
    KEEP = "keep",
    UPLOAD_NEW = "upload",
    REMOVE = "remove"
  }

  const [pdfAction, setPdfAction] = useState<PdfAction>(PdfAction.KEEP)
  const [currentPdfPath, setCurrentPdfPath] = useState<string | null>(null)
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null)
  const [newPdfName, setNewPdfName] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // ─── Vérification auth ──────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // ─── Charger les données ────────────────────────────────
  useEffect(() => {
    async function loadData() {
      if (!token) return
      setLoading(true)

      try {
        const [chercheur, instRes] = await Promise.all([
          chercheursApi.findById(id),
          institutionsApi.findAllSimple(),
        ])

        setOriginalData(chercheur)
        setInstitutions(instRes.data || instRes || [])

        // Remplir le formulaire
        setForm({
          name: chercheur.name || "",
          email: chercheur.email || "",
          phone: chercheur.phone || "",
          specialty: chercheur.specialty || "",
          institutionId: chercheur.institution?.id || "",
          institutionName: chercheur.institution?.name || chercheur.institutionName || "",
          faculty: chercheur.faculty || "",
          laboratoireIds: chercheur.laboratoires?.map(l => l.id) || [],
          partenariats: chercheur.partenariats || "",
          note: chercheur.note || ""
        })

        // Photo actuelle
        if (chercheur.photoUrl) {
          setCurrentPhotoPath(chercheur.photoUrl)
        }

        // PDF actuel
        if (chercheur.fiche) {
          setCurrentPdfPath(chercheur.fiche)
        }

      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "Chercheur non trouvé")
      } finally {
        setLoading(false)
      }
    }

    if (token && id) loadData()
  }, [token, id])

  // ─── Gestion changement champ ───────────────────────────
  function handleChange(field: keyof FormData, value: string) {
    setForm(prev => {
      const updated = { ...prev, [field]: value }

      // Changer d'institution réinitialise la sélection de labos
      // (action déclenchée par l'utilisateur uniquement, pas par le chargement initial
      // qui utilise setForm directement dans loadData ci-dessus)
      if (field === "institutionId") {
        const inst = institutions.find(i => i.id === value)
        updated.institutionName = inst?.name || ""
        updated.laboratoireIds = []
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

  // labo by institution selectionnée (ou tous si aucune institution)
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

  // ─── GESTION PHOTO ──────────────────────────────────────

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setPhotoError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setPhotoError("L'image ne doit pas dépasser 20MB")
      return
    }

    setPhotoError(null)
    setNewPhotoFile(file)
    setNewPhotoPreview(URL.createObjectURL(file))
    setPhotoAction(PhotoAction.UPLOAD_NEW)
  }

  function handleRemovePhoto() {
    if (newPhotoPreview) {
      URL.revokeObjectURL(newPhotoPreview)
    }

    setNewPhotoFile(null)
    setNewPhotoPreview(null)
    setPhotoAction(PhotoAction.REMOVE)
    setPhotoError(null)
  }

  function handleCancelPhotoChanges() {
    if (newPhotoPreview) {
      URL.revokeObjectURL(newPhotoPreview)
    }

    setNewPhotoFile(null)
    setNewPhotoPreview(null)
    setPhotoAction(PhotoAction.KEEP)
    setPhotoError(null)
  }

  // ─── GESTION PDF ────────────────────────────────────────

  function handlePDFSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setPdfError("Seuls les fichiers PDF sont acceptés")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setPdfError("Le PDF ne doit pas dépasser 20MB")
      return
    }

    setPdfError(null)
    setNewPdfFile(file)
    setNewPdfName(file.name)
    setPdfAction(PdfAction.UPLOAD_NEW)
  }

  function handleRemovePDF() {
    setNewPdfFile(null)
    setNewPdfName(null)
    setPdfAction(PdfAction.REMOVE)
    setPdfError(null)
  }

  function handleCancelPDFChanges() {
    setNewPdfFile(null)
    setNewPdfName(null)
    setPdfAction(PdfAction.KEEP)
    setPdfError(null)
  }

  // ─── Helpers d'affichage ────────────────────────────────

  function getDisplayPhotoUrl(): string | null {
    if (photoAction === PhotoAction.REMOVE) return null
    if (photoAction === PhotoAction.UPLOAD_NEW && newPhotoPreview) return newPhotoPreview
    if (photoAction === PhotoAction.KEEP && currentPhotoPath) return getFileUrl(currentPhotoPath)
    return null
  }

  function getFileNameFromPath(filePath: string): string {
    return filePath.split("/").pop() || "fichier"
  }

  // ─── Détecter les modifications ─────────────────────────
  function hasChanges(): boolean {
    if (!originalData) return false

    // Vérifier les changements photo
    if (photoAction !== PhotoAction.KEEP) return true

    // Vérifier les changements PDF
    if (pdfAction !== PdfAction.KEEP) return true

    const originalLaboratoireIds = originalData.laboratoires?.map(l => l.id) || []

    // Vérifier les changements formulaire
    return (
      form.name !== (originalData.name || "") ||
      form.email !== (originalData.email || "") ||
      form.phone !== (originalData.phone || "") ||
      form.specialty !== (originalData.specialty || "") ||
      form.institutionId !== (originalData.institution?.id || "") ||
      form.faculty !== (originalData.faculty || "") ||
      !arraysEqualUnordered(form.laboratoireIds, originalLaboratoireIds) ||
      form.partenariats !== (originalData.partenariats || "") ||
      form.note !== (originalData.note || "")
    )
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
      // 1. Mettre à jour les données du chercheur
      const data: any = {
        name: form.name.trim(),
        specialty: form.specialty.trim() || undefined,
        institutionId: form.institutionId || undefined,
        institutionName: form.institutionId ? form.institutionName : undefined,
        faculty: form.faculty.trim() || undefined,
        laboratoireIds: form.laboratoireIds,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        partenariats: form.partenariats.trim() || undefined,
        note: form.note.trim() || undefined
      }

      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key]
      })

      await chercheursApi.update(id, data, token)

      // 2. Gérer la photo
      //    ┌─────────────────────────────────────────────────┐
      //    │  PHOTO ACTION                                   │
      //    │  ├─ KEEP      → Ne rien faire                   │
      //    │  ├─ UPLOAD    → Uploader la nouvelle photo      │
      //    │  └─ REMOVE    → Supprimer la photo actuelle     │
      //    └─────────────────────────────────────────────────┘

      if (photoAction === PhotoAction.REMOVE) {
        try {
          await uploadApi.deletePhoto("chercheurs", id, token)
          console.log("✅ Photo supprimée")
        } catch (err) {
          console.error("❌ Erreur suppression photo:", err)
        }
      }

      if (photoAction === PhotoAction.UPLOAD_NEW && newPhotoFile) {
        try {
          if (currentPhotoPath) {
            await uploadApi.deletePhoto("chercheurs", id, token)
          }
          await uploadApi.uploadPhoto(newPhotoFile, "chercheurs", id, token)
          console.log("✅ Nouvelle photo uploadée")
        } catch (err) {
          console.error("❌ Erreur upload photo:", err)
        }
      }

      // 3. Gérer le PDF
      //    ┌─────────────────────────────────────────────────┐
      //    │  PDF ACTION                                     │
      //    │  ├─ KEEP      → Ne rien faire                   │
      //    │  ├─ UPLOAD    → Uploader le nouveau PDF         │
      //    │  └─ REMOVE    → Supprimer le PDF actuel         │
      //    └─────────────────────────────────────────────────┘

      if (pdfAction === PdfAction.REMOVE) {
        try {
          await uploadApi.deletePDF(id, token)
          console.log("✅ PDF supprimé")
        } catch (err) {
          console.error("❌ Erreur suppression PDF:", err)
        }
      }

      if (pdfAction === PdfAction.UPLOAD_NEW && newPdfFile) {
        try {
          if (currentPdfPath) {
            await uploadApi.deletePDF(id, token)
          }
          await uploadApi.uploadPDF(newPdfFile, id, token)
          console.log("✅ Nouveau PDF uploadé")
        } catch (err) {
          console.error("❌ Erreur upload PDF:", err)
        }
      }

      // 4. Succès !
      setSuccess(true)

      setTimeout(() => {
        router.push(`/admin/chercheurs/${id}`)
      }, 1500)

    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  // ─── Nettoyage des URL blob au démontage ────────────────
  useEffect(() => {
    return () => {
      if (newPhotoPreview) URL.revokeObjectURL(newPhotoPreview)
    }
  }, [newPhotoPreview])

  // ─── Loading / Erreur ───────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{loadError}</p>
            <Link href="/admin/chercheurs" className="text-xs underline mt-1 inline-block">
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Modifications enregistrées !</h2>
        <p className="text-gray-500 mb-6">Redirection vers la fiche...</p>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
      </div>
    )
  }

  // ─── RENDU ──────────────────────────────────────────────
  const displayPhotoUrl = getDisplayPhotoUrl()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/admin/chercheurs/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la fiche
        </Link>

        {originalData && (
          <span className="text-xs text-gray-400">
            Modification de <strong>{originalData.name}</strong>
          </span>
        )}
      </div>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Modifier le chercheur</h1>
        <p className="text-sm text-gray-400 mt-1">
          Modifiez les informations, la photo et la fiche PDF
        </p>
      </div>

      {/* Erreur */}
      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">

          {/* ════════════════════════════════════════════════
              CARTE : IDENTITÉ + PHOTO
              ════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Identité & Photo
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">

              {/* ─── Zone Photo ─────────────────────────── */}
              <div className="flex-shrink-0">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Photo
                </label>

                <div className="relative w-28 h-28">
                  {displayPhotoUrl ? (
                    <>
                      <img
                        src={displayPhotoUrl}
                        alt="Photo chercheur"
                        className="w-28 h-28 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                      />

                      {photoAction === PhotoAction.UPLOAD_NEW && (
                        <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                          Nouvelle
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                        title="Supprimer la photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : photoAction === PhotoAction.REMOVE ? (
                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-red-300 bg-red-50 flex flex-col items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-400 mb-1" />
                      <span className="text-[10px] text-red-500 font-medium">Supprimée</span>
                    </div>
                  ) : (
                    <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                      <Camera className="w-7 h-7 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      <span className="text-[10px] text-gray-400 mt-1 group-hover:text-blue-500">
                        Ajouter
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {photoAction !== PhotoAction.UPLOAD_NEW && (
                    <label className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      photoAction === PhotoAction.REMOVE
                        ? "border border-gray-200 text-gray-500 hover:bg-gray-50"
                        : "border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    }`}>
                      <ImagePlus className="w-3.5 h-3.5" />
                      {currentPhotoPath ? "Changer" : "Uploader"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}

                  {photoAction !== PhotoAction.KEEP && (
                    <button
                      type="button"
                      onClick={handleCancelPhotoChanges}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Annuler
                    </button>
                  )}
                </div>

                {photoError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {photoError}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">
                  JPG, PNG, WebP • Max 20MB
                </p>
              </div>

              {/* ─── Champs identité ────────────────────── */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Spécialité
                  </label>
                  <input
                    type="text"
                    value={form.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              CARTE : RATTACHEMENT
              ════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Rattachement institutionnel
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <option key={inst.id} value={inst.id}>{inst.acronym} — {inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>

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

          {/* ════════════════════════════════════════════════
              CARTE : FICHE PDF
              ════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Fiche chercheur (PDF)
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Gérez la fiche PDF du chercheur. Le document sera accessible publiquement.
            </p>

            {pdfAction === PdfAction.KEEP && currentPdfPath && (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getFileNameFromPath(currentPdfPath)}
                  </p>
                  <p className="text-xs text-green-600">Fiche actuelle (conservée)</p>
                </div>
                <div className="flex items-center gap-1">
                  <a href={getFileUrl(currentPdfPath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir le PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={handleRemovePDF}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer le PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {pdfAction === PdfAction.REMOVE && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-700 font-medium">PDF supprimé</p>
                  <p className="text-xs text-amber-600">Sera effectif après enregistrement</p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelPDFChanges}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}

            {pdfAction === PdfAction.UPLOAD_NEW && newPdfFile && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{newPdfName}</p>
                  <p className="text-xs text-blue-600">
                    Nouveau fichier • {(newPdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCancelPDFChanges}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Annuler"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {pdfAction !== PdfAction.UPLOAD_NEW && (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                  <FileUp className="w-4 h-4" />
                  {currentPdfPath ? "Remplacer le PDF" : "Uploader un PDF"}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
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

            {pdfError && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {pdfError}
              </p>
            )}
          </div>

          {/* ════════════════════════════════════════════════
              CARTE : PARTENARIATS
              ════════════════════════════════════════════════ */}
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
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              CARTE : NOTES INTERNES
              ════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              Notes internes
            </h2>

            <textarea
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none transition-all"
            />
          </div>

          {/* ════════════════════════════════════════════════
              BOUTONS D'ACTION
              ════════════════════════════════════════════════ */}
          <div className="flex items-center justify-between pt-4 pb-8">
            <div>
              {hasChanges() ? (
                <p className="text-xs text-amber-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Modifications non enregistrées
                </p>
              ) : (
                <p className="text-xs text-gray-400">Aucune modification</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/chercheurs/${id}`}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving || !hasChanges()}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm shadow-blue-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}