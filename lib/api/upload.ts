import { api } from "./client"

export const uploadApi = {
  uploadImage: (file: File, type: "chercheurs" | "laboratoires" | "institutions", id: string, token: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)
    formData.append("id", id)
    
    return api.upload<{ url: string }>("/upload", formData, { token })
  },
}