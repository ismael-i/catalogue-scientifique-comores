"use client"

import { useState, FormEvent } from "react"
import { useAuth } from "@/hooks/useAuth"
import { authApi } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { validatePassword, passwordsMatch } from "@/lib/validators/password"
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface ChangePasswordDialogProps {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

// ─── Composant principal ────────────────────────────────
export function ChangePasswordDialog({ show, onClose, onSuccess }: ChangePasswordDialogProps) {
  const { token } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const passwordCheck = validatePassword(newPassword)
  const match = passwordsMatch(newPassword, confirmPassword)
  const sameAsCurrent = currentPassword.length > 0 && currentPassword === newPassword

  const canSubmit =
    !!token &&
    currentPassword.length > 0 &&
    passwordCheck.isValid &&
    match &&
    !sameAsCurrent

  // ─── Reset à la fermeture ────────────────────────────────
  function handleClose() {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowCurrent(false)
    setShowNew(false)
    setError(null)
    setSuccess(false)
    onClose()
  }

  // ─── Soumettre le changement ─────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || !token) return

    setSaving(true)
    setError(null)

    try {
      await authApi.changePassword({ currentPassword, newPassword }, token)
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      onSuccess?.()
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1600)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Impossible de modifier le mot de passe."
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  // ─── Si fermé, ne rien rendre ───────────────────────────
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Modifier mon mot de passe</h3>
              <p className="text-xs text-gray-400">Utilisez un mot de passe différent de l&apos;actuel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Succès */}
        {success && (
          <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Mot de passe mis à jour avec succès.</p>
          </div>
        )}

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Mot de passe actuel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword.length > 0 && !passwordCheck.isValid && (
                <ul className="mt-1.5 space-y-0.5">
                  {passwordCheck.errors.map((err) => (
                    <li key={err} className="text-[11px] text-amber-600">• {err}</li>
                  ))}
                </ul>
              )}
              {sameAsCurrent && (
                <p className="mt-1.5 text-[11px] text-amber-600">
                  Le nouveau mot de passe doit être différent de l&apos;actuel
                </p>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                />
              </div>
              {confirmPassword.length > 0 && !match && (
                <p className="mt-1.5 text-[11px] text-amber-600">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {/* Bouton valider */}
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}