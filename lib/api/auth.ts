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

  validateRegistration: (userId: string, token: string) =>
    api.post(`/auth/admin/validate/${userId}`, {}, { token }),

  rejectRegistration: (userId: string, reason: string, token: string) =>
    api.post(`/auth/admin/reject/${userId}`, { reason }, { token }),
}