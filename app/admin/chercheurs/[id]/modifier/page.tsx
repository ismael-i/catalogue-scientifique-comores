"use client"

import React, { useState, useEffect } from "react"
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
  RotateCcw
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
  laboratoireId: string
  laboratoireName: string
  effectif: string
  publications: string
  partenariats: string
  note: string
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
    laboratoireId: "", laboratoireName: "", effectif: "",
    publications: "", partenariats: "", note: ""
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
  const [laboratoires, setLaboratoires] = useState<LaboratoireOption[]>([])

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
          // laboratoiresApi.findAllSimple()
        ])

        setOriginalData(chercheur)
        setInstitutions(instRes.data || instRes || [])
        // setLaboratoires(laboRes.data || laboRes || [])

        // Remplir le formulaire
        setForm({
          name: chercheur.name || "",
          email: chercheur.email || "",
          phone: chercheur.phone || "",
          specialty: chercheur.specialty || "",
          institutionId: chercheur.institution?.id || "",
          institutionName: chercheur.institution?.name || chercheur.institutionName || "",
          faculty: chercheur.faculty || "",
          laboratoireId: chercheur.laboratoire?.id || "",
          laboratoireName: chercheur.laboratoire?.name || chercheur.laboratoireName || "",
          effectif: chercheur.effectif?.toString() || "",
          publications: chercheur.publications || "",
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

      if (field === "institutionId") {
        const inst = institutions.find(i => i.id === value)
        updated.institutionName = inst?.name || ""
        updated.laboratoireId = ""
        updated.laboratoireName = ""
      }

      if (field === "laboratoireId") {
        const labo = filteredLaboratoires.find(l => l.id === value)
        updated.laboratoireName = labo?.name || ""
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

// labo by institution selectione 
useEffect(() => {
  async function loadLaboratoires() {
    if (!form.institutionId) {
      setFilteredLaboratoires([])
      return
    }

    // Vérifier le cache
    if (laboratoiresCache[form.institutionId]) {
      setFilteredLaboratoires(laboratoiresCache[form.institutionId])
      return
    }

    setLoadingLaboratoires(true)
    try {
      const labos = await laboratoiresApi.findAllSimple(form.institutionId)
      const data = Array.isArray(labos) ? labos : []
      
      // Mettre en cache
      setLaboratoiresCache(prev => ({
        ...prev,
        [form.institutionId]: data
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

  /**
   * Sélection d'une nouvelle photo
   */
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Valider le type
    if (!file.type.startsWith("image/")) {
      setPhotoError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.")
      return
    }

    // Valider la taille (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setPhotoError("L'image ne doit pas dépasser 20MB")
      return
    }

    setPhotoError(null)
    setNewPhotoFile(file)
    setNewPhotoPreview(URL.createObjectURL(file))
    setPhotoAction(PhotoAction.UPLOAD_NEW)
  }

  /**
   * Supprimer la photo (nouvelle ou existante)
   */
  function handleRemovePhoto() {
    // Nettoyer la preview si nouvelle photo
    if (newPhotoPreview) {
      URL.revokeObjectURL(newPhotoPreview)
    }

    setNewPhotoFile(null)
    setNewPhotoPreview(null)
    setPhotoAction(PhotoAction.REMOVE)
    setPhotoError(null)
  }

  /**
   * Annuler les changements sur la photo (revenir à l'original)
   */
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

  /**
   * URL de la photo à afficher dans le preview
   */
  function getDisplayPhotoUrl(): string | null {
    if (photoAction === PhotoAction.REMOVE) return null
    if (photoAction === PhotoAction.UPLOAD_NEW && newPhotoPreview) return newPhotoPreview
    if (photoAction === PhotoAction.KEEP && currentPhotoPath) return getFileUrl(currentPhotoPath)
    return null
  }

  /**
   * Nom du fichier extrait du chemin
   */
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

    // Vérifier les changements formulaire
    return (
      form.name !== (originalData.name || "") ||
      form.email !== (originalData.email || "") ||
      form.phone !== (originalData.phone || "") ||
      form.specialty !== (originalData.specialty || "") ||
      form.institutionId !== (originalData.institution?.id || "") ||
      form.faculty !== (originalData.faculty || "") ||
      form.laboratoireId !== (originalData.laboratoire?.id || "") ||
      form.effectif !== (originalData.effectif?.toString() || "") ||
      form.publications !== (originalData.publications || "") ||
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

    if (!form.specialty.trim()) {
      newErrors.specialty = "La spécialité est obligatoire"
    }

    if (!form.institutionId) {
      newErrors.institutionId = "L'institution est obligatoire"
    }

    if (form.effectif && (isNaN(Number(form.effectif)) || Number(form.effectif) < 0)) {
      newErrors.effectif = "Doit être un nombre positif"
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
        specialty: form.specialty.trim(),
        institutionId: form.institutionId,
        institutionName: form.institutionName,
        faculty: form.faculty.trim() || undefined,
        laboratoireId: form.laboratoireId || undefined,
        laboratoireName: form.laboratoireName || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        publications: form.publications.trim() || undefined,
        partenariats: form.partenariats.trim() || undefined,
        note: form.note.trim() || undefined,
        effectif: form.effectif ? Number(form.effectif) : undefined
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

      // 2a. Supprimer la photo existante si demandé
      if (photoAction === PhotoAction.REMOVE) {
        try {
          await uploadApi.deletePhoto("chercheurs", id, token)
          console.log("✅ Photo supprimée")
        } catch (err) {
          console.error("❌ Erreur suppression photo:", err)
        }
      }

      // 2b. Uploader la nouvelle photo
      if (photoAction === PhotoAction.UPLOAD_NEW && newPhotoFile) {
        try {
          // D'abord supprimer l'ancienne si elle existe
          if (currentPhotoPath) {
            await uploadApi.deletePhoto("chercheurs", id, token)
          }
          // Puis uploader la nouvelle
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

                {/* Affichage photo / placeholder */}
                <div className="relative w-28 h-28">
                  {displayPhotoUrl ? (
                    <>
                      <img
                        src={displayPhotoUrl}
                        alt="Photo chercheur"
                        className="w-28 h-28 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                      />
                      
                      {/* Badge "Nouvelle" */}
                      {photoAction === PhotoAction.UPLOAD_NEW && (
                        <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                          Nouvelle
                        </span>
                      )}

                      {/* Bouton supprimer */}
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
                    /* État : photo supprimée (en attente d'enregistrement) */
                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-red-300 bg-red-50 flex flex-col items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-400 mb-1" />
                      <span className="text-[10px] text-red-500 font-medium">Supprimée</span>
                    </div>
                  ) : (
                    /* État : pas de photo (upload initial) */
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

                {/* Actions sous la photo */}
                <div className="mt-3 space-y-2">
                  {/* Bouton upload (toujours visible sauf si déjà en upload) */}
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

                  {/* Bouton annuler (visible si modification en cours) */}
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

                {/* Messages */}
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
                    Spécialité <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                      errors.specialty ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.specialty && <p className="text-xs text-red-500 mt-1">{errors.specialty}</p>}
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
                  Institution <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.institutionId}
                    onChange={(e) => handleChange("institutionId", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none bg-white transition-all ${
                      errors.institutionId ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <option value="">Sélectionner</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>{inst.acronym} — {inst.name}</option>
                    ))}
                  </select>
                </div>
                {errors.institutionId && <p className="text-xs text-red-500 mt-1">{errors.institutionId}</p>}
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

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Laboratoire
                </label>
                <div className="relative">
                  <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.laboratoireId}
                    onChange={(e) => handleChange("laboratoireId", e.target.value)}
                    disabled={!form.institutionId || loadingLaboratoires}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none transition-all
                      ${!form.institutionId || loadingLaboratoires
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                        : "bg-white border-gray-200"
                      }`}
                  >
                    <option value="">
                      {!form.institutionId
                        ? "Sélectionnez d'abord une institution"
                        : loadingLaboratoires
                          ? "Chargement..."
                          : filteredLaboratoires.length === 0
                            ? "Aucun laboratoire trouvé"
                            : "Sélectionner un laboratoire"
                      }
                    </option>
                    {filteredLaboratoires.map((labo) => (
                      <option key={labo.id} value={labo.id}>
                        {labo.acronym} — {labo.name}
                      </option>
                    ))}
                  </select>

                  {/* Indicateur de chargement */}
                  {loadingLaboratoires && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Messages d'aide */}
                {!form.institutionId && (
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Veuillez sélectionner une institution
                  </p>
                )}
                {form.institutionId && !loadingLaboratoires && filteredLaboratoires.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Aucun laboratoire rattaché à cette institution
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Effectif
                </label>
                <input
                  type="number"
                  value={form.effectif}
                  onChange={(e) => handleChange("effectif", e.target.value)}
                  min="0"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                    errors.effectif ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.effectif && <p className="text-xs text-red-500 mt-1">{errors.effectif}</p>}
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

            {/* PDF actuel conservé */}
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
                  <a                    href={getFileUrl(currentPdfPath)}
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

            {/* PDF marqué pour suppression */}
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

            {/* Nouveau PDF sélectionné */}
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

            {/* Zone d'upload (toujours visible sauf si nouveau PDF déjà sélectionné) */}
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
              CARTE : PUBLICATIONS & PARTENARIATS
              ════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              Recherche & Collaborations
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Publications
                </label>
                <textarea
                  value={form.publications}
                  onChange={(e) => handleChange("publications", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none transition-all"
                />
              </div>

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
            {/* Indicateur de modifications */}
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