"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { chercheursApi, type ChercheurDetail } from "@/lib/api/chercheurs"
import { uploadApi } from "@/lib/api/upload"
import { getFileUrl } from "@/lib/utils/fileUrl"
import { ApiError } from "@/lib/api/client"
import Link from "next/link"
import { ArrowLeft, Save, Camera, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { ChangePasswordDialog } from "./ Changepassworddialog"

export default function ProfilChercheurPage() {
  const { user, token } = useAuth()
  const [chercheur, setChercheur] = useState<ChercheurDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: "", specialty: "", email: "", phone: "" ,note : ""})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Fiche PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)

  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    if (token && user?.chercheurId) {
      chercheursApi.findById(user.chercheurId).then(data => {
        setChercheur(data)
        setForm({
          name: data.name,
          specialty: data.specialty,
          email: data.email || "",
          phone: data.phone || "",
          note: data.note || ""
        })
      }).finally(() => setLoading(false))
    }
  }, [token, user])

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }
  const removePhoto = () => { setPhotoFile(null); setPhotoPreview(null) }

  const handlePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setPdfName(file.name)
    }
  }
  const removePDF = () => { setPdfFile(null); setPdfName(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !chercheur) return
    setSaving(true)
    setError(null)
    try {
      await chercheursApi.update(chercheur.id, {
        name: form.name,
        specialty: form.specialty,
        email: form.email,
        phone: form.phone,
        note : form.note
      }, token)

      if (photoFile) {
        try { await uploadApi.uploadPhoto(photoFile, "chercheurs", chercheur.id, token) } catch {}
      }

      if (pdfFile) {
        try { await uploadApi.uploadPDF(pdfFile, chercheur.id, token) } catch {}
      }

      setSuccess(true)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
  if (!chercheur) return <div>Chercheur introuvable</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft className="w-4 h-4" /> Retour</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil Chercheur</h1>

      <button onClick={() => setShowChangePassword(true)}className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">Changer mon mot de passe</button>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5" /> Profil mis à jour
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="bg-white rounded-2xl border p-6 flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24">
              {photoPreview ? (
                <img src={photoPreview} alt="Photo" className="w-24 h-24 rounded-2xl object-cover border" />
              ) : chercheur.photoUrl ? (
                <img src={getFileUrl(chercheur.photoUrl)} alt="Photo" className="w-24 h-24 rounded-2xl object-cover border" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <Camera className="w-6 h-6" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-white rounded-full border p-1 cursor-pointer">
                <Camera className="w-4 h-4 text-gray-500" />
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            </div>
            {photoPreview && <button onClick={removePhoto} className="text-xs text-red-500 mt-1">Annuler</button>}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nom</label>
              <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Spécialité</label>
              <input type="text" value={form.specialty} onChange={e => handleChange("specialty", e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Téléphone</label>
            <input type="phone" value={form.phone} onChange={e => handleChange("phone", e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Note</label>
            <input type="text" max={200} value={form.note} onChange={e => handleChange("note", e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm" />

          </div>
        </div>

        {/* Institution / Laboratoire (lecture seule) */}
        <div className="bg-white rounded-2xl border p-6 grid grid-cols-2 gap-4">
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
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Laboratoire(s)</label>
            <input
              type="text"
              value={
                chercheur.laboratoires && chercheur.laboratoires.length > 0
                  ? chercheur.laboratoires.map(l => l.acronym).join(', ')
                  : "Aucun"
              }
              disabled
              className="w-full px-4 py-2.5 border rounded-xl text-sm bg-gray-50 text-gray-500"
            />
          </div>
        </div>
        {/* Fiche PDF */}
        <div className="bg-white rounded-2xl border p-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Fiche PDF</label>
          {pdfName ? (
            <div className="flex items-center gap-2 text-sm text-blue-600">{pdfName} <button onClick={removePDF}><X className="w-4 h-4 text-red-500" /></button></div>
          ) : chercheur.fiche ? (
            <div className="flex items-center gap-2 text-sm">
              <a href={getFileUrl(chercheur.fiche)} target="_blank" className="text-blue-600 underline">Voir la fiche actuelle</a>
              <label className="cursor-pointer text-xs text-gray-500 hover:text-blue-600">(Remplacer)
                <input type="file" accept=".pdf" onChange={handlePDF} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer text-sm text-blue-600 hover:underline">+ Ajouter une fiche PDF
              <input type="file" accept=".pdf" onChange={handlePDF} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer
          </button>
        </div>
      </form>

      <ChangePasswordDialog
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => {/* toast, refresh, etc. */}}
      />
    </div>
  )
}