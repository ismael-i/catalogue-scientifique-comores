import { api } from "./client"
import type { PaginatedResponse } from "./chercheurs"

export interface PublicationAuthor {
  id: string
  name: string
  photoUrl?: string
  institution?: string
  faculty?: string
  email?: string
  chercheurId?: string
}

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
  authors: PublicationAuthor[]
  keywords: { id: string; keyword: string }[]
  institutionAcronym?: string
  othersAuthors? : string []
}

export const publicationsApi = {
  findAll: (params?: {
    search?: string; domain?: string; type?: string; year?: number;
    laboratoire?: string; institution?: string; page?: number; limit?: number
  }) => api.get<PaginatedResponse<PublicationData>>("/publications", { params }),

  findById: (id: string) => api.get<PublicationData>(`/publications/${id}`),

  create: (data: {
    title: string; domain: string; year: number; type: string; journal: string;
    description: string; laboratoireId?: string; authorIds: string[]; keywords: string[];
    institutionAcronym?: string; pdfUrl?: string; othersAuthors? : string[]
  }, token: string) => api.post("/publications", data, { token }),

  update: (id: string, data: any, token: string) => api.put(`/publications/${id}`, data, { token }),

  delete: (id: string, token: string) => api.delete(`/publications/${id}`, { token })
}