// types/chercheur.ts

// Type complet — miroir du modèle Prisma
export interface Chercheur {
  id: string
  name: string
  photoUrl: string | null
  institutionId: string
  institutionName: string
  faculty: string | null
  laboratoireId: string | null
  laboratoireName: string | null
  effectif: number | null
  specialty: string
  publications: string | null
  partenariats: string | null
  email: string | null
  phone: string | null
  note: string | null
  fiche: string | null
  createdAt: Date
  updatedAt: Date
}

// Type allégé pour les cartes et listings
export type ChercheurCard = Pick<Chercheur,
  | "id"
  | "name"
  | "photoUrl"
  | "institutionName"
  | "faculty"
  | "laboratoireName"
  | "specialty"
>