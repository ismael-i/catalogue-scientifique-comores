const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3150/api"

interface FetchOptions extends RequestInit {
  token?: string
  params?: Record<string, string | number | undefined>
}

class ApiError extends Error {
  status: number
  details?: any

  constructor(message: string, status: number, details?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}


export async function apiClient<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, params, ...fetchOptions } = options

  // Construire l'URL avec les query params
  let url = `${API_URL}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Headers par défaut
const headers: Record<string, string> = {}

  // Ne pas mettre Content-Type pour FormData
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  // Ajouter le token d'authentification
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // Pour les cookies HTTP-only
    })

    // Gérer les réponses sans contenu
    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || `Erreur ${response.status}`,
        response.status,
        data.details
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Erreur réseau
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiError(
        "Impossible de contacter le serveur. Vérifiez votre connexion.",
        0
      )
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Erreur inconnue",
      500
    )
  }
}

// Méthodes helper
export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T = any>(endpoint: string, formData: FormData, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    }),
}

export { ApiError }