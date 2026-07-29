"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { authApi, type RegisterInput } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++

  if (score <= 2) return { score, label: "Faible", color: "bg-red-500" }
  if (score <= 4) return { score, label: "Moyen", color: "bg-yellow-500" }
  return { score, label: "Fort", color: "bg-green-500" }
}

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: ''  
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const passwordStrength = getPasswordStrength(form.password)

  function validateField(name: string, value: string): string {
    switch (name) {
      case "name":
        if (value.length < 2) return "Le nom doit contenir au moins 2 caractères"
        if (value.length > 100) return "Le nom est trop long"
        return ""
      case "email":
        if (!value) return "L'email est requis"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format d'email invalide"
        return ""
      case "password":
        if (value.length < 8) return "Minimum 8 caractères"
        if (!/[A-Z]/.test(value)) return "Doit contenir une majuscule"
        if (!/[a-z]/.test(value)) return "Doit contenir une minuscule"
        if (!/[0-9]/.test(value)) return "Doit contenir un chiffre"
        if (!/[!@#$%^&*]/.test(value)) return "Doit contenir un caractère spécial (!@#$%^&*)"
        return ""
      case "confirmPassword":
        if (value !== form.password) return "Les mots de passe ne correspondent pas"
        return ""
      default:
        return ""
    }
  }

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    const err = validateField(field, value)
    setFieldErrors(prev => ({ ...prev, [field]: err }))
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {}
    const fields = ["name", "email", "password", "confirmPassword"]
    fields.forEach(field => {
      const err = validateField(field, form[field as keyof typeof form])
      if (err) errors[field] = err
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs ci-dessous")
      return
    }

    setLoading(true)
    try {
      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        institution: form.institution.trim() 
      })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Page de succès
  if (success) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-col items-center gap-3 mb-4">
            <Image src="/logo.png" alt="Logo" width={250} height={250} className="object-contain" />
          </div>

          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="relative">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-30" />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">Demande envoyée !</h2>
            <p className="text-xs text-gray-500">
              Votre demande a été transmise à l'administration du{" "}
              <strong>Catalogue Scientifique des Comores</strong>.
            </p>
          </div>

          {/* Étapes */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="text-xs font-semibold text-blue-900 mb-3">📋 Prochaines étapes</h3>
            <ol className="space-y-2">
              {[
                { step: "1", text: "L'administration examine votre demande", time: "24-48h" },
                { step: "2", text: "Vous recevez un email de validation", time: "Après validation" },
                { step: "3", text: "Cliquez sur le lien d'activation", time: "Sous 48h" },
                { step: "4", text: "Connectez-vous à votre espace", time: "Immédiat" }
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-xs text-blue-800">{item.text}</p>
                    <p className="text-xs text-blue-400">{item.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Email info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-xs text-yellow-800">
              📧 Un email sera envoyé à <strong>{form.email}</strong>
            </p>
            <p className="text-xs text-yellow-600 mt-1">Vérifiez aussi vos spams.</p>
          </div>

          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  // Formulaire
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex flex-col items-center gap-3 mb-4">
          <Image src="/logo.png" alt="Logo" width={250} height={250} className="object-contain" />
          <h2 className="text-lg font-semibold text-gray-800">Créer un compte</h2>
          <p className="text-xs text-gray-500">Rejoignez le catalogue scientifique comorien</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Erreur globale */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium">{error}</p>
                {fieldErrors.name && <p className="text-xs mt-0.5">• {fieldErrors.name}</p>}
                {fieldErrors.email && <p className="text-xs mt-0.5">• {fieldErrors.email}</p>}
                {fieldErrors.password && <p className="text-xs mt-0.5">• {fieldErrors.password}</p>}
                {fieldErrors.confirmPassword && <p className="text-xs mt-0.5">• {fieldErrors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Nom complet</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Dr Prénom Nom"
              className={`w-full px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                fieldErrors.name ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            />
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Adresse e-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="chercheur@universite.km"
              className={`w-full px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10 ${
                  fieldErrors.password ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Force du mot de passe */}
            {form.password.length > 0 && (
              <>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i <= passwordStrength.score / 2 ? passwordStrength.color : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${
                  passwordStrength.label === "Faible" ? "text-red-600" :
                  passwordStrength.label === "Moyen" ? "text-yellow-600" : "text-green-600"
                }`}>
                  Force : {passwordStrength.label}
                </p>

                {/* Règles */}
                <div className="mt-2 space-y-1">
                  {[
                    { regex: /.{8,}/, text: "Au moins 8 caractères" },
                    { regex: /[A-Z]/, text: "Une majuscule" },
                    { regex: /[a-z]/, text: "Une minuscule" },
                    { regex: /[0-9]/, text: "Un chiffre" },
                    { regex: /[!@#$%^&*]/, text: "Un caractère spécial (!@#$%^&*)" }
                  ].map((rule) => (
                    <div key={rule.text} className="flex items-center gap-2">
                      {rule.regex.test(form.password)
                        ? <CheckCircle className="w-3 h-3 text-green-500" />
                        : <div className="w-3 h-3 rounded-full border border-gray-300" />
                      }
                      <span className={`text-xs ${rule.regex.test(form.password) ? "text-green-700" : "text-gray-400"}`}>
                        {rule.text}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10 ${
                  fieldErrors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.confirmPassword && (
              <div className="flex items-center gap-2 mt-1">
                {form.confirmPassword === form.password ? (
                  <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-xs text-green-700">Les mots de passe correspondent</span></>
                ) : (
                  <><AlertCircle className="w-3 h-3 text-red-500" /><span className="text-xs text-red-600">Les mots de passe ne correspondent pas</span></>
                )}
              </div>
            )}
          </div>
                    {/* Institution */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Institution / Laboratoire </label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => handleChange("institution", e.target.value)}
              placeholder="Université des Comores"
              className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Envoi en cours...' : 'Envoyer ma demande'}</span>
          </button>

          <div className="text-center text-xs text-gray-500">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">Se connecter</Link>
          </div>

        </form>
      </div>
    </div>
  )
}