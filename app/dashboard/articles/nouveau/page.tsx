"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi } from "@/lib/api/articles"
import { chercheursApi, type ChercheurDetail } from "@/lib/api/chercheurs"
import { uploadApi } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft, Save, Plus, X, Loader2, AlertCircle, CheckCircle,
  Camera, Tag
} from "lucide-react"

export default function NouvelArticleChercheurPage() {
  const router = useRouter()
  const { user, token } = useAuth()

  // Formulaire
  const [form, setForm] = useState({
    title: "",
    description: "",
    body: [""],
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // UI
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Image d'illustration (optionnelle)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

// Profil du chercheur (pour récupérer laboratoireId)
const [chercheur, setChercheur] = useState<ChercheurDetail | null>(null)
const [loadingProfil, setLoadingProfil] = useState(true)
const [selectedLaboratoireId, setSelectedLaboratoireId] = useState("")

// Charger le profil du chercheur connecté
useEffect(() => {
  if (!token || !user?.chercheurId) return
  chercheursApi
    .findById(user.chercheurId)
    .then(data => {
      setChercheur(data)
      // Pré-remplir automatiquement seulement si un seul laboratoire
      if (data.laboratoires && data.laboratoires.length === 1) {
        setSelectedLaboratoireId(data.laboratoires[0].id)
      }
    })
    .catch(console.error)
    .finally(() => setLoadingProfil(false))
}, [token, user])

  // Handlers formulaire
  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
  }

  const addBodyLine = () => setForm(prev => ({ ...prev, body: [...prev.body, ""] }))
  const updateBodyLine = (idx: number, value: string) => {
    const newBody = [...form.body]
    newBody[idx] = value
    setForm(prev => ({ ...prev, body: newBody }))
  }
  const removeBodyLine = (idx: number) => {
    if (form.body.length <= 1) return
    setForm(prev => ({ ...prev, body: prev.body.filter((_, i) => i !== idx) }))
  }

  const addTag = () => {
    const val = newTag.trim()
    if (val && !form.tags.includes(val)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, val] }))
      setNewTag("")
    }
  }
  const removeTag = (tag: string) =>
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  // Image
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
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  // Validation
const validate = () => {
  const errs: Record<string, string> = {}
  if (!form.title.trim()) errs.title = "Titre requis"
  if (!form.title.trim() || form.title.trim().length < 5) errs.title = "Titre trop court (min 5 caractères)"
  if (!form.description.trim() || form.description.trim().length < 20) errs.description = "Description trop courte (min 20)"
  if (form.body.some(line => line.trim() === "")) errs.body = "Tous les paragraphes doivent être remplis"
  if (form.tags.length === 0) errs.tags = "Ajoutez au moins un tag"
  if (!selectedLaboratoireId) errs.laboratoireId = "Sélectionnez un laboratoire"
  setErrors(errs)
  return Object.keys(errs).length === 0
}

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) { setSubmitError("Veuillez corriger les erreurs ci-dessous."); return }
    if (!token || !chercheur) return

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        body: form.body.filter(line => line.trim()),
        chercheurId: chercheur.id,
        laboratoireId: selectedLaboratoireId,
        tags: form.tags
      }

      const article = await articlesApi.create(payload, token)

      // Upload de l'image si présente
      if (imageFile) {
        try {
          await uploadApi.uploadPhoto(imageFile, "articles", article.id, token)
        } catch (err) {
          console.error("Erreur upload image:", err)
        }
      }

      setSuccess(true)
      setTimeout(() => router.push("/dashboard/articles"), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur lors de la création")
    } finally {
      setSaving(false)
    }
  }

  if (loadingProfil) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

if (!chercheur) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-red-50 p-4 rounded-2xl text-red-700">
        Votre profil chercheur est introuvable. Veuillez contacter l'administration.
      </div>
    </div>
  )
}

