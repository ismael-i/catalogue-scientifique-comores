import { api } from "./client"
import type { PaginatedResponse } from "./chercheurs"

export interface ArticleData {
  id: string
  date: string
  title: string
  description: string
  imageUrl?: string
  imageAlt?: string
  body: string[]
  chercheur?: {
    id: string
    name: string
    photoUrl?: string
    specialty?: string
    email?: string
  }
  laboratoire?: {
    id: string
    acronym: string
    name: string
    logo?: string
  }
  tags: { id: string; tag: string }[]
}

export const articlesApi = {
  findAll: (params?: {
    search?: string; tag?: string; chercheurId?: string;
    laboratoireId?: string; page?: number; limit?: number
  }) => api.get<PaginatedResponse<ArticleData>>("/articles", { params }),

  findById: (id: string) => api.get<ArticleData>(`/articles/${id}`),

  create: (data: {
    title: string; description: string; body: string[];
    chercheurId?: string; laboratoireId?: string;
    imageUrl?: string; imageAlt?: string; tags: string[]
  }, token: string) => api.post("/articles", data, { token }),

  update: (id: string, data: any, token: string) => api.put(`/articles/${id}`, data, { token }),

  delete: (id: string, token: string) => api.delete(`/articles/${id}`, { token })
}