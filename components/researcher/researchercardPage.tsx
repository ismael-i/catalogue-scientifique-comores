import { Users, Building2 } from 'lucide-react'
import type { Chercheur, ViewMode } from '@/types'
import Link from 'next/link';

interface ChercheurCardProps {
  chercheur: Chercheur
  mode: ViewMode
}

function Avatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-full h-full object-cover rounded-full"
      />
    )
  }
  return (
    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
      <Users className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
    </div>
  )
}

// ── Mode grille ──────────────────────────────────────────────────────
function GridCard({ chercheur }: { chercheur: Chercheur }) {
  const { name, institution, faculty, specialty, photoUrl } = chercheur

  return (
     <Link href={`chercheurs/${chercheur.id}`} className="block">
    <div className="group bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      {/* Avatar */}
      <div className="w-12 h-12 flex-shrink-0">
        <Avatar photoUrl={photoUrl} name={name} />
      </div>

      {/* Nom */}
      <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
        {name}
      </h3>

      {/* Institution */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
        <span>{institution}{faculty ? ` / ${faculty}` : ''}</span>
      </div>

      {/* Spécialité */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
        {specialty}
      </p>
    </div>
    </Link>
  )
}

// ── Mode liste ───────────────────────────────────────────────────────
function ListCard({ chercheur }: { chercheur: Chercheur }) {
  const { name, institution, faculty, photoUrl } = chercheur

  return (
     <Link href={`chercheurs/${chercheur.id}`} className="block">
    <div className="group bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-sm hover:border-blue-200 transition-all duration-200 cursor-pointer">
      {/* Avatar */}
      <div className="w-10 h-10 flex-shrink-0">
        <Avatar photoUrl={photoUrl} name={name} />
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
          {name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
          <span>{institution}{faculty ? ` / ${faculty}` : ''}</span>
        </div>
      </div>
    </div>
    </Link>
  )
}

// ── Export unifié ────────────────────────────────────────────────────
export function ChercheurCard({ chercheur, mode }: ChercheurCardProps) {
  if (mode === 'list') return <ListCard chercheur={chercheur} />
  return <GridCard chercheur={chercheur} />
}