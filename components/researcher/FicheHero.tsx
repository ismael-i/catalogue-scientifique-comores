// components/chercheurs/FicheHero.tsx
// En-tête de la fiche : avatar, nom, institution, boutons Fiche PDF / Contacter

import { Download, Mail, Building2, Users } from 'lucide-react'
import type { Chercheur } from '../../types'

interface FicheHeroProps {
  chercheur: Chercheur
}

function HeroAvatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
  return (
    <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Users className="w-10 h-10 text-slate-400" strokeWidth={1.2} />
      )}
    </div>
  )
}

export function FicheHero({ chercheur }: FicheHeroProps) {
  const { name, photoUrl, institution, faculty, email, fiche } = chercheur
  const institutionLabel = `${institution}${faculty ? ` / ${faculty}` : ''}`

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">

      {/* Gauche : avatar + identité */}
      <div className="flex items-start gap-5">
        <HeroAvatar photoUrl={photoUrl} name={name} />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {name}
          </h1>
          <p className="text-sm text-slate-500">{institutionLabel}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span>{institutionLabel}</span>
          </div>
        </div>
      </div>

      {/* Droite : actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <a 
        href={`/${fiche}`}
        download
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Fiche PDF
        </a>
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contacter
          </a>
        )}
      </div>
    </div>
  )
}
