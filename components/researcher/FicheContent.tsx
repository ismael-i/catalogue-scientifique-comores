// components/chercheurs/FicheContent.tsx
// Colonne gauche de la fiche : thématiques, publications, partenariats

import { BookOpen, FileText, Handshake } from 'lucide-react'
import type { Chercheur } from '../../types'

// ── Bloc section générique ───────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3 text-blue-500">
        {icon}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
    </div>
  )
}

// ── Colonne gauche ───────────────────────────────────────────────────
interface FicheContentProps {
  chercheur: Chercheur
}

export function FicheContent({ chercheur }: FicheContentProps) {
  const { specialty, publications, partenariats } = chercheur

  return (
    <div className="flex flex-col gap-4">

      {/* Thématiques de recherche — toujours présent */}
      <SectionCard
        icon={<BookOpen className="w-4 h-4" />}
        title="Thématiques de recherche"
      >
        {specialty}
      </SectionCard>

      {/* Publications — conditionnel */}
      {publications && (
        <SectionCard
          icon={<FileText className="w-4 h-4" />}
          title="Publications"
        >
          {publications}
        </SectionCard>
      )}

      {/* Partenariats — conditionnel */}
      {partenariats && (
        <SectionCard
          icon={<Handshake className="w-4 h-4" />}
          title="Partenariats"
        >
          {partenariats}
        </SectionCard>
      )}
    </div>
  )
}
