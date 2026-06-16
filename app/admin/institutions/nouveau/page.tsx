"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { institutionsApi } from "@/lib/api/institutions"
import { uploadApi } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import { ArrowLeft, Save, Building2, Camera, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"

const LOGO_BG_OPTIONS = [
  { value: "bg-blue-100", label: "Bleu" },
  { value: "bg-green-100", label: "Vert" },
  { value: "bg-emerald-100", label: "Émeraude" },
  { value: "bg-purple-100", label: "Violet" },
  { value: "bg-rose-100", label: "Rose" },
  { value: "bg-amber-100", label: "Ambre" },
  { value: "bg-gray-100", label: "Gris" },
]

export default function NouvelleInstitutionPage() {
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()

  const [form, setForm] = useState({ acronym: "", name: "", description: "", logoBg: "bg-blue-100" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/institutions/nouveau")
    }
  }, [user, authLoading, router])

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setErrors(prev => ({ ...prev, logo: "Format image requis" })); return }
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, logo: "Max 5MB" })); return }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setErrors(prev => { const c = { ...prev }; delete c.logo; return c })
  }

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoFile(null)
    setLogoPreview(null)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.acronym.trim() || form.acronym.trim().length < 2) errs.acronym = "Acronyme requis (min 2)"
    if (!form.name.trim()) errs.name = "Nom requis"
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = "Description (min 10)"
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
      const payload = {
        acronym: form.acronym.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        logoBg: form.logoBg
      }
      const institution = await institutionsApi.create(payload, token)
      if (logoFile) {
        try { await uploadApi.uploadPhoto(logoFile, "institutions", institution.id, token) } catch {}
      }
      setSuccess(true)
      setTimeout(() => router.push(`/admin/institutions/${institution.id}`), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur création")
      setSaving(false)
    }
  }

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
  if (success) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
      <h2 className="text-2xl font-bold">Institution créée !</h2>
      <p className="text-gray-500">Redirection...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/institutions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Retour</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouvelle institution</h1>
      <p className="text-sm text-gray-400 mb-8">Ajoutez une institution au catalogue</p>

      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /> Identité</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Logo</label>
              <div className="relative w-24 h-24">
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo" className="w-24 h-24 rounded-2xl object-contain border-2 border-gray-100 bg-gray-50" />
                    <button type="button" onClick={clearLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </>
                ) : (
                  <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 group">
                    <Camera className="w-6 h-6 text-gray-300 group-hover:text-blue-400" />
                    <span className="text-[9px] text-gray-400 mt-1">Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                  </label>
                )}
              </div>
              {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Acronyme <span className="text-red-500">*</span></label>
                <input type="text" value={form.acronym} onChange={e => handleChange("acronym", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none ${errors.acronym ? "border-red-300 bg-red-50" : "border-gray-200"}`} placeholder="Ex: UDC" />
                {errors.acronym && <p className="text-xs text-red-500 mt-1">{errors.acronym}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"}`} placeholder="Nom complet" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200"}`} placeholder="Décrivez l'institution..." />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Couleur de fond du placeholder</label>
                <select value={form.logoBg} onChange={e => handleChange("logoBg", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none">
                  {LOGO_BG_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 pb-8">
          <Link href="/admin/institutions" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Créer l'institution
          </button>
        </div>
      </form>
    </div>
  )
}