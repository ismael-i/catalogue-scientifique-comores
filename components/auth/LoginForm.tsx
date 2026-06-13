"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from "@/hooks/useAuth"
import { AlertCircle, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err: any) {
      setError(err.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-full h-full flex items-center justify-center text-white font-semibold">
            <Image
              src="/logo.png"
              alt="Logo"
              width={250}
              height={250}
              className="object-contain"
            />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Connexion</h2>
          <p className="text-xs text-gray-500">Accédez à votre espace chercheur</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-600 block mb-1">Adresse e-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="chercheur@universite.km"
              className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.104-5.75M6.18 6.18A9.962 9.962 0 0112 5c5.523 0 10 4.477 10 10 0 1.5-.33 2.92-.915 4.175M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link href="#" className="text-xs text-blue-600 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-md transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
          </button>

          <div className="text-center text-xs text-gray-500">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Créer un compte
            </Link>
          </div>

        </form>
      </div>
    </div>
  )
}