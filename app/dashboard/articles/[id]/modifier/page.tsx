"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi, type ArticleData } from "@/lib/api/articles"
import { uploadApi } from "@/lib/api/upload"
import { getFileUrl } from "@/lib/utils/fileUrl"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft, Save, Plus, X, Loader2, AlertCircle, CheckCircle,
  Camera, RotateCcw, Trash2, Tag
} from "lucide-react"

export default function ModifierArticleChercheurPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user } = useAuth()
  const id = params.id as string

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [form, setForm] = useState({ title: "", description: "", body: [""], tags: [] as string[] })
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Image
  enum PhotoAction { KEEP, UPLOAD, REMOVE }
  const [photoAction, setPhotoAction] = useState<PhotoAction>(PhotoAction.KEEP)
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Charger l'article existant
  useEffect(() => {
    if (!token || !id) return
    setLoading(true)
    articlesApi
      .findById(id)
      .then(data => {
        // Vérifier que l'article appartient bien au chercheur connecté
        if (data.chercheur?.id !== user?.chercheurId) {
          setLoadError("Vous n'êtes pas autorisé à modifier cet article.")
          return
        }
        setArticle(data)
        setForm({
          title: data.title,
          description: data.description,
          body: data.body?.length ? [...data.body] : [""],
          tags: data.tags?.map(t => t.tag) || []
        })
        if (data.imageUrl) setCurrentImagePath(data.imageUrl)
      })
      .catch(err => setLoadError(err instanceof ApiError ? err.message : "Article introuvable"))
      .finally(() => setLoading(false))
  }, [token, id, user])

  // Handlers formulaire
  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
  }

  const addBodyLine = () => setForm(prev => ({ ...prev, body: [...prev.body, ""] }))
  const updateBodyLine = (idx: number, val: string) => {
    const newBody = [...form.body]
    newBody[idx] = val
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
  const removeTag = (tag: string) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  // Image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
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
  const handleCancelImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setNewImageFile(null)
    setImagePreview(null)
    setPhotoAction(PhotoAction.KEEP)
  }

  const displayImageUrl =
    photoAction === PhotoAction.REMOVE ? null
    : photoAction === PhotoAction.UPLOAD && imagePreview ? imagePreview
    : photoAction === PhotoAction.KEEP && currentImagePath ? getFileUrl(currentImagePath)
    : null

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = "Titre requis"
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = "Description trop courte"
    if (form.body.some(l => l.trim() === "")) errs.body = "Tous les paragraphes doivent être remplis"
    if (form.tags.length === 0) errs.tags = "Ajoutez au moins un tag"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const hasChanges = () => {
    if (!article) return false
    if (photoAction !== PhotoAction.KEEP) return true
    return (
      form.title !== article.title ||
      form.description !== article.description ||
      JSON.stringify(form.body.filter(l => l.trim())) !== JSON.stringify(article.body || []) ||
      JSON.stringify(form.tags.sort()) !== JSON.stringify(article.tags?.map(t => t.tag).sort() || [])
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) { setSubmitError("Veuillez corriger les erreurs."); return }
    if (!token) return
    setSaving(true)
    try {
      await articlesApi.update(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        body: form.body.filter(l => l.trim()),
        tags: form.tags
      }, token)

      // Gestion image
      if (photoAction === PhotoAction.REMOVE && currentImagePath) {
        await uploadApi.deletePhoto("articles", id, token).catch(() => {})
      } else if (photoAction === PhotoAction.UPLOAD && newImageFile) {
        if (currentImagePath) await uploadApi.deletePhoto("articles", id, token).catch(() => {})
        await uploadApi.uploadPhoto(newImageFile, "articles", id, token).catch(() => {})
      }

      setSuccess(true)
      setTimeout(() => router.push("/dashboard/articles"), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  if (loadError) return <div className="max-w-4xl mx-auto py-8 px-4"><div className="bg-red-50 p-4 rounded-2xl text-red-700 flex gap-3"><AlertCircle className="w-5 h-5" /><p>{loadError}</p><Link href="/dashboard/articles" className="text-xs underline">Retour</Link></div></div>
  if (success) return <div className="max-w-2xl mx-auto py-20 text-center"><CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" /><h2 className="text-2xl font-bold">Article modifié</h2><p className="text-gray-500">Redirection...</p></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/articles" className="inline-flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </Link>
        <span className="text-xs text-gray-400">Modification de l'article</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Modifier l'article</h1>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5" /><p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre */}
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => handleChange("title", e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.title ? "border-red-300" : "border-gray-200"}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={2}
              className={`w-full px-4 py-3 border rounded-xl text-sm resize-none ${errors.description ? "border-red-300" : "border-gray-200"}`} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Paragraphes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Contenu</label>
            {form.body.map((line, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <textarea value={line} onChange={e => updateBodyLine(idx, e.target.value)} rows={3}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm resize-none ${errors.body && line.trim() === "" ? "border-red-300" : "border-gray-200"}`} />
                <button type="button" onClick={() => removeBodyLine(idx)} className="self-start p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={addBodyLine} className="text-xs text-blue-600 flex items-center gap-1 mt-2"><Plus className="w-3.5 h-3.5" /> Ajouter un paragraphe</button>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Image d'illustration</label>
            {displayImageUrl && photoAction !== PhotoAction.REMOVE ? (
              <div className="relative inline-block">
                <img src={displayImageUrl} alt="Illustration" className="w-40 h-24 object-cover rounded-xl border" />
                <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                <label className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100">
                  <Camera className="w-3.5 h-3.5" /> Changer
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
              </div>
            ) : photoAction === PhotoAction.REMOVE ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-700">Image supprimée (enregistrez pour appliquer)</span>
                <button type="button" onClick={handleCancelImage} className="ml-auto text-xs text-amber-700 underline">Annuler</button>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Ajouter une image</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Tags <span className="text-red-500">*</span></label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Ajouter un tag" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
            {errors.tags && <p className="text-xs text-red-500">{errors.tags}</p>}
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border">{tag} <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button></span>
              ))}
            </div>
          </div>
        </div>

        {/* Institution / laboratoire en lecture seule */}
        {article && (
          <div className="bg-white rounded-2xl border p-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Institution</label>
              <input type="text" value={article.chercheur?.institution || "—"} disabled className="w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Laboratoire</label>
              <input type="text" value={article.laboratoire?.acronym + " – " + (article.laboratoire?.name || "") || "—"} disabled className="w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 text-gray-500" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 pb-8">
          <div>
            {hasChanges() ? <span className="text-xs text-amber-600 flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />Modifications non enregistrées</span> : <span className="text-xs text-gray-400">Aucune modification</span>}
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/articles" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
            <button type="submit" disabled={saving || !hasChanges()} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}