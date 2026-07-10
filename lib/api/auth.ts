import { api } from "./client"

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  chercheurId?: string
    institution?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: "ADMIN" | "CHERCHEUR"
    status: string
    chercheurId?: string
    institution?: string
  }
}

export interface PendingUser {
  id: string
  email: string
  name: string
  createdAt: string
  chercheur?: {
    specialty: string
    institution: { name: string }
  } | null
}

// Types pour la recherche de chercheurs
export interface ChercheurSearchResult {
  id: string
  name: string
  email: string | null
  specialty: string
  photoUrl: string | null
  institution: { acronym: string; name: string }
  laboratoire: { acronym: string; name: string } | null
  hasAccount: boolean
}

export interface CreateChercheurInput {
  name: string
  email?: string
  specialty: string
  institutionId: string
  faculty?: string
  laboratoireId?: string
  phone?: string
}

// Types pour la gestion du mot de passe
export interface ForgotPasswordInput {
  email: string
}
 
export interface ResetPasswordInput {
  token: string
  newPassword: string
}
 
export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}
 
export interface VerifyResetTokenResult {
  valid: boolean
  email: string
}

export const authApi = {
  login: (data: LoginInput) =>
    api.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterInput) =>
    api.post<{ message: string; status: string }>("/auth/register", data),

  activate: (token: string) =>
    api.get<{ message: string }>(`/auth/activate?token=${token}`),

  getProfile: (token: string) =>
    api.get<any>("/auth/profile", { token }),

  logout: (token: string) =>
    api.post("/auth/logout", {}, { token }),

  // Admin
  getPendingRegistrations: (token: string) =>
    api.get<PendingUser[]>("/auth/admin/pending-registrations", { token }),


  rejectRegistration: (userId: string, reason: string, token: string) =>
    api.post(`/auth/admin/reject/${userId}`, { reason }, { token }),

  // Rechercher des chercheurs pour assignation
  searchChercheurs: (query: string, token: string) =>
    api.get<ChercheurSearchResult[]>(`/auth/admin/search-chercheurs?q=${encodeURIComponent(query)}`, { token }),

  // Créer un nouveau chercheur
  createChercheur: (data: CreateChercheurInput, token: string) =>
    api.post<any>("/auth/admin/create-chercheur", data, { token }),

  // Valider avec assignation de chercheur
  validateRegistration: (userId: string, chercheurId: string, token: string) =>
    api.post(`/auth/admin/validate/${userId}`, { chercheurId }, { token }),


    // 1. Demande de réinitialisation (mot de passe oublié) — pas de token requis
  forgotPassword: (data: ForgotPasswordInput) =>
    api.post<{ message: string }>("/auth/forgot-password", data),
 
  // 2. Vérifier la validité d'un token reçu par email, avant d'afficher le formulaire
  verifyResetToken: (token: string) =>
    api.get<VerifyResetTokenResult>(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`),
 
  // 3. Réinitialisation avec le token reçu par email — pas de token d'auth requis
  resetPassword: (data: ResetPasswordInput) =>
    api.post<{ message: string }>("/auth/reset-password", data),
 
  // 4. Changement de mot de passe (utilisateur connecté)
  changePassword: (data: ChangePasswordInput, token: string) =>
    api.post<{ message: string }>("/auth/change-password", data, { token }),
 
  // 5. Réinitialisation par un administrateur, même pattern que reject/validate
  adminResetPassword: (targetUserId: string, newPassword: string, token: string) =>
    api.post<{ message: string }>(
      "/auth/admin/reset-password",
      { userId: targetUserId, newPassword },
      { token }
    ),
}