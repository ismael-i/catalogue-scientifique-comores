"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { publicationsApi, type PublicationData } from "@/lib/api/publications"
import { chercheursApi, type ChercheurCard } from "@/lib/api/chercheurs"
import { laboratoiresApi } from "@/lib/api/laboratoires"
import { uploadApi } from "@/lib/api/upload"
import { getFileUrl } from "@/lib/utils/fileUrl"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import {
  ArrowLeft, Save, Plus, X, Loader2, AlertCircle, CheckCircle,
  FileUp, Search, Users, FlaskConical, RotateCcw, Trash2, Tag, BookOpen
} from "lucide-react"

// ─── Types locaux ──────────────────────────────────────
interface LaboOption {
  id: string
  acronym: string
  name: string
}

export default function ModifierPublicationPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()
  const id = params.id as string

  // ─── Données originales ──────────────────────────────
  const [publication, setPublication] = useState<PublicationData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ─── Formulaire ─────────────────────────────────────
  const [form, setForm] = useState({
    title: "",
    description: "",
    journal: "",
    year: "",
    domain: "",
    type: "",
    laboratoireId: "",
    institutionAcronym: ""
  })
  const [authorIds, setAuthorIds] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ─── UI ────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ─── PDF ───────────────────────────────────────────
  enum PdfAction { KEEP = "keep", UPLOAD = "upload", REMOVE = "remove" }
  const [pdfAction, setPdfAction] = useState<PdfAction>(PdfAction.KEEP)
  const [currentPdfPath, setCurrentPdfPath] = useState<string | null>(null)
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null)
  const [newPdfName, setNewPdfName] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // ─── Sélecteurs ────────────────────────────────────
  const [chercheurs, setChercheurs] = useState<ChercheurCard[]>([])
  const [laboratoires, setLaboratoires] = useState<LaboOption[]>([])
  const [searchChercheur, setSearchChercheur] = useState("")
  const [filteredChercheurs, setFilteredChercheurs] = useState<ChercheurCard[]>([])
  const [showChercheurDropdown, setShowChercheurDropdown] = useState(false)

  // ─── Auth ──────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/auth/login?redirect=/admin/publications/" + id + "/modifier")
    }
  }, [user, authLoading, router, id])

  // ─── Chargement initial ────────────────────────────
  useEffect(() => {
    if (!token || !id) return

    const load = async () => {
      setLoadingData(true)
      try {
        const [pubData, labosData, cherData] = await Promise.all([
          publicationsApi.findById(id),
          laboratoiresApi.findAllSimple(),
          chercheursApi.findAll({ limit: 200 })
        ])

        setPublication(pubData)
        setLaboratoires(labosData || [])
        setChercheurs(cherData.data || [])

        // Remplir le formulaire
        setForm({
          title: pubData.title || "",
          description: pubData.description || "",
          journal: pubData.journal || "",
          year: pubData.year?.toString() || "",
          domain: pubData.domain || "",
          type: pubData.type || "",
          laboratoireId: pubData.laboratoire?.acronym ? "" : "", // l'API renvoie un objet laboratoire, il nous faut l'ID
          institutionAcronym: pubData.institutionAcronym || ""
        })
        // Récupérer l'ID du laboratoire à partir de l'objet
        if (pubData.laboratoire?.acronym) {
          const labo = labosData?.find((l: any) => l.acronym === pubData.laboratoire.acronym || l.id === (pubData.laboratoire as any).id)
          if (labo) {
            setForm(prev => ({ ...prev, laboratoireId: labo.id }))
          }
        }

        // Auteurs
        setAuthorIds(pubData.authors?.map(a => a.id) || [])

        // Mots-clés
        setKeywords(pubData.keywords?.map(k => k.keyword) || [])

        // PDF
        if (pubData.pdfUrl) {
          setCurrentPdfPath(pubData.pdfUrl)
        }

      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "Publication introuvable")
      } finally {
        setLoadingData(false)
      }
    }

    load()
  }, [token, id])

  // ─── Filtrage chercheurs ───────────────────────────
  useEffect(() => {
    if (!searchChercheur.trim()) {
      setFilteredChercheurs(chercheurs.slice(0, 15))
    } else {
      const q = searchChercheur.toLowerCase()
      setFilteredChercheurs(
        chercheurs.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.specialty?.toLowerCase().includes(q)
        ).slice(0, 15)
      )
    }
  }, [searchChercheur, chercheurs])

  // ─── Handlers formulaire ───────────────────────────
  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const c = { ...prev }; delete c[field]; return c })
  }

  // Auteurs
  const addAuthor = (chercheurId: string) => {
    if (!authorIds.includes(chercheurId)) {
      setAuthorIds(prev => [...prev, chercheurId])
    }
    setSearchChercheur("")
    setShowChercheurDropdown(false)
  }
  const removeAuthor = (chercheurId: string) =>
    setAuthorIds(prev => prev.filter(id => id !== chercheurId))

  // Mots-clés
  const addKeyword = () => {
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw)) {
      setKeywords(prev => [...prev, kw])
      setNewKeyword("")
    }
  }
  const removeKeyword = (kw: string) =>
    setKeywords(prev => prev.filter(k => k !== kw))

  // PDF handlers
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      setPdfError("Seuls les fichiers PDF sont acceptés")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfError("Le fichier ne doit pas dépasser 10 MB")
      return
    }
    setPdfError(null)
    setNewPdfFile(file)
    setNewPdfName(file.name)
    setPdfAction(PdfAction.UPLOAD)
  }
  const handleRemovePdf = () => {
    setNewPdfFile(null)
    setNewPdfName(null)
    setPdfAction(PdfAction.REMOVE)
  }
  const handleCancelPdfChanges = () => {
    setNewPdfFile(null)
    setNewPdfName(null)
    setPdfAction(PdfAction.KEEP)
  }

  // ─── Validation ────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = "Titre requis"
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = "Description trop courte (min 10)"
    if (!form.journal.trim()) errs.journal = "Journal requis"
    if (!form.year || isNaN(Number(form.year)) || Number(form.year) < 1900 || Number(form.year) > 2030) errs.year = "Année invalide"
    if (!form.domain) errs.domain = "Domaine requis"
    if (!form.type) errs.type = "Type requis"
    if (!form.laboratoireId) errs.laboratoireId = "Laboratoire requis"
    if (authorIds.length === 0) errs.authors = "Au moins un auteur requis"
    if (keywords.length === 0) errs.keywords = "Au moins un mot-clé requis"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ─── Détection changements ─────────────────────────
  const hasChanges = (): boolean => {
    if (!publication) return false
    if (pdfAction !== PdfAction.KEEP) return true

    const originalAuthors = publication.authors?.map(a => a.id).sort() || []
    const currentAuthors = [...authorIds].sort()
    const originalKeywords = (publication.keywords?.map(k => k.keyword) || []).sort()
    const currentKeywords = [...keywords].sort()

    return (
      form.title !== publication.title ||
      form.description !== publication.description ||
      form.journal !== publication.journal ||
      form.year !== publication.year?.toString() ||
      form.domain !== publication.domain ||
      form.type !== publication.type ||
      form.laboratoireId !== (publication.laboratoire?.acronym ? "" : "") || // simplification
      form.institutionAcronym !== (publication.institutionAcronym || "") ||
      JSON.stringify(currentAuthors) !== JSON.stringify(originalAuthors) ||
      JSON.stringify(currentKeywords) !== JSON.stringify(originalKeywords)
    )
  }

  // ─── Soumission ────────────────────────────────────
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
        journal: form.journal.trim(),
        year: Number(form.year),
        domain: form.domain,
        type: form.type,
        laboratoireId: form.laboratoireId,
        institutionAcronym: form.institutionAcronym.trim() || undefined,
        authorIds,
        keywords
      }

      await publicationsApi.update(id, payload, token)

      // Gestion du PDF
      if (pdfAction === PdfAction.REMOVE && currentPdfPath) {
        try { await uploadApi.deletePublicationPDF(id, token) } catch (err) { console.error(err) }
      } else if (pdfAction === PdfAction.UPLOAD && newPdfFile) {
        if (currentPdfPath) {
          try { await uploadApi.deletePublicationPDF(id, token) } catch (err) { console.error(err) }
        }
        try { await uploadApi.uploadPublicationPDF(newPdfFile, id, token) } catch (err) { console.error(err) }
      }

      setSuccess(true)
      setTimeout(() => router.push(`/admin/publications/${id}`), 1500)

    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  // ─── Rendu conditionnel ────────────────────────────
  if (authLoading || loadingData) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{loadError}</p>
          <Link href="/admin/publications" className="text-xs underline">Retour</Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Modifications enregistrées</h2>
        <p className="text-gray-500">Redirection vers la publication...</p>
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mt-4" />
      </div>
    )
  }

  // ─── Chercheurs déjà sélectionnés ──────────────────
  const selectedChercheurs = chercheurs.filter(c => authorIds.includes(c.id))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/admin/publications/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Retour à la publication
        </Link>
        <span className="text-xs text-gray-400">
          Modification de <strong>{publication?.title}</strong>
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Modifier la publication</h1>
      <p className="text-sm text-gray-400 mb-8">Modifiez les métadonnées et le fichier PDF</p>

      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="w-5 h-5" /><p className="text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Détails ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" /> Détails
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => handleChange("title", e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3}
              className={`w-full px-4 py-3 border rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Journal <span className="text-red-500">*</span></label>
              <input type="text" value={form.journal} onChange={e => handleChange("journal", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.journal ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
              {errors.journal && <p className="text-xs text-red-500 mt-1">{errors.journal}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Année <span className="text-red-500">*</span></label>
              <input type="number" value={form.year} onChange={e => handleChange("year", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.year ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
              {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={e => handleChange("type", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.type ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
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
              <select value={form.domain} onChange={e => handleChange("domain", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.domain ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                <option>Environnement</option><option>Sciences</option><option>Santé</option><option>Économie</option><option>Lettres</option>
              </select>
              {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Laboratoire <span className="text-red-500">*</span></label>
              <select value={form.laboratoireId} onChange={e => handleChange("laboratoireId", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none ${errors.laboratoireId ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                <option value="">Sélectionner</option>
                {laboratoires.map(l => <option key={l.id} value={l.id}>{l.acronym} – {l.name}</option>)}
              </select>
              {errors.laboratoireId && <p className="text-xs text-red-500 mt-1">{errors.laboratoireId}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Acronyme institution (optionnel)</label>
            <input type="text" value={form.institutionAcronym} onChange={e => handleChange("institutionAcronym", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
        </div>

        {/* ─── Auteurs ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> Auteurs <span className="text-red-500">*</span>
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchChercheur}
              onChange={e => { setSearchChercheur(e.target.value); setShowChercheurDropdown(true) }}
              onFocus={() => setShowChercheurDropdown(true)}
              placeholder="Rechercher un chercheur à ajouter..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            {showChercheurDropdown && filteredChercheurs.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredChercheurs.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => addAuthor(c.id)}
                    disabled={authorIds.includes(c.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors ${authorIds.includes(c.id) ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">{c.name.charAt(0)}</div>
                    <span>{c.name}</span>
                    {authorIds.includes(c.id) && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
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
            {selectedChercheurs.length === 0 && (
              <p className="text-xs text-gray-400">Aucun auteur sélectionné</p>
            )}
          </div>
        </div>

        {/* ─── Mots-clés ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" /> Mots‑clés <span className="text-red-500">*</span>
          </h2>
          <div className="flex gap-2">
            <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)}
              placeholder="Ajouter un mot-clé" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKeyword())} />
            <button type="button" onClick={addKeyword} className="px-3 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
          {errors.keywords && <p className="text-xs text-red-500">{errors.keywords}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border">
                {kw}
                <button type="button" onClick={() => removeKeyword(kw)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {keywords.length === 0 && <p className="text-xs text-gray-400">Aucun mot-clé</p>}
          </div>
        </div>

        {/* ─── PDF ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <FileUp className="w-4 h-4 text-gray-400" /> Fichier PDF
          </h2>

          {/* PDF conservé */}
          {pdfAction === PdfAction.KEEP && currentPdfPath && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <FileUp className="w-5 h-5 text-green-600" />
              <a href={getFileUrl(currentPdfPath)} target="_blank" rel="noopener noreferrer"
                className="text-sm text-green-700 underline">Voir le PDF actuel</a>
              <button type="button" onClick={handleRemovePdf} className="ml-auto text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* PDF supprimé (non enregistré) */}
          {pdfAction === PdfAction.REMOVE && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-amber-700">Le PDF sera supprimé à l'enregistrement</span>
              <button type="button" onClick={handleCancelPdfChanges} className="ml-auto text-amber-700 underline text-sm">Annuler</button>
            </div>
          )}

          {/* Nouveau PDF sélectionné */}
          {pdfAction === PdfAction.UPLOAD && newPdfName && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <FileUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">{newPdfName} ({(newPdfFile!.size / 1024 / 1024).toFixed(2)} MB)</span>
              <button type="button" onClick={() => { setNewPdfFile(null); setNewPdfName(null); setPdfAction(PdfAction.KEEP) }}
                className="ml-auto text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Zone d'upload (toujours visible sauf si déjà un nouveau PDF) */}
          {pdfAction !== PdfAction.UPLOAD && (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group mt-3">
              <FileUp className="w-6 h-6 text-gray-300 group-hover:text-blue-400 mb-2" />
              <span className="text-sm text-gray-500 group-hover:text-blue-600">
                {currentPdfPath ? "Remplacer le PDF" : "Ajouter un PDF"}
              </span>
              <input type="file" accept=".pdf" onChange={handlePdfSelect} className="hidden" />
            </label>
          )}

          {pdfError && <p className="text-xs text-red-500 mt-1">{pdfError}</p>}
        </div>

        {/* ─── Actions ──────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 pb-8">
          <div>
            {hasChanges() ? (
              <span className="text-xs text-amber-600 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Modifications non enregistrées
              </span>
            ) : (
              <span className="text-xs text-gray-400">Aucune modification</span>
            )}
          </div>
          <div className="flex gap-3">
            <Link href={`/admin/publications/${id}`}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              Annuler
            </Link>
            <button type="submit" disabled={saving || !hasChanges()}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}