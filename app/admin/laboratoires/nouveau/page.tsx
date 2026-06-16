"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { institutionsApi } from "@/lib/api/institutions"
import { uploadApi } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft, Save, FlaskConical, Building2, Tag, Users, Globe, Phone, Mail,
  X, Plus, Loader2, AlertCircle, CheckCircle, Camera, FileUp, BookOpen
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface InstitutionOption {
  id: string
  acronym: string
  name: string
}

const CATEGORIES = ["Sciences", "Environnement", "Santé", "Économie", "Lettres"] as const
type LabCategorie = typeof CATEGORIES[number]

// ─── Composant principal ────────────────────────────────
export default function NouveauLaboratoirePage() {
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()

  // Formulaire
  const [form, setForm] = useState({
    acronym: "",
    name: "",
    description: "",
    categorie: "" as LabCategorie | "",
    institutionId: "",
    institutionName: "",
    researchers: "",
    thematiques: [] as string[],
    partenariats: [] as string[],
    contactEmail: "",
    contactTelephone: "",
    contactSite: "",
    statut: "Actif"
  })
  const [newThematique, setNewThematique] = useState("")
  const [newPartenaire, setNewPartenaire] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // UI
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Données
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // ─── Auth ──────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/laboratoires/nouveau")
    }
  }, [user, authLoading, router])

  // Charger institutions
  useEffect(() => {
    (async () => {
      try {
        const data = await institutionsApi.findAllSimple()
        setInstitutions(data.data || data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingData(false)
      }
    })()
  }, [])

  // ─── Handlers champs ──────────────────────────────────
  const handleChange = (field: string, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      if (field === "institutionId") {
        const inst = institutions.find(i => i.id === value)
        updated.institutionName = inst?.name || ""
      }
      return updated
    })
    if (errors[field]) setErrors(prev => { const c = {...prev}; delete c[field]; return c })
  }

  const addThematique = () => {
    const val = newThematique.trim()
    if (val && !form.thematiques.includes(val)) {
      setForm(prev => ({ ...prev, thematiques: [...prev.thematiques, val] }))
      setNewThematique("")
    }
  }

  const removeThematique = (item: string) => {
    setForm(prev => ({ ...prev, thematiques: prev.thematiques.filter(t => t !== item) }))
  }

  const addPartenaire = () => {
    const val = newPartenaire.trim()
    if (val && !form.partenariats.includes(val)) {
      setForm(prev => ({ ...prev, partenariats: [...prev.partenariats, val] }))
      setNewPartenaire("")
    }
  }

  const removePartenaire = (item: string) => {
    setForm(prev => ({ ...prev, partenariats: prev.partenariats.filter(p => p !== item) }))
  }

  // Logo
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, logo: "Format image requis" }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: "Max 5MB" }))
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setErrors(prev => { const c = {...prev}; delete c.logo; return c })
  }

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoFile(null)
    setLogoPreview(null)
  }

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.acronym.trim() || form.acronym.trim().length < 2) errs.acronym = "Acronyme requis (min 2)"
    if (!form.name.trim()) errs.name = "Nom requis"
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = "Description (min 10)"
    if (!form.categorie) errs.categorie = "Catégorie requise"
    if (!form.institutionId) errs.institutionId = "Institution requise"
    if (form.researchers && (isNaN(Number(form.researchers)) || Number(form.researchers) < 0)) errs.researchers = "Nombre invalide"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) { setSubmitError("Corrigez les erreurs"); return }
    if (!token) return
    setSaving(true)

    try {
      const payload: any = {
        acronym: form.acronym.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        categorie: form.categorie,
        institutionId: form.institutionId,
        institutionName: form.institutionName,
        researchers: form.researchers ? Number(form.researchers) : 0,
        thematiques: form.thematiques,
        partenariats: form.partenariats,
        contactEmail: form.contactEmail.trim() || undefined,
        contactTelephone: form.contactTelephone.trim() || undefined,
        contactSite: form.contactSite.trim() || undefined,
        statut: form.statut
      }
      // Nettoyer
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

      const labo = await laboratoiresApi.create(payload, token)

      // Upload logo si présent
      if (logoFile) {
        try {
          await uploadApi.uploadPhoto(logoFile, "laboratoires", labo.id, token)
        } catch (err) {
          console.error("Erreur upload logo:", err)
        }
      }

      setSuccess(true)
      setTimeout(() => router.push(`/admin/laboratoires/${labo.id}`), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur création")
      setSaving(false)
    }
  }

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Laboratoire créé !</h2>
        <p className="text-gray-500">Redirection...</p>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mt-4" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/laboratoires" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Retour</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouveau laboratoire</h1>
      <p className="text-sm text-gray-400 mb-8">Ajoutez un laboratoire au catalogue</p>

      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo & Identité */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-gray-400" /> Identité</h2>
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
                  <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                    <Camera className="w-6 h-6 text-gray-300 group-hover:text-blue-400" />
                    <span className="text-[9px] text-gray-400 mt-1">Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                  </label>
                )}
              </div>
              {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Acronyme <span className="text-red-500">*</span></label>
                  <input type="text" value={form.acronym} onChange={e => handleChange("acronym", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none ${errors.acronym ? "border-red-300 bg-red-50" : "border-gray-200"}`} placeholder="Ex: LSML" />
                  {errors.acronym && <p className="text-xs text-red-500 mt-1">{errors.acronym}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Statut</label>
                  <select value={form.statut} onChange={e => handleChange("statut", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"}`} placeholder="Nom complet du laboratoire" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200"}`} placeholder="Décrivez le laboratoire..." />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Catégorie & Institution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> Catégorie & Rattachement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Catégorie <span className="text-red-500">*</span></label>
              <select value={form.categorie} onChange={e => handleChange("categorie", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none ${errors.categorie ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.categorie && <p className="text-xs text-red-500 mt-1">{errors.categorie}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Institution <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={form.institutionId} onChange={e => handleChange("institutionId", e.target.value)} className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none appearance-none ${errors.institutionId ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                  <option value="">Sélectionner</option>
                  {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.acronym} — {inst.name}</option>)}
                </select>
              </div>
              {errors.institutionId && <p className="text-xs text-red-500 mt-1">{errors.institutionId}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nombre de chercheurs</label>
              <input type="number" value={form.researchers} onChange={e => handleChange("researchers", e.target.value)} min="0" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none ${errors.researchers ? "border-red-300 bg-red-50" : "border-gray-200"}`} placeholder="0" />
              {errors.researchers && <p className="text-xs text-red-500 mt-1">{errors.researchers}</p>}
            </div>
          </div>
        </div>

        {/* Thématiques & Partenariats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /> Thématiques & Partenariats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thématiques */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Thématiques</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newThematique} onChange={e => setNewThematique(e.target.value)} placeholder="Ajouter une thématique" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addThematique())} />
                <button type="button" onClick={addThematique} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.thematiques.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                    {t}
                    <button type="button" onClick={() => removeThematique(t)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            {/* Partenariats */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Partenariats</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newPartenaire} onChange={e => setNewPartenaire(e.target.value)} placeholder="Ajouter un partenaire" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addPartenaire())} />
                <button type="button" onClick={addPartenaire} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.partenariats.map(p => (
                  <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg border border-purple-100">
                    {p}
                    <button type="button" onClick={() => removePartenaire(p)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" value={form.contactEmail} onChange={e => handleChange("contactEmail", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" /></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Téléphone</label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={form.contactTelephone} onChange={e => handleChange("contactTelephone", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" /></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Site web</label>
              <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="url" value={form.contactSite} onChange={e => handleChange("contactSite", e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" /></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 pb-8">
          <Link href="/admin/laboratoires" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Créer le laboratoire
          </button>
        </div>
      </form>
    </div>
  )
}