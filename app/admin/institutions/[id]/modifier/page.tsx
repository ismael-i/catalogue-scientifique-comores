"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { institutionsApi, type InstitutionDetail } from "@/lib/api/institutions"
import { uploadApi } from "@/lib/api/upload"
import { getFileUrl } from "@/lib/utils/fileUrl"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import { ArrowLeft, Save, Building2, Camera, X, Loader2, AlertCircle, CheckCircle, RotateCcw, Trash2 } from "lucide-react"

const LOGO_BG_OPTIONS = [
  { value: "bg-blue-100", label: "Bleu" },
  { value: "bg-green-100", label: "Vert" },
  { value: "bg-emerald-100", label: "Émeraude" },
  { value: "bg-purple-100", label: "Violet" },
  { value: "bg-rose-100", label: "Rose" },
  { value: "bg-amber-100", label: "Ambre" },
  { value: "bg-gray-100", label: "Gris" },
]

export default function ModifierInstitutionPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  const [form, setForm] = useState({ acronym: "", name: "", description: "", logoBg: "bg-blue-100" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalData, setOriginalData] = useState<InstitutionDetail | null>(null)
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

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) router.push("/auth/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (token && id) {
      institutionsApi.findById(id).then(data => {
        setOriginalData(data)
        setForm({
          acronym: data.acronym || "",
          name: data.name || "",
          description: data.description || "",
          logoBg: data.logoBg || "bg-blue-100"
        })
        if (data.logo) setCurrentLogoPath(data.logo)
      }).catch(err => setLoadError(err instanceof ApiError ? err.message : "Institution introuvable"))
      .finally(() => setLoading(false))
    }
  }, [token, id])

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
  }

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
  const handleRemoveLogo = () => { if (logoPreview) URL.revokeObjectURL(logoPreview); setNewLogoFile(null); setLogoPreview(null); setPhotoAction(PhotoAction.REMOVE) }
  const handleCancelLogoChanges = () => { if (logoPreview) URL.revokeObjectURL(logoPreview); setNewLogoFile(null); setLogoPreview(null); setPhotoAction(PhotoAction.KEEP) }

  const displayLogoUrl = photoAction === PhotoAction.REMOVE ? null :
    photoAction === PhotoAction.UPLOAD && logoPreview ? logoPreview :
    (photoAction === PhotoAction.KEEP && currentLogoPath ? getFileUrl(currentLogoPath) : null)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Nom requis"
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = "Description (min 10)"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const hasChanges = () => {
    if (!originalData) return false
    if (photoAction !== PhotoAction.KEEP) return true
    return form.name !== originalData.name || form.description !== originalData.description || form.logoBg !== (originalData.logoBg || "bg-blue-100")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) { setSubmitError("Corrigez les erreurs"); return }
    if (!token) return
    setSaving(true)
    try {
      const payload: any = { name: form.name.trim(), description: form.description.trim(), logoBg: form.logoBg }
      await institutionsApi.update(id, payload, token)
      if (photoAction === PhotoAction.REMOVE) {
        try { await uploadApi.deletePhoto("institutions", id, token) } catch {}
      } else if (photoAction === PhotoAction.UPLOAD && newLogoFile) {
        try {
          if (currentLogoPath) await uploadApi.deletePhoto("institutions", id, token)
          await uploadApi.uploadPhoto(newLogoFile, "institutions", id, token)
        } catch {}
      }
      setSuccess(true)
      setTimeout(() => router.push(`/admin/institutions/${id}`), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur modification")
      setSaving(false)
    }
  }

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
  if (loadError) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p>{loadError}</p><Link href="/admin/institutions" className="text-xs underline">Retour</Link></div></div>
  if (success) return <div className="max-w-2xl mx-auto py-20 text-center"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div><h2 className="text-2xl font-bold">Modifications enregistrées</h2><p className="text-gray-500">Redirection...</p></div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/admin/institutions/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Retour à la fiche</Link>
        <span className="text-xs text-gray-400">Modification de <strong>{originalData?.acronym}</strong></span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Modifier l'institution</h1>
      <p className="text-sm text-gray-400 mb-8">L'acronyme ne peut pas être modifié.</p>

      {submitError && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p className="text-sm">{submitError}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /> Identité & Logo</h2>
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
                  <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 group">
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
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Acronyme</label>
                <input type="text" value={form.acronym} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
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
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Couleur de fond</label>
                <select value={form.logoBg} onChange={e => handleChange("logoBg", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                  {LOGO_BG_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 pb-8">
          <div>{hasChanges() ? <span className="text-xs text-amber-600 flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />Modifications non enregistrées</span> : <span className="text-xs text-gray-400">Aucune modification</span>}</div>
          <div className="flex gap-3">
            <Link href={`/admin/institutions/${id}`} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
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