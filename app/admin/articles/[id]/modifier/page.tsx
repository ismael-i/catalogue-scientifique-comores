"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi, type ArticleData } from "@/lib/api/articles"
import { chercheursApi, type ChercheurCard } from "@/lib/api/chercheurs"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { uploadApi } from "@/lib/api/upload"
import { getFileUrl } from "@/lib/utils/fileUrl"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft, Save, Plus, X, Loader2, AlertCircle, CheckCircle,
  Camera, Search, RotateCcw, Trash2, User, FlaskConical, Tag
} from "lucide-react"

// ─── Types locaux pour les options ─────────────────────
interface LaboOption {
  id: string
  acronym: string
  name: string
}

export default function ModifierArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  // ─── État article original ──────────────────────────
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loadingArticle, setLoadingArticle] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ─── Formulaire ─────────────────────────────────────
  const [form, setForm] = useState({
    title: "",
    description: "",
    body: [""],
    chercheurId: "",
    laboratoireId: "",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ─── UI ────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ─── Image ─────────────────────────────────────────
  enum PhotoAction {
    KEEP = "keep",
    UPLOAD = "upload",
    REMOVE = "remove",
  }
  const [photoAction, setPhotoAction] = useState<PhotoAction>(PhotoAction.KEEP)
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  // ─── Sélecteurs ────────────────────────────────────
  const [chercheurs, setChercheurs] = useState<ChercheurCard[]>([])
  const [laboratoires, setLaboratoires] = useState<LaboOption[]>([])
  const [searchChercheur, setSearchChercheur] = useState("")
  const [filteredChercheurs, setFilteredChercheurs] = useState<ChercheurCard[]>([])
  const [showChercheurDropdown, setShowChercheurDropdown] = useState(false)

  // ─── Vérification auth ─────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/articles/" + id + "/modifier")
    }
  }, [user, authLoading, router, id])

  // ─── Chargement initial ────────────────────────────
  useEffect(() => {
    if (!token || !id) return

    const load = async () => {
      setLoadingArticle(true)
      try {
        const [articleData, labosData, cherData] = await Promise.all([
          articlesApi.findById(id),
          laboratoiresApi.findAllSimple(),
          chercheursApi.findAll({ limit: 200 }),
        ])

        setArticle(articleData)
        setLaboratoires(labosData || [])
        setChercheurs(cherData.data || [])

        // Remplir le formulaire
        setForm({
          title: articleData.title || "",
          description: articleData.description || "",
          body: articleData.body?.length ? [...articleData.body] : [""],
          chercheurId: articleData.chercheur?.id || "",
          laboratoireId: articleData.laboratoire?.id || "",
          tags: articleData.tags?.map((t) => t.tag) || [],
        })

        // Image
        if (articleData.imageUrl) {
          setCurrentImagePath(articleData.imageUrl)
        }

        // Pré-remplir la recherche auteur si un auteur est déjà associé
        if (articleData.chercheur) {
          setSearchChercheur(articleData.chercheur.name)
        }
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "Article introuvable")
      } finally {
        setLoadingArticle(false)
      }
    }

    load()
  }, [token, id])

  // ─── Filtrer les chercheurs lors de la recherche ──
  useEffect(() => {
    if (!searchChercheur.trim()) {
      setFilteredChercheurs(chercheurs.slice(0, 15))
    } else {
      const q = searchChercheur.toLowerCase()
      setFilteredChercheurs(
        chercheurs
          .filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.specialty?.toLowerCase().includes(q)
          )
          .slice(0, 15)
      )
    }
  }, [searchChercheur, chercheurs])

  // ─── Handlers formulaire ──────────────────────────
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Effacer l'erreur du champ
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Gestion du body (paragraphes)
  const addBodyLine = () =>
    setForm((prev) => ({ ...prev, body: [...prev.body, ""] }))
  const updateBodyLine = (index: number, value: string) => {
    const newBody = [...form.body]
    newBody[index] = value
    setForm((prev) => ({ ...prev, body: newBody }))
  }
  const removeBodyLine = (index: number) => {
    if (form.body.length <= 1) return
    setForm((prev) => ({
      ...prev,
      body: prev.body.filter((_, i) => i !== index),
    }))
  }

  // Gestion des tags
  const addTag = () => {
    const val = newTag.trim()
    if (val && !form.tags.includes(val)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, val] }))
      setNewTag("")
    }
  }
  const removeTag = (tag: string) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))

  // Gestion de l'image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setImageError("Format image requis (JPG, PNG, WebP)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Taille maximale : 10 MB")
      return
    }
    setImageError(null)
    setNewImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setPhotoAction(PhotoAction.UPLOAD)
  }
  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setNewImageFile(null)
    setImagePreview(null)
    setPhotoAction(PhotoAction.REMOVE)
  }
  const handleCancelImageChanges = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setNewImageFile(null)
    setImagePreview(null)
    setPhotoAction(PhotoAction.KEEP)
  }

  // URL à afficher dans l'aperçu
  const displayImageUrl =
    photoAction === PhotoAction.REMOVE
      ? null
      : photoAction === PhotoAction.UPLOAD && imagePreview
      ? imagePreview
      : photoAction === PhotoAction.KEEP && currentImagePath
      ? getFileUrl(currentImagePath)
      : null

  // ─── Validation ───────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = "Titre requis"
    if (!form.description.trim() || form.description.trim().length < 10)
      errs.description = "Description trop courte (min 10 caractères)"
    if (form.body.some((line) => line.trim() === ""))
      errs.body = "Tous les paragraphes doivent être remplis"
    if (form.tags.length === 0) errs.tags = "Ajoutez au moins un tag"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Détection des modifications ─────────────────
  const hasChanges = (): boolean => {
    if (!article) return false
    if (photoAction !== PhotoAction.KEEP) return true

    const originalTags = (article.tags?.map((t) => t.tag) || []).sort()
    const currentTags = [...form.tags].sort()

    return (
      form.title !== article.title ||
      form.description !== article.description ||
      JSON.stringify(form.body.filter((l) => l.trim())) !==
        JSON.stringify(article.body || []) ||
      form.chercheurId !== (article.chercheur?.id || "") ||
      form.laboratoireId !== (article.laboratoire?.id || "") ||
      JSON.stringify(currentTags) !== JSON.stringify(originalTags)
    )
  }

  // ─── Soumission ──────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      setSubmitError("Veuillez corriger les erreurs ci-dessous.")
      return
    }

    if (!token) return
    setSaving(true)

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        body: form.body.filter((line) => line.trim()),
        chercheurId: form.chercheurId || null,
        laboratoireId: form.laboratoireId || null,
        tags: form.tags,
      }

      await articlesApi.update(id, payload, token)

      // Gestion de l'image
      if (photoAction === PhotoAction.REMOVE && currentImagePath) {
        try {
          await uploadApi.deletePhoto("articles", id, token)
        } catch (err) {
          console.error("Erreur suppression image:", err)
        }
      } else if (photoAction === PhotoAction.UPLOAD && newImageFile) {
        try {
          // Supprimer l'ancienne si elle existe
          if (currentImagePath) {
            await uploadApi.deletePhoto("articles", id, token)
          }
          await uploadApi.uploadPhoto(newImageFile, "articles", id, token)
        } catch (err) {
          console.error("Erreur upload image:", err)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/admin/articles/${id}`)
      }, 1500)
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Erreur lors de la modification"
      )
    } finally {
      setSaving(false)
    }
  }

  // Nettoyage blob
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  // ─── États de chargement / erreur ─────────────────
  if (authLoading || loadingArticle) {
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
            <Link
              href="/admin/articles"
              className="text-xs underline mt-1 inline-block"
            >
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Article modifié avec succès
        </h2>
        <p className="text-gray-500">Redirection vers l'article...</p>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mt-4" />
      </div>
    )
  }

  // ─── Rendu du formulaire ──────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/admin/articles/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'article
        </Link>
        <span className="text-xs text-gray-400">
          Modification de <strong>{article?.title}</strong>
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'article</h1>
        <p className="text-sm text-gray-400 mt-1">
          Modifiez les informations de l'article du Fil Info
        </p>
      </div>

      {/* Erreur globale */}
      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ════════════ Carte : Contenu ════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
            </svg>
            Contenu
          </h2>

          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                errors.title ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
              placeholder="Titre de l'article"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Accroche / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none transition-all ${
                errors.description ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
              placeholder="Brève description affichée sur la carte"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Paragraphes (body) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Corps de l'article
            </label>
            <div className="space-y-2">
              {form.body.map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    value={line}
                    onChange={(e) => updateBodyLine(idx, e.target.value)}
                    rows={3}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                      errors.body && line.trim() === ""
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder={`Paragraphe ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeBodyLine(idx)}
                    className="self-start p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer ce paragraphe"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addBodyLine}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un paragraphe
            </button>
            {errors.body && (
              <p className="text-xs text-red-500 mt-1">{errors.body}</p>
            )}
          </div>

          {/* Image d'illustration */}
         {/* Image d'illustration */}
