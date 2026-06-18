const API_URL = process.env.NEXT_PUBLIC_API_URL_IMAGE || "http://localhost:3150"

/**
 * Convertit un chemin relatif (stocké en DB) en URL complète
 * 
 * @param relativePath - Chemin stocké en DB (ex: "uploads/chercheurs/uuid.jpg")
 * @returns URL complète (ex: "http://localhost:4000/uploads/chercheurs/uuid.jpg")
 */
export function getFileUrl(relativePath: string | null | undefined): string {
  if (!relativePath) return ""
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath
  }
  
  // Sinon, construire l'URL complète
  return `${API_URL}/${relativePath}`
}

/**
 * Placeholder pour les chercheurs sans photo
 */
export function getChercheurPlaceholder(name: string): string {
  // Retourne une URL de placeholder ou génère des initiales
  return ""
}

/**
 * Icône PDF pour les fiches
 */
export function getPDFIcon(): string {
  return "📄"
}