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
  id: string            // PK — slug (ex: "lsml", "biosan")
  acronym: string       // ex: "LSML", "BioSan"
  name: string          // nom complet
  description: string   // texte affiché dans la card
  categorie: LabCategorie
  researchers: number   // nb de chercheurs du labo
  institution: string   // nom affiché (ex: "Université des Comores")
  institutionId: string // FK → table institutions
}

// ── Version allégée pour les listings (pas de champs lourds) ─────────
export type LaboratoireCard = Pick<
  LaboratoireDetail,
  'id' | 'acronym' | 'name' | 'description' | 'categorie' | 'researchers' | 'institution'
>