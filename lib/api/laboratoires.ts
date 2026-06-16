import { api } from "./client"
import type { PaginatedResponse } from "./chercheurs"

export interface LaboratoireCard {
  id: string
  acronym: string
  name: string
  description: string
  categorie: string
  researchers: number
  statut: string
  logo?: string
  institution: { acronym: string; name: string; logo?: string }
  responsable?: { id: string; name: string; photoUrl?: string; email?: string }
  _count?: { chercheurs: number; publications: number }
}

export interface LaboratoireDetail {
  id: string
  acronym: string
  name: string
  description: string
  categorie: string
  researchers: number
  statut: string
  thematiques: string[]
  partenariats: string[]
  logo?: string
  contactEmail?: string
  contactTelephone?: string
  contactSite?: string
  institution: {
    id: string
    acronym: string
    name: string
    logo?: string
  }
  responsable?: {
    id: string
    name: string
    photoUrl?: string
    email?: string
  }
  chercheurs?: {
    id: string
    name: string
    specialty: string
    photoUrl?: string
    email?: string
    phone?: string
    faculty?: string
  }[]
  publications?: any[]
}

export const laboratoiresApi = {
  findAll: (params?: {
    search?: string
    category?: string
    institution?: string
    page?: number
    limit?: number
  }) =>
    api.get<PaginatedResponse<LaboratoireCard>>("/laboratoires", { params }),

  findById: (id: string) =>
    api.get<LaboratoireDetail>(`/laboratoires/${id}`),

  findByAcronym: (acronym: string) =>
    api.get<LaboratoireDetail>(`/laboratoires/acronym/${acronym}`),

  getChercheurs: (id: string) =>
    api.get<any[]>(`/laboratoires/${id}/chercheurs`),

  getPublications: (id: string) =>
    api.get<any[]>(`/laboratoires/${id}/publications`),

  create: (data: any, token: string) =>
    api.post("/laboratoires", data, { token }),

  update: (id: string, data: any, token: string) =>
    api.put(`/laboratoires/${id}`, data, { token }),

  delete: (id: string, token: string) =>
    api.delete(`/laboratoires/${id}`, { token }),
  // Pour les sélecteurs
   findAllSimple: async (institutionId?: string): Promise<{ id: string; acronym: string; name: string }[]> => {
    const params: Record<string, string | number | undefined> = {
      limit: 100
    }
    if (institutionId) {
      params.institution = institutionId
    }

    const response = await api.get<PaginatedResponse<{ id: string; acronym: string; name: string }>>(
      "/laboratoires",
      { params }
    )

    // ⚡ Extraire le tableau .data de la réponse paginée
    return response.data || []
  }
}