<div>
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
    Image d'illustration
  </label>

  {/* Aperçu actuel */}
  {displayImageUrl && photoAction !== PhotoAction.REMOVE ? (
    <div className="space-y-2">
      <div className="relative inline-block">
        <img
          src={displayImageUrl}
          alt="Illustration"
          className="w-40 h-24 object-cover rounded-xl border-2 border-gray-100"
        />
        {photoAction === PhotoAction.UPLOAD && (
          <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
            Nouvelle
          </span>
        )}
        {/* Bouton supprimer */}
        <button
          type="button"
          onClick={handleRemoveImage}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          title="Supprimer l'image"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Bouton pour changer l'image (upload) */}
      <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
        <Camera className="w-3.5 h-3.5" />
        Changer l'image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </label>
    </div>
  ) : photoAction === PhotoAction.REMOVE ? (
    /* État "supprimée mais pas enregistrée" */
    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
      <AlertCircle className="w-4 h-4 text-amber-500" />
      <p className="text-sm text-amber-700">
        Image supprimée (sera effective après enregistrement)
      </p>
      <button
        type="button"
        onClick={handleCancelImageChanges}
        className="ml-auto text-xs text-amber-600 underline hover:text-amber-800"
      >
        Annuler
      </button>
    </div>
  ) : (
    /* Aucune image → bouton d'upload */
    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        <Camera className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
          Ajouter une image d'illustration
        </p>
        <p className="text-xs text-gray-400">JPG, PNG ou WebP • Max 10 MB</p>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </label>
  )}

  {imageError && (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {imageError}
    </p>
  )}

  {/* Possibilité d'annuler la suppression */}
  {photoAction === PhotoAction.REMOVE && currentImagePath && (
    <button
      type="button"
      onClick={handleCancelImageChanges}
      className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
    >
      <RotateCcw className="w-3 h-3" />
      Annuler la suppression
    </button>
  )}
