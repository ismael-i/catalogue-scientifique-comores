"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { publicationsApi } from "@/lib/api/publications"
import { chercheursApi, type ChercheurCard } from "@/lib/api/chercheurs"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { uploadApi } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft, Save, Plus, X, Loader2, AlertCircle, CheckCircle,
  FileUp, Search, Users, FlaskConical
} from "lucide-react"

export default function NouvellePublicationPage() {
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()

  const [form, setForm] = useState({
    title: "", description: "", journal: "", year: new Date().getFullYear().toString(),
    domain: "", type: "", laboratoireId: "", institutionAcronym: "", othersAuthors: [] as string []
  })
  const [authorIds, setAuthorIds] = useState<string[]>([]) // IDs des chercheurs sélectionnés
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)

  // Sélecteurs
  const [chercheurs, setChercheurs] = useState<ChercheurCard[]>([])
  const [laboratoires, setLaboratoires] = useState<any[]>([])
  const [searchChercheur, setSearchChercheur] = useState("")
  const [filteredChercheurs, setFilteredChercheurs] = useState<ChercheurCard[]>([])
  const [showChercheurDropdown, setShowChercheurDropdown] = useState(false)
  const [newOtherAuthors, setNewOtherAuthors] = useState("")

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) router.push("/auth/login?redirect=/admin/publications/nouveau")
  }, [user, authLoading, router])

  useEffect(() => {
    chercheursApi.findAll({ limit: 200 }).then(res => setChercheurs(res.data)).catch(() => {})
    laboratoiresApi.findAllSimple().then(data => setLaboratoires(data || [])).catch(() => {})
  }, [])

  // Filtrer chercheurs
  useEffect(() => {
    if (!searchChercheur.trim()) {
      setFilteredChercheurs(chercheurs.slice(0, 15))
    } else {
      const q = searchChercheur.toLowerCase()
      setFilteredChercheurs(chercheurs.filter(c => c.name.toLowerCase().includes(q) || c.specialty?.toLowerCase().includes(q)).slice(0, 15))
    }
  }, [searchChercheur, chercheurs])

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
  }

  const addAuthor = (chercheurId: string) => {
    if (!authorIds.includes(chercheurId)) {
      setAuthorIds(prev => [...prev, chercheurId])
    }
    setSearchChercheur("")
    setShowChercheurDropdown(false)
  }
  const removeAuthor = (chercheurId: string) => setAuthorIds(prev => prev.filter(id => id !== chercheurId))

  const addKeyword = () => {
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw)) {
      setKeywords(prev => [...prev, kw])
      setNewKeyword("")
    }
  }
  const removeKeyword = (kw: string) => setKeywords(prev => prev.filter(k => k !== kw))

  const handlePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") { setErrors(prev => ({ ...prev, pdf: "PDF uniquement" })); return }
    if (file.size > 10 * 1024 * 1024) { setErrors(prev => ({ ...prev, pdf: "Max 10MB" })); return }
    setPdfFile(file)
    setPdfName(file.name)
    setErrors(prev => { const c = { ...prev }; delete c.pdf; return c })
  }

    const addOtherAuthor = () => {
    const val = newOtherAuthors.trim()
    if (val && !form.othersAuthors.includes(val)) {
      setForm(prev => ({ ...prev, othersAuthors: [...prev.othersAuthors, val] }))
      setNewOtherAuthors("")
    }
  }

  const removeOtherAuthor = (item: string) => {
    setForm(prev => ({ ...prev, othersAuthors: prev.othersAuthors.filter(p => p !== item) }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = "Titre requis"
    if (!form.description.trim()) errs.description = "Description requise"
    if (!form.journal.trim()) errs.journal = "Journal requis"
    if (!form.domain) errs.domain = "Domaine requis"
    if (!form.type) errs.type = "Type requis"
    if (!form.laboratoireId) errs.laboratoireId = "Laboratoire requis"
    if (authorIds.length === 0) errs.authors = "Au moins un auteur"
    if (keywords.length === 0) errs.keywords = "Au moins un mot-clé"
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
        title: form.title.trim(),
        description: form.description.trim(),
        journal: form.journal.trim(),
        year: Number(form.year),
        domain: form.domain,
        type: form.type,
        laboratoireId: form.laboratoireId,
        institutionAcronym: form.institutionAcronym || undefined,
        authorIds,
        keywords,
        othersAuthors: form.othersAuthors,
      }
      const publication = await publicationsApi.create(payload, token)

      // Upload PDF si présent
      if (pdfFile) {
        try { await uploadApi.uploadPublicationPDF(pdfFile, publication.id, token) } catch {}
      }

      setSuccess(true)
      setTimeout(() => router.push(`/admin/publications/${publication.id}`), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur création")
      setSaving(false)
    }
  }

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
  if (success) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
      <h2 className="text-2xl font-bold">Publication créée !</h2>
      <p className="text-gray-500">Redirection...</p>
    </div>
  )

  // Liste des chercheurs déjà sélectionnés (pour affichage)
  const selectedChercheurs = chercheurs.filter(c => authorIds.includes(c.id))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6"><Link href="/admin/publications" className="inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft className="w-4 h-4" /> Retour</Link></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouvelle publication</h1>
      <p className="text-sm text-gray-400 mb-8">Ajoutez une publication scientifique</p>

      {submitError && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p className="text-sm">{submitError}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations principales */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase text-gray-900">Détails</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => handleChange("title", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.title ? "border-red-300" : "border-gray-200"}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} className={`w-full px-4 py-3 border rounded-xl text-sm resize-none ${errors.description ? "border-red-300" : "border-gray-200"}`} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Journal <span className="text-red-500">*</span></label>
              <input type="text" value={form.journal} onChange={e => handleChange("journal", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.journal ? "border-red-300" : "border-gray-200"}`} />
              {errors.journal && <p className="text-xs text-red-500 mt-1">{errors.journal}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Année <span className="text-red-500">*</span></label>
              <input type="number" value={form.year} onChange={e => handleChange("year", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.year ? "border-red-300" : "border-gray-200"}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={e => handleChange("type", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white ${errors.type ? "border-red-300" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                <option value="Article_Scientifique">Article Scientifique</option>
                <option value="Communication_De_Conference">Communication De Conférence</option>
              </select>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Domaine <span className="text-red-500">*</span></label>
              <select value={form.domain} onChange={e => handleChange("domain", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white ${errors.domain ? "border-red-300" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                <option>Environnement</option><option>Sciences</option><option>Santé</option><option>Économie</option><option>Lettres</option>
              </select>
              {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Laboratoire <span className="text-red-500">*</span></label>
              <select value={form.laboratoireId} onChange={e => handleChange("laboratoireId", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white ${errors.laboratoireId ? "border-red-300" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                {laboratoires.map((l: any) => <option key={l.id} value={l.id}>{l.acronym} – {l.name}</option>)}
              </select>
              {errors.laboratoireId && <p className="text-xs text-red-500 mt-1">{errors.laboratoireId}</p>}
            </div>
          </div>
        </div>

        {/* Auteurs */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase text-gray-900 flex items-center gap-2"><Users className="w-4 h-4" /> Auteurs <span className="text-red-500">*</span></h2>
          <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Chercheur</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={searchChercheur}
              onChange={e => { setSearchChercheur(e.target.value); setShowChercheurDropdown(true) }}
              onFocus={() => setShowChercheurDropdown(true)}
              placeholder="Rechercher un chercheur..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            />
            {showChercheurDropdown && filteredChercheurs.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredChercheurs.map(c => (
                  <button key={c.id} type="button" onClick={() => addAuthor(c.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
                    disabled={authorIds.includes(c.id)}>
                    {c.name} {c.laboratoireName ? `(${c.laboratoireName})` : ""}
                    {authorIds.includes(c.id) && <span className="text-green-500 ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.authors && <p className="text-xs text-red-500">{errors.authors}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedChercheurs.map(c => (
              <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                {c.name}
                <button type="button" onClick={() => removeAuthor(c.id)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Autres auteurs</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newOtherAuthors} onChange={e => setNewOtherAuthors(e.target.value)} placeholder="Ajouter un auteur" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addOtherAuthor())} />
              <button type="button" onClick={addOtherAuthor} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.othersAuthors.map(p => (
                <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg border border-purple-100">
                  {p}
                  <button type="button" onClick={() => removeOtherAuthor(p)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mots-clés */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase text-gray-900 flex items-center gap-2"><Tag className="w-4 h-4" /> Mots‑clés <span className="text-red-500">*</span></h2>
          <div className="flex gap-2">
            <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Ajouter un mot-clé" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKeyword())} />
            <button type="button" onClick={addKeyword} className="px-3 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
          {errors.keywords && <p className="text-xs text-red-500">{errors.keywords}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border">{kw} <button onClick={() => removeKeyword(kw)}><X className="w-3 h-3" /></button></span>
            ))}
          </div>
        </div>

        {/* PDF */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase text-gray-900 flex items-center gap-2"><FileUp className="w-4 h-4" /> Fichier PDF</h2>
          {pdfName ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <FileUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">{pdfName}</span>
              <button type="button" onClick={() => { setPdfFile(null); setPdfName(null) }} className="ml-auto text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
              <FileUp className="w-8 h-8 text-gray-300 mb-2" />
              <span className="text-sm text-gray-500">Cliquez pour uploader un PDF</span>
              <input type="file" accept=".pdf" onChange={handlePDF} className="hidden" />
            </label>
          )}
          {errors.pdf && <p className="text-xs text-red-500">{errors.pdf}</p>}
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Link href="/admin/publications" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Créer la publication
          </button>
        </div>
      </form>
    </div>
  )
}

function Tag(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2H2v10l9.17 9.17a2 2 0 0 0 2.83 0l7-7a2 2 0 0 0 0-2.83L12 2Z"/><path d="M7 7h.01"/></svg> }