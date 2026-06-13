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
  authorName: string
  authorPhotoUrl?: string
  laboratoryAcronym?: string
  laboratoryName?: string
  tags: { id: string; tag: string }[]
}

export interface TagCount {
  name: string
  count: number
}

export const articlesApi = {
  findAll: (params?: {
    search?: string
    tag?: string
    author?: string
    page?: number
    limit?: number
  }) =>
    api.get<PaginatedResponse<ArticleData>>("/articles", { params }),

  findById: (id: string) =>
    api.get<ArticleData>(`/articles/${id}`),

  getRecent: (limit?: number) =>
    api.get<ArticleData[]>(`/articles/recent?limit=${limit || 5}`),

  getTags: () =>
    api.get<TagCount[]>("/articles/tags"),

  create: (data: any, token: string) =>
    api.post("/articles", data, { token }),

  update: (id: string, data: any, token: string) =>
    api.put(`/articles/${id}`, data, { token }),

  delete: (id: string, token: string) =>
    api.delete(`/articles/${id}`, { token }),
}