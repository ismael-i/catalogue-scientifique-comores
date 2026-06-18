import { api } from "./client"

export const uploadApi = {
  /**
   * Upload d'une photo (image)
   */
  uploadPhoto: (
    file: File,
    type: "chercheurs" | "laboratoires" | "institutions" | 'articles',
    id: string,
    token: string
  ) => {
    const formData = new FormData()
    formData.append("type", type)
    formData.append("id", id)
    formData.append("file", file)

    return api.upload<{ url: string; path: string }>("/upload/photo", formData, { token })
  },

  /**
   * Upload d'un PDF (fiche chercheur)
   */
  uploadPDF: (
    file: File,
    chercheurId: string,
    token: string
  ) => {
    const formData = new FormData()
    formData.append("type", "fiches")     // ← D'ABORD le type
    formData.append("chercheurId", chercheurId)
    formData.append("file", file)

    return api.upload<{ url: string; path: string }>("/upload/pdf", formData, { token })
  },

  /**
   * Supprimer une photo
   */
  deletePhoto: (
    type: "chercheurs" | "laboratoires" | "institutions" | "articles",
    id: string,
    token: string
  ) => {
    return api.delete("/upload/photo", {
      token,
      body: JSON.stringify({ type, id })
    } as any)
  },

  /**
   * Supprimer un PDF
   */
  deletePDF: (
    chercheurId: string,
    token: string
  ) => {
    return api.delete("/upload/pdf", {
      token,
      body: JSON.stringify({ chercheurId })
    } as any)
  },
  uploadPublicationPDF: (file: File, publicationId: string, token: string) => {
  const formData = new FormData()
  formData.append("type", "publications")
  formData.append("file", file)
  formData.append("publicationId", publicationId)
  return api.upload<{ url: string; path: string }>("/upload/publication-pdf", formData, { token })
},

deletePublicationPDF: (publicationId: string, token: string) =>
  api.delete("/upload/publication-pdf", {
    token,
    body: JSON.stringify({ publicationId })
  } as any)
  
}