if (!chercheur.laboratoires || chercheur.laboratoires.length === 0) {
  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun laboratoire associé</h2>
      <p className="text-sm text-gray-500 mb-6">
        Vous devez être rattaché à au moins un laboratoire pour pouvoir publier un article. Contactez un administrateur.
      </p>
      <Link href="/dashboard/articles" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4" />
        Retour à mes articles
      </Link>
    </div>
  )
}
  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Article publié !</h2>
        <p className="text-gray-500 mt-2">Redirection vers vos articles...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à mes articles
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvel article</h1>
        <p className="text-sm text-gray-400 mt-1">
          Cet article sera automatiquement rattaché à votre profil. Sélectionnez le laboratoire concerné ci-dessous.
        </p>
      </div>

      {/* Bloc info auteur (lecture seule) */}
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-sm">
      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
        {chercheur.name.charAt(0)}
      </div>
      <div>
        <p className="font-medium text-blue-900">{chercheur.name}</p>
        <p className="text-xs text-blue-700">
          {chercheur.institution ? `${chercheur.institution.acronym} – ` : ""}
          {chercheur.laboratoires.length} laboratoire{chercheur.laboratoires.length > 1 ? "s" : ""}
        </p>
      </div>
    </div>

      {/* Erreur */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contenu */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contenu</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Titre <span className="text-red-500">*(5 caractères minimum)</span>
            </label>
            <input
              type="text"
              value={form.title}
              min={5}
              onChange={e => handleChange("title", e.target.value)}
              placeholder="Titre de l'article"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                errors.title ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Accroche / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={2}
              placeholder="Brève description affichée en aperçu"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none transition-all ${
                errors.description ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              Paragraphes
            </label>
            <div className="space-y-2">
              {form.body.map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    value={line}
                    onChange={e => updateBodyLine(idx, e.target.value)}
                    rows={3}
                    placeholder={`Paragraphe ${idx + 1}`}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all ${
                      errors.body && line.trim() === "" ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeBodyLine(idx)}
                    className="self-start p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
              <Plus className="w-3.5 h-3.5" /> Ajouter un paragraphe
            </button>
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body}</p>}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Image d'illustration
            </label>
            {imagePreview ? (
              <div className="space-y-2">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-40 h-24 object-cover rounded-xl border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                <Camera className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    Ajouter une image
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG ou WebP • Max 5 MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
            {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            Tags <span className="text-red-500">*</span>
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              placeholder="Ajouter un tag..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
              onKeyDown={e => {
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
          {errors.tags && <p className="text-xs text-red-500 mt-1">{errors.tags}</p>}
          <div className="flex flex-wrap gap-2">
            {form.tags.map(tag => (
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
              <p className="text-xs text-gray-400">Aucun tag pour le moment</p>
            )}
          </div>
        </div>

        {/* Rattachement (lecture seule) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
            Rattachement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Institution</label>
              <input
                type="text"
                value={chercheur.institution ? `${chercheur.institution.acronym} – ${chercheur.institution.name}` : "Aucune"}
                disabled
                className="w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Laboratoire <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLaboratoireId}
                onChange={(e) => {
                  setSelectedLaboratoireId(e.target.value)
                  if (errors.laboratoireId) setErrors(prev => { const c = { ...prev }; delete c.laboratoireId; return c })
                }}
                disabled={chercheur.laboratoires.length === 1}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white ${
                  errors.laboratoireId ? "border-red-300" : "border-gray-200"
                } ${chercheur.laboratoires.length === 1 ? "bg-gray-50 text-gray-500" : ""}`}
              >
                <option value="">Sélectionner</option>
                {chercheur.laboratoires.map((labo) => (
                  <option key={labo.id} value={labo.id}>{labo.acronym} – {labo.name}</option>
                ))}
              </select>
              {errors.laboratoireId && <p className="text-xs text-red-500 mt-1">{errors.laboratoireId}</p>}
              {chercheur.laboratoires.length > 1 && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Choisissez le laboratoire concerné par cet article.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 pb-8">
          <Link
            href="/dashboard/articles"
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
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Publier l'article
          </button>
        </div>
      </form>
    </div>
  )
}