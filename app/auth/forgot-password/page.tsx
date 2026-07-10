"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  )
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus("loading")
    setErrorMessage("")

    try {
      // Le backend renvoie toujours un message générique, compte existant ou non,
      // donc on affiche systématiquement l'état "sent" en cas de succès HTTP.
      await authApi.forgotPassword({ email: email.trim() })
      setStatus("sent")
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible de contacter le serveur. Réessayez plus tard."
      setErrorMessage(message)
      setStatus("error")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Indiquez votre email, nous vous enverrons un lien de
          réinitialisation.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            Si un compte existe avec cet email, un lien de réinitialisation
            vous a été envoyé. Vérifiez votre boîte de réception (et vos
            spams).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading"
                ? "Envoi en cours…"
                : "Envoyer le lien de réinitialisation"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          <Link href="/auth/login" className="underline hover:text-slate-700">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}