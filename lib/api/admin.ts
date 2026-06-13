import { api } from "./client"

export const adminApi = {
  getStats: (token: string) =>
    api.get<any>("/admin/stats", { token }),

  getUsers: (token: string) =>
    api.get<any[]>("/admin/users", { token }),
}