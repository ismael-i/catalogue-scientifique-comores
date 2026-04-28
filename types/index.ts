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