</div>
        </div>

        {/* ════════════ Carte : Auteur & Laboratoire ════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Auteur &amp; Laboratoire
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auteur (chercheur) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Auteur (chercheur)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchChercheur}
                  onChange={(e) => {
                    setSearchChercheur(e.target.value)
                    setShowChercheurDropdown(true)
                  }}
                  onFocus={() => setShowChercheurDropdown(true)}
                  placeholder="Rechercher un chercheur..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                />
                {/* Dropdown résultats */}
                {showChercheurDropdown && filteredChercheurs.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {filteredChercheurs.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          handleChange("chercheurId", c.id)
                          setSearchChercheur(c.name)
                          setShowChercheurDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors ${
                          form.chercheurId === c.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : ""
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{c.name}</p>
                          {c.laboratoireName && (
                            <p className="text-xs text-gray-400 truncate">
                              {c.laboratoireName}
                            </p>
                          )}
                        </div>
                        {form.chercheurId === c.id && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {form.chercheurId && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange("chercheurId", "")
                    setSearchChercheur("")
                  }}
                  className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Retirer l'auteur
                </button>
              )}
            </div>

            {/* Laboratoire */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Laboratoire
              </label>
              <div className="relative">
                <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={form.laboratoireId}
                  onChange={(e) =>
                    handleChange("laboratoireId", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none bg-white transition-all"
                >
                  <option value="">Aucun laboratoire</option>
                  {laboratoires.map((labo) => (
                    <option key={labo.id} value={labo.id}>
                      {labo.acronym} — {labo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════ Carte : Tags ════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            Tags <span className="text-red-500">*</span>
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Ajouter un tag..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.tags && (
            <p className="text-xs text-red-500 mt-1">{errors.tags}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {form.tags.length === 0 && (
              <p className="text-xs text-gray-400">
                Aucun tag pour le moment
              </p>
            )}
          </div>
        </div>

        {/* ════════════ Actions ════════════ */}
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
              href={`/admin/articles/${id}`}
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
      </form>
    </div>
  )
}