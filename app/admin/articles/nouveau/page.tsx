"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { articlesApi } from "@/lib/api/articles"
import { chercheursApi, type ChercheurCard } from "@/lib/api/chercheurs"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { uploadApi } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X, Loader2, AlertCircle, CheckCircle, Camera, Search, User, Tag } from "lucide-react"

export default function NouvelArticlePage() {
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()

  const [form, setForm] = useState({
    title: "",
    description: "",
    body: [""],
    chercheurId: "",
    laboratoireId: "",
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Sélecteurs
  const [chercheurs, setChercheurs] = useState<ChercheurCard[]>([])
  const [laboratoires, setLaboratoires] = useState<any[]>([])
  const [searchChercheur, setSearchChercheur] = useState("")
  const [filteredChercheurs, setFilteredChercheurs] = useState<ChercheurCard[]>([])

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) router.push("/auth/login?redirect=/admin/articles/nouveau")
  }, [user, authLoading, router])

  useEffect(() => {
    // Charger laboratoires
    laboratoiresApi.findAllSimple().then(data => setLaboratoires(data || [])).catch(() => {})
    // Charger quelques chercheurs pour le sélecteur
    chercheursApi.findAll({ limit: 50 }).then(res => setChercheurs(res.data)).catch(() => {})
  }, [])

  // Filtrage chercheur
  useEffect(() => {
    if (!searchChercheur.trim()) {
      setFilteredChercheurs(chercheurs.slice(0, 10))
    } else {
      const q = searchChercheur.toLowerCase()
      setFilteredChercheurs(chercheurs.filter(c => c.name.toLowerCase().includes(q) || c.specialty?.toLowerCase().includes(q)).slice(0, 10))
    }
  }, [searchChercheur, chercheurs])

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
  }

  const addBodyLine = () => setForm(prev => ({ ...prev, body: [...prev.body, ""] }))
  const updateBodyLine = (index: number, value: string) => {
    const newBody = [...form.body]
    newBody[index] = value
    setForm(prev => ({ ...prev, body: newBody }))
  }
  const removeBodyLine = (index: number) => {
    if (form.body.length <= 1) return
    setForm(prev => ({ ...prev, body: prev.body.filter((_, i) => i !== index) }))
  }

  const addTag = () => {
    const val = newTag.trim()
    if (val && !form.tags.includes(val)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, val] }))
      setNewTag("")
    }
  }
  const removeTag = (tag: string) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setErrors(prev => ({ ...prev, image: "Format image requis" })); return }
    if (file.size > 10 * 1024 * 1024) { setErrors(prev => ({ ...prev, image: "Max 10MB" })); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors(prev => { const c = { ...prev }; delete c.image; return c })
  }

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = "Titre requis"
    if (!form.description.trim()) errs.description = "Description requise"
    if (form.body.some(line => line.trim() === "")) errs.body = "Tous les paragraphes doivent être remplis"
    if (form.tags.length === 0) errs.tags = "Ajoutez au moins un tag"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) { setSubmitError("Corrigez les erreurs"); return }
    if (!token) return
    setSaving(true)
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        body: form.body.filter(line => line.trim()),
        chercheurId: form.chercheurId || undefined,
        laboratoireId: form.laboratoireId || undefined,
        tags: form.tags
      }
      const article = await articlesApi.create(payload, token)
      if (imageFile) {
        try { await uploadApi.uploadPhoto(imageFile, "articles", article.id, token) } catch {}
      }
      setSuccess(true)
      setTimeout(() => router.push(`/admin/articles/${article.id}`), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur création")
      setSaving(false)
    }
  }

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
  if (success) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
      <h2 className="text-2xl font-bold">Article créé !</h2>
      <p className="text-gray-500">Redirection...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6"><Link href="/admin/articles" className="inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft className="w-4 h-4" /> Retour</Link></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouvel article</h1>
      <p className="text-sm text-gray-400 mb-8">Publiez une actualité ou un article de fil info</p>

      {submitError && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p className="text-sm">{submitError}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase text-gray-900 flex items-center gap-2"><NewspaperIcon className="w-4 h-4 text-gray-400" /> Contenu</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => handleChange("title", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.title ? "border-red-300" : "border-gray-200"}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description / Accroche <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={2} className={`w-full px-4 py-3 border rounded-xl text-sm resize-none ${errors.description ? "border-red-300" : "border-gray-200"}`} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Paragraphes</label>
            {form.body.map((line, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <textarea value={line} onChange={e => updateBodyLine(idx, e.target.value)} rows={2} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" placeholder={`Paragraphe ${idx + 1}`} />
                <button type="button" onClick={() => removeBodyLine(idx)} className="self-start p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={addBodyLine} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Ajouter un paragraphe</button>
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Image d'illustration</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={clearImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 cursor-pointer hover:border-blue-300">
                  <Camera className="w-4 h-4" /> Choisir une image
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
              )}
            </div>
            {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase text-gray-900 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> Auteur & Laboratoire</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Auteur (chercheur)</label>
              <input type="text" value={searchChercheur} onChange={e => setSearchChercheur(e.target.value)} placeholder="Rechercher un chercheur..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2" />
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
                {filteredChercheurs.map(c => (
                  <button key={c.id} type="button" onClick={() => { handleChange("chercheurId", c.id); setSearchChercheur(c.name) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 ${form.chercheurId === c.id ? "bg-blue-50 text-blue-700 font-medium" : ""}`}>
                    {c.name} {c.laboratoireName ? `(${c.laboratoireName})` : ""}
                  </button>
                ))}
                {filteredChercheurs.length === 0 && <p className="text-xs text-gray-400 p-2">Aucun chercheur trouvé</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Laboratoire</label>
              <select value={form.laboratoireId} onChange={e => handleChange("laboratoireId", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Aucun</option>
                {laboratoires.map((labo: any) => <option key={labo.id} value={labo.id}>{labo.acronym} - {labo.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase text-gray-900 flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> Tags <span className="text-red-500">*</span></h2>
          <div className="flex gap-2 mb-2">
            <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Ajouter un tag" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <button type="button" onClick={addTag} className="px-3 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">{tag} <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button></span>
            ))}
          </div>
          {errors.tags && <p className="text-xs text-red-500 mt-1">{errors.tags}</p>}
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Link href="/admin/articles" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-sm">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Publier</button>
        </div>
      </form>
    </div>
  )
}

function NewspaperIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
    </svg>
  )
}