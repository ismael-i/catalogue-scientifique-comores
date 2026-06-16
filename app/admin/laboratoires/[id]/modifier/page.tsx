"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { laboratoiresApi, type LaboratoireDetail } from "@/lib/api/laboratoires"
import { uploadApi } from "@/lib/api/upload"
import { getFileUrl } from "@/lib/utils/fileUrl"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft, Save, FlaskConical, Building2, Tag, Users, Globe, Phone, Mail,
  X, Plus, Loader2, AlertCircle, CheckCircle, Camera, BookOpen, RotateCcw, Trash2
} from "lucide-react"

export default function ModifierLaboratoirePage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  const [form, setForm] = useState({
    acronym: "", name: "", description: "", categorie: "", institutionId: "", institutionName: "",
    researchers: "", statut: "Actif",
    thematiques: [] as string[],
    partenariats: [] as string[],
    contactEmail: "", contactTelephone: "", contactSite: ""
  })
  const [newThematique, setNewThematique] = useState("")
  const [newPartenaire, setNewPartenaire] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalData, setOriginalData] = useState<LaboratoireDetail | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Logo
  enum PhotoAction { KEEP, UPLOAD, REMOVE }
  const [photoAction, setPhotoAction] = useState<PhotoAction>(PhotoAction.KEEP)
  const [currentLogoPath, setCurrentLogoPath] = useState<string | null>(null)
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Auth
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) router.push("/auth/login")
  }, [user, authLoading, router])

  // Charger données existantes
  useEffect(() => {
    (async () => {
      if (!token) return
      setLoading(true)
      try {
        const labo = await laboratoiresApi.findById(id)
        setOriginalData(labo)
        setForm({
          acronym: labo.acronym || "",
          name: labo.name || "",
          description: labo.description || "",
          categorie: labo.categorie || "",
          institutionId: labo.institution?.id || "",
          institutionName: labo.institution?.name || (labo as any).institutionName || "",
          researchers: labo.researchers?.toString() || "0",
          statut: labo.statut || "Actif",
          thematiques: labo.thematiques || [],
          partenariats: labo.partenariats || [],
          contactEmail: labo.contactEmail || "",
          contactTelephone: labo.contactTelephone || "",
          contactSite: labo.contactSite || ""
        })
        if (labo.logo) setCurrentLogoPath(labo.logo)
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "Laboratoire introuvable")
      } finally {
        setLoading(false)
      }
    })()
  }, [token, id])

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = {...prev}; delete c[field]; return c })
  }

  // Ajout/suppression tableaux
  const addThematique = () => {
    const val = newThematique.trim()
    if (val && !form.thematiques.includes(val)) {
      setForm(prev => ({ ...prev, thematiques: [...prev.thematiques, val] }))
      setNewThematique("")
    }
  }
  const removeThematique = (item: string) => setForm(prev => ({ ...prev, thematiques: prev.thematiques.filter(t => t !== item) }))
  const addPartenaire = () => {
    const val = newPartenaire.trim()
    if (val && !form.partenariats.includes(val)) {
      setForm(prev => ({ ...prev, partenariats: [...prev.partenariats, val] }))
      setNewPartenaire("")
    }
  }
  const removePartenaire = (item: string) => setForm(prev => ({ ...prev, partenariats: prev.partenariats.filter(p => p !== item) }))

  // Logo handlers
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setErrors(prev => ({...prev, logo:"Format image"})); return }
    if (file.size > 5*1024*1024) { setErrors(prev => ({...prev, logo:"Max 5MB"})); return }
    setNewLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setPhotoAction(PhotoAction.UPLOAD)
    setErrors(prev => { const c={...prev}; delete c.logo; return c })
  }
  const handleRemoveLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setNewLogoFile(null)
    setLogoPreview(null)
    setPhotoAction(PhotoAction.REMOVE)
  }
  const handleCancelLogoChanges = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setNewLogoFile(null)
    setLogoPreview(null)
    setPhotoAction(PhotoAction.KEEP)
  }

  const displayLogoUrl = photoAction === PhotoAction.REMOVE ? null :
    photoAction === PhotoAction.UPLOAD && logoPreview ? logoPreview :
    (photoAction === PhotoAction.KEEP && currentLogoPath ? getFileUrl(currentLogoPath) : null)

  // Validation
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Nom requis"
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = "Description (min 10)"
    if (form.researchers && (isNaN(Number(form.researchers)) || Number(form.researchers) < 0)) errs.researchers = "Nombre invalide"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const hasChanges = () => {
    if (!originalData) return false
    if (photoAction !== PhotoAction.KEEP) return true
    return (
      form.name !== (originalData.name || "") ||
      form.description !== (originalData.description || "") ||
      form.statut !== (originalData.statut || "Actif") ||
      form.researchers !== (originalData.researchers?.toString() || "0") ||
      JSON.stringify(form.thematiques) !== JSON.stringify(originalData.thematiques || []) ||
      JSON.stringify(form.partenariats) !== JSON.stringify(originalData.partenariats || []) ||
      form.contactEmail !== (originalData.contactEmail || "") ||
      form.contactTelephone !== (originalData.contactTelephone || "") ||
      form.contactSite !== (originalData.contactSite || "")
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) { setSubmitError("Corrigez les erreurs"); return }
    if (!token) return
    setSaving(true)
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        statut: form.statut,
        researchers: Number(form.researchers),
        thematiques: form.thematiques,
        partenariats: form.partenariats,
        contactEmail: form.contactEmail.trim() || undefined,
        contactTelephone: form.contactTelephone.trim() || undefined,
        contactSite: form.contactSite.trim() || undefined
      }
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

      await laboratoiresApi.update(id, payload, token)

      // Gérer logo
      if (photoAction === PhotoAction.REMOVE) {
        try { await uploadApi.deletePhoto("laboratoires", id, token) } catch {}
      } else if (photoAction === PhotoAction.UPLOAD && newLogoFile) {
        try {
          if (currentLogoPath) await uploadApi.deletePhoto("laboratoires", id, token)
          await uploadApi.uploadPhoto(newLogoFile, "laboratoires", id, token)
        } catch {}
      }

      setSuccess(true)
      setTimeout(() => router.push(`/admin/laboratoires/${id}`), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur modification")
      setSaving(false)
    }
  }

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  if (loadError) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p>{loadError}</p><Link href="/admin/laboratoires" className="text-xs underline">Retour</Link></div></div>
  if (success) return <div className="max-w-2xl mx-auto py-20 text-center"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div><h2 className="text-2xl font-bold">Modifications enregistrées</h2><p className="text-gray-500">Redirection...</p></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/admin/laboratoires/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Retour à la fiche</Link>
        <span className="text-xs text-gray-400">Modification de <strong>{originalData?.acronym}</strong></span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Modifier le laboratoire</h1>
      <p className="text-sm text-gray-400 mb-8">Les champs Institution et Catégorie ne sont pas modifiables.</p>

      {submitError && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p className="text-sm">{submitError}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo & Identité */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6"><FlaskConical className="w-4 h-4 inline mr-2 text-gray-400" />Identité & Logo</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Logo</label>
              <div className="relative w-28 h-28">
                {displayLogoUrl ? (
                  <>
                    <img src={displayLogoUrl} alt="Logo" className="w-28 h-28 rounded-2xl object-contain border-2 border-gray-100 bg-gray-50" />
                    {photoAction === PhotoAction.UPLOAD && <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">Nouveau</span>}
                    <button type="button" onClick={handleRemoveLogo} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                ) : photoAction === PhotoAction.REMOVE ? (
                  <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-red-300 bg-red-50 flex flex-col items-center justify-center text-red-400"><Trash2 className="w-6 h-6 mb-1" /><span className="text-[10px]">Supprimé</span></div>
                ) : (
                  <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                    <Camera className="w-7 h-7 text-gray-300 group-hover:text-blue-400" />
                    <span className="text-[10px] text-gray-400 mt-1">{currentLogoPath ? "Changer" : "Ajouter"}</span>
                    <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                  </label>
                )}
              </div>
              {photoAction !== PhotoAction.KEEP && (
                <button type="button" onClick={handleCancelLogoChanges} className="mt-2 text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700"><RotateCcw className="w-3 h-3" />Annuler</button>
              )}
              {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Acronyme</label>
                  <input type="text" value={form.acronym} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Statut</label>
                  <select value={form.statut} onChange={e => handleChange("statut", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Catégorie & Institution (lecture seule) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6"><Tag className="w-4 h-4 inline mr-2 text-gray-400" />Catégorie & Rattachement (non modifiable)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Catégorie</label>
              <div className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700">{form.categorie}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Institution</label>
              <div className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" />{form.institutionName || form.institutionId}</div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nombre de chercheurs</label>
              <input type="number" value={form.researchers} onChange={e => handleChange("researchers", e.target.value)} min="0" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.researchers ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
              {errors.researchers && <p className="text-xs text-red-500 mt-1">{errors.researchers}</p>}
            </div>
          </div>
        </div>

        {/* Thématiques & Partenariats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6"><BookOpen className="w-4 h-4 inline mr-2 text-gray-400" />Thématiques & Partenariats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Thématiques</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newThematique} onChange={e => setNewThematique(e.target.value)} placeholder="Ajouter" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addThematique())} />
                <button type="button" onClick={addThematique} className="px-3 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.thematiques.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">{t} <button onClick={() => removeThematique(t)}><X className="w-3 h-3" /></button></span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Partenariats</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newPartenaire} onChange={e => setNewPartenaire(e.target.value)} placeholder="Ajouter" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addPartenaire())} />
                <button type="button" onClick={addPartenaire} className="px-3 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.partenariats.map(p => (
                  <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg border border-purple-100">{p} <button onClick={() => removePartenaire(p)}><X className="w-3 h-3" /></button></span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6"><Phone className="w-4 h-4 inline mr-2 text-gray-400" />Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" value={form.contactEmail} onChange={e => handleChange("contactEmail", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" /></div></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Téléphone</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={form.contactTelephone} onChange={e => handleChange("contactTelephone", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" /></div></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Site web</label><div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="url" value={form.contactSite} onChange={e => handleChange("contactSite", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" /></div></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 pb-8">
          <div>{hasChanges() ? <span className="text-xs text-amber-600 flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />Modifications non enregistrées</span> : <span className="text-xs text-gray-400">Aucune modification</span>}</div>
          <div className="flex gap-3">
            <Link href={`/admin/laboratoires/${id}`} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
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