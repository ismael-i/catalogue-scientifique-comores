// ── Types de données ────────────────────────────────────────────────

export interface Laboratoire {
  acronym: string;
  name: string;
  description: string;
  researchers: number;
  institution: string;
}

export interface Institution {
  acronym: string;
  name: string;
  description: string;
  logo?: string; // URL optionnelle du logo
}

export interface SectionProps {
  title: string;
  subtitle: string;
  viewAllLabel?: string;
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
}

export interface LabCardProps extends Laboratoire {}

export interface InstitutionCardProps extends Institution {}

export interface Chercheur {
  id: string          // identifiant unique (ex: slug ou uuid)
  name: string        // nom complet (ex: "Dr Nadjim Ahmed Mohamed")
  institution: string // acronyme institution (ex: "UDC", "BGC", "INRAPE")
  faculty?: string    // faculté optionnelle (ex: "FST")
  specialty: string   // domaine de recherche
  photoUrl?: string   // URL photo de profil, optionnelle (fallback icône)
}

export type ViewMode = 'grid' | 'list'  // toggle grille / liste

// ── Publications ────────────────────────────────────────────────────

export type PublicationDomain =
  | 'Environnement'
  | 'Sciences'
  | 'Santé'
  | 'Économie'
  | 'Lettres'

export type PublicationType =
  | 'Article Scientifique'
  | 'Communication De Conférence'

export interface PublicationAuthor {
  name: string
  institution?: string
  faculty?: string
}

export interface Publication {
  id: string
  title: string
  domain: PublicationDomain
  year: number
  type: PublicationType
  authors: string[]
  journal: string
  description: string
  keywords: string[]
  laboratoire?: string
  detailedAuthors?: PublicationAuthor[]
  pdfUrl?: string
}