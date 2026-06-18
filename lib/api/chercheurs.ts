import { api } from "./client"

export interface ChercheurCard {
  id: string
  name: string
  photoUrl?: string
  specialty: string
  faculty?: string
  institutionName?: string
  institution?: { acronym: string; name: string }
  laboratoireName?: string
  laboratoire?: { acronym: string; name: string }
}

export interface ChercheurDetail extends ChercheurCard {
  email?: string
  phone?: string
  publications?: string
  partenariats?: string
  note?: string
  effectif?: number
  fiche?: string
  institution: {
    id: string
    acronym: string
    name: string
    logo?: string
    logoBg?: string
  }
  laboratoire?: {
    id: string
    acronym: string
    name: string
    publications?: any[]
    logo?: string
  }
  publicationAuthors?: PublicationAuthor[]
}
interface Publication {
  id: string
  title: string
  domain: string
  year: number
  type: string
  journal?: string | null
  description?: string | null
  pdfUrl?: string | null
  laboratoireId: string
  institutionAcronym: string
  createdAt: string
  updatedAt: string
  keywords?: { id: string; keyword: string; publicationId: string }[]
  authors?: { id: string; publicationId: string; chercheurId: string; order: number }[]
}

interface PublicationAuthor {
  id: string
  publicationId: string
  chercheurId: string
  order: number
  publication: Publication
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const chercheursApi = {
  findAll: (params?: {
    search?: string
    institution?: string
    laboratoire?: string
    page?: number
    limit?: number
    excludeId?: string
  }) =>
    api.get<PaginatedResponse<ChercheurCard>>("/chercheurs", { params }),

  findById: (id: string) =>
    api.get<ChercheurDetail>(`/chercheurs/${id}`),

  create: (data: any, token: string) =>
    api.post<ChercheurDetail>("/chercheurs", data, { token }),

  update: (id: string, data: any, token: string) =>
    api.put<ChercheurDetail>(`/chercheurs/${id}`, data, { token }),

  delete: (id: string, token: string) =>
    api.delete(`/chercheurs/${id}`, { token }),
}