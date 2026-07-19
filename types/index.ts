// ── Types de données ────────────────────────────────────────────────

export type LabDomain =
  | 'Environnement'
  | 'Sciences'
  | 'Santé'
  | 'Économie'
  | 'Lettres'

export interface Laboratoire {
  acronym: string;
  name: string;
  description: string;
  researchers: number;
  institution: string;          // institution display name
  institutionAcronym?: string;  // institution acronym (used for filtering)
  domain?: LabDomain;           // domain badge displayed on institution detail
  logo?: string;               // URL optionnelle du logo
}

export interface Institution {
  acronym: string;
  name: string;
  description?: string;
  logo?: string; // URL optionnelle du logo
  logoBg?: string; // couleur de fond optionnelle pour le placeholder logo (classe Tailwind)
}

export interface SectionProps {
  title: string;
  subtitle: string;
  viewAllLabel?: string;
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
  link?: string; // URL de la page "Voir tous"
}

export interface LabCardProps extends Laboratoire {}

export interface InstitutionCardProps extends Institution {}

export interface Chercheur {
  // ── Identité ──────────────────────────────────────────────────────
  id: string               // PK  — uuid ou slug
  name: string             // NOT NULL
  photoUrl?: string        // nullable — URL photo
 
  // ── Rattachement institutionnel ───────────────────────────────────
  // FK → table `institutions`
  institutionId: string    // NOT NULL
  institution: string      // dénormalisé (ex: "UDC")
  faculty?: string         // nullable (ex: "FST")
 
  // ── Laboratoire ───────────────────────────────────────────────────
  // FK → table `laboratoires`
  laboratoireId?: string   // nullable
  laboratoire?: string     // nom complet dénormalisé
  effectif?: number        // nb de chercheurs dans le labo
 
  // ── Recherche ─────────────────────────────────────────────────────
  specialty: string        // NOT NULL — thématiques de recherche
 
  // ── Publications ──────────────────────────────────────────────────
  publications?: string    // nullable — texte libre ou JSON
 
  // ── Partenariats ──────────────────────────────────────────────────
  partenariats?: string    // nullable — texte libre
 
  // ── Contact ───────────────────────────────────────────────────────
  email?: string           // nullable
  phone?: string           // nullable
 
  // ── Notes internes ────────────────────────────────────────────────
  note?: string            // nullable
  fiche? : string
}
 
// Sous-ensemble léger pour les listings (grille / liste)
export type ChercheurCard = Pick<
  Chercheur,
  'id' | 'name' | 'photoUrl' | 'institution' | 'faculty' | 'specialty'
>
 

export type ViewMode = 'grid' | 'list'  // toggle grille / liste


// ── Catégories possibles (union type) ────────────────────────────────
export type LabCategorie =
  | 'Sciences'       // badge bleu
  | 'Environnement'  // badge vert
  | 'Santé'          // badge rose
  | 'Économie'       // badge ambre
  | 'Lettres'        // badge violet

// ── Modèle complet — table `laboratoires` en DB ──────────────────────
export interface LaboratoireDetail {
  id: string;
  acronym: string;
  name: string;
  description: string;
  categorie: LabCategorie;
  researchers: number;
  institution: string;
  institutionId: string;
  thematiques?: string[];
  responsable?: Chercheur;
  publications?: Publication[];
  partenariats?: string[];
  logo?: string;
  contact?: {
    email?: string;
    telephone?: string;
    site?: string;
  }
}

// Sous-ensemble léger pour les listings (grille / liste de laboratoires)
export type LaboratoireCard = Pick<
  LaboratoireDetail,
  'id' | 'acronym' | 'name' | 'description' | 'researchers' | 'institution' | 'logo'
> & { categorie: LabCategorie }

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
  institutionAcronym?: string  // institution acronym to filter by
  detailedAuthors?: PublicationAuthor[]
  pdfUrl?: string
}
