import { api } from "./client"
import type { PaginatedResponse } from "./chercheurs"

export interface PublicationData {
  id: string
  title: string
  domain: string
  year: number
  type: string
  journal: string
  description: string
  pdfUrl?: string
  laboratoire: { acronym: string; name: string }
  authors: { id: string; name: string; institution?: string; faculty?: string }[]
  keywords: { id: string; keyword: string }[]
  institutionAcronym?: string
}

export interface PublicationStats {
  total: number
  byDomain: { domain: string; _count: number }[]
  byYear: { year: number; _count: number }[]
  recentPublications: { year: number; title: string; id: string }[]
}

export const publicationsApi = {
  findAll: (params?: {
    search?: string
    domain?: string
    type?: string
    year?: number
    laboratoire?: string
    institution?: string
    page?: number
    limit?: number
  }) =>
    api.get<PaginatedResponse<PublicationData>>("/publications", { params }),

  findById: (id: string) =>
    api.get<PublicationData>(`/publications/${id}`),

  getStats: () =>
    api.get<PublicationStats>("/publications/stats"),

  create: (data: any, token: string) =>
    api.post("/publications", data, { token }),

  update: (id: string, data: any, token: string) =>
    api.put(`/publications/${id}`, data, { token }),

  delete: (id: string, token: string) =>
    api.delete(`/publications/${id}`, { token }),
}