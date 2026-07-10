"use client"

import { useEffect, useState, FormEvent, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api/auth"
import { validatePassword, passwordsMatch } from "@/lib/validators/password"
import { ApiError } from "@/lib/api/client"
import { Eye, EyeOff } from "lucide-react"

type PageState = "checking" | "invalid" | "ready" | "submitting" | "done" | "submitError"

// 1. On crée le composant interne qui consomme useSearchParams
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [pageState, setPageState] = useState<PageState>("checking")
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!token) {
      setPageState("invalid")
      setErrorMessage("Aucun token trouvé dans le lien.")
      return
    }

    authApi
      .verifyResetToken(token)
      .then((res) => {
        setEmail(res.email)
        setPageState("ready")
      })
      .catch((err) => {
        const message =
          err instanceof ApiError ? err.message : "Lien invalide ou expiré."
        setErrorMessage(message)
        setPageState("invalid")
      })
  }, [token])

  const passwordCheck = validatePassword(newPassword)
  const match = passwordsMatch(newPassword, confirmPassword)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordCheck.isValid || !match) return

    setPageState("submitting")
    try {
      await authApi.resetPassword({ token, newPassword })
      setPageState("done")
      setTimeout(() => router.push("/auth/login"), 2500)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible de réinitialiser le mot de passe."
      setErrorMessage(message)
      setPageState("submitError")
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      {pageState === "checking" && (
        <p className="text-sm text-slate-500">Vérification du lien…</p>
      )}

      {pageState === "invalid" && (
        <>
          <h1 className="text-xl font-semibold text-slate-900">
            Lien invalide
          </h1>
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          <Link
            href="/auth/forgot-password"
            className="mt-6 inline-block text-sm underline hover:text-slate-700"
          >
            Faire une nouvelle demande
          </Link>
        </>
      )}

      {pageState === "done" && (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          Mot de passe réinitialisé avec succès. Redirection vers la connexion…
        </div>
      )}

      {(pageState === "ready" ||
        pageState === "submitting" ||
        pageState === "submitError") && (
        <>
          <h1 className="text-xl font-semibold text-slate-900">
            Nouveau mot de passe
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pour <span className="font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Nouveau mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && !passwordCheck.isValid && (
                <ul className="mt-1 list-inside list-disc text-xs text-amber-600">
                  {passwordCheck.errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !match && (
                <p className="mt-1 text-xs text-amber-600">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {pageState === "submitError" && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={
                pageState === "submitting" ||
                !passwordCheck.isValid ||
                !match
              }
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pageState === "submitting"
                ? "Réinitialisation…"
                : "Réinitialiser le mot de passe"}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

// 2. Le composant principal de la page qui enveloppe le formulaire dans un Suspense
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Chargement de la page…</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}