import { api } from "./client"
import type { PaginatedResponse } from "./chercheurs"

export interface InstitutionData {
  id: string
  acronym: string
  name: string
  description: string
  logo?: string
  logoBg?: string
  _count?: { chercheurs: number; laboratoires: number }
}

export interface InstitutionDetail extends InstitutionData {
  chercheurs?: any[]
  laboratoires?: any[]
}

export const institutionsApi = {
  findAll: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<InstitutionData>>("/institutions", { params }),

  findById: (id: string) =>
    api.get<InstitutionDetail>(`/institutions/${id}`),

  findByAcronym: (acronym: string) =>
    api.get<InstitutionDetail>(`/institutions/acronym/${acronym}`),

  getStats: (id: string) =>
    api.get<any>(`/institutions/${id}/stats`),

  create: (data: any, token: string) =>
    api.post("/institutions", data, { token }),

  update: (id: string, data: any, token: string) =>
    api.put(`/institutions/${id}`, data, { token }),

  delete: (id: string, token: string) =>
    api.delete(`/institutions/${id}`, { token }),
}