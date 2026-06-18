"use client"

import { useState, useEffect } from "react"
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
  FileUp, Search, Users, FlaskConical, Tag
} from "lucide-react"

export default function NouvellePublicationChercheurPage() {
  const router = useRouter()
  const { user, token } = useAuth()

  const [form, setForm] = useState({
    title: "", description: "", journal: "",
    year: new Date().getFullYear().toString(),
    domain: "", type: "", laboratoireId: "", institutionAcronym: ""
  })
  // Le chercheur connecté est toujours auteur
  const [authorIds, setAuthorIds] = useState<string[]>([user?.chercheurId || ""])
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

  const [chercheurProfil, setChercheurProfil] = useState<any>(null)

  useEffect(() => {
    if (token && user?.chercheurId) {
      chercheursApi.findById(user.chercheurId).then(data => {
        setChercheurProfil(data)
        // Pré-remplir le laboratoire du chercheur si possible
        if (data.laboratoire?.id) {
          setForm(prev => ({ ...prev, laboratoireId: data.laboratoire!.id }))
        }
      })
    }
    chercheursApi.findAll({ limit: 200 }).then(res => setChercheurs(res.data)).catch(() => {})
    laboratoiresApi.findAllSimple().then(data => setLaboratoires(data || [])).catch(() => {})
  }, [token, user])

  useEffect(() => {
    if (!searchChercheur.trim()) setFilteredChercheurs(chercheurs.slice(0, 15))
    else {
      const q = searchChercheur.toLowerCase()
      setFilteredChercheurs(chercheurs.filter(c => c.name.toLowerCase().includes(q)).slice(0, 15))
    }
  }, [searchChercheur, chercheurs])

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = {...prev}; delete c[field]; return c })
  }

  const addAuthor = (cid: string) => {
    if (!authorIds.includes(cid)) setAuthorIds(prev => [...prev, cid])
    setSearchChercheur("")
  }
  const removeAuthor = (cid: string) => {
    if (cid === user?.chercheurId) return // ne pas se retirer soi-même
    setAuthorIds(prev => prev.filter(id => id !== cid))
  }

  const addKeyword = () => {
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw)) { setKeywords(prev => [...prev, kw]); setNewKeyword("") }
  }
  const removeKeyword = (kw: string) => setKeywords(prev => prev.filter(k => k !== kw))

  const handlePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") { setErrors(prev => ({ ...prev, pdf: "PDF uniquement" })); return }
    setPdfFile(file); setPdfName(file.name)
    setErrors(prev => { const c = {...prev}; delete c.pdf; return c })
  }
    const removePDF = () => { setPdfFile(null); setPdfName(null) }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = "Titre requis"
        if (!form.title.trim() || form.title.trim().length < 5) errs.title = "Titre trop court (min 5 caractères)"
    if (!form.description.trim() || form.description.trim().length < 20) errs.description = "Description trop courte(min 20 caractères)"
    if (!form.journal.trim()) errs.journal = "Journal requis"
    if (!form.domain) errs.domain = "Domaine requis"
    if (!form.type) errs.type = "Type requis"
    if (!form.laboratoireId) errs.laboratoireId = "Laboratoire requis"
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
        keywords
      }
      const pub = await publicationsApi.create(payload, token)
      if (pdfFile) {
        try { await uploadApi.uploadPublicationPDF(pdfFile, pub.id, token) } catch {}
      }
      setSuccess(true)
      setTimeout(() => router.push("/dashboard/publications"), 1500)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur création")
      setSaving(false)
    }
  }

  if (!chercheurProfil) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
  if (success) return <div className="max-w-2xl mx-auto py-20 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" /><h2 className="text-2xl font-bold">Publication créée !</h2></div>

  const selectedChercheurs = chercheurs.filter(c => authorIds.includes(c.id))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/publications" className="inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft className="w-4 h-4" /> Retour aux publications</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Nouvelle publication</h1>
      {submitError && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3"><AlertCircle className="w-5 h-5" /><p className="text-sm">{submitError}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Détails */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase">Détails</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Titre <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => handleChange("title", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.title ? "border-red-300" : "border-gray-200"}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} className={`w-full px-4 py-3 border rounded-xl text-sm resize-none ${errors.description ? "border-red-300" : "border-gray-200"}`} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Journal <span className="text-red-500">*</span></label>
              <input type="text" value={form.journal} onChange={e => handleChange("journal", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.journal ? "border-red-300" : "border-gray-200"}`} />
              {errors.journal && <p className="text-xs text-red-500 mt-1">{errors.journal}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Année <span className="text-red-500">*</span></label>
              <input type="number" value={form.year} onChange={e => handleChange("year", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm ${errors.year ? "border-red-300" : "border-gray-200"}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Type <span className="text-red-500">*</span></label>
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
              <label className="block text-xs font-semibold text-gray-500 mb-1">Domaine <span className="text-red-500">*</span></label>
              <select value={form.domain} onChange={e => handleChange("domain", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white ${errors.domain ? "border-red-300" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                <option>Environnement</option><option>Sciences</option><option>Santé</option><option>Économie</option><option>Lettres</option>
              </select>
              {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Laboratoire <span className="text-red-500">*</span></label>
              <select disabled value={form.laboratoireId} onChange={e => handleChange("laboratoireId", e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white ${errors.laboratoireId ? "border-red-300" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                {laboratoires.map((l: any) => <option key={l.id} value={l.id}>{l.acronym} – {l.name}</option>)}
              </select>
              {errors.laboratoireId && <p className="text-xs text-red-500 mt-1">{errors.laboratoireId}</p>}
            </div>
          </div>
        </div>

        {/* Auteurs (le chercheur lui-même est fixe) */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase flex items-center gap-2"><Users className="w-4 h-4" /> Auteurs</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchChercheur} onChange={e => setSearchChercheur(e.target.value)} placeholder="Ajouter un co-auteur..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            {searchChercheur && filteredChercheurs.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {filteredChercheurs.filter(c => !authorIds.includes(c.id)).map(c => (
                  <button key={c.id} type="button" onClick={() => addAuthor(c.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center gap-2">
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedChercheurs.map(c => (
              <span key={c.id} className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border ${c.id === user?.chercheurId ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-700"}`}>
                {c.name}
                {c.id !== user?.chercheurId && <button type="button" onClick={() => removeAuthor(c.id)}><X className="w-3 h-3" /></button>}
                {c.id === user?.chercheurId && <span className="text-[10px] ml-1">(vous)</span>}
              </span>
            ))}
          </div>
        </div>

     {/* Mots-clés */}
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase">Mots‑clés <span className="text-red-500">*</span></h2>
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
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase">Fichier PDF</h2>
          {pdfName ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <FileUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">{pdfName}</span>
              <button type="button" onClick={removePDF} className="ml-auto text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
              <FileUp className="w-8 h-8 text-gray-300 mb-2" />
              <span className="text-sm text-gray-500">Cliquez pour uploader un PDF</span>
              <input type="file" accept=".pdf" onChange={handlePDF} className="hidden" />
            </label>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/publications" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Créer la publication
          </button>
        </div>
      </form>
    </div>
  )
}