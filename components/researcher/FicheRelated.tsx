// components/chercheurs/FicheRelated.tsx
// Section "Chercheurs de la même institution" en bas de la fiche

import Link from 'next/link'
import { Users } from 'lucide-react'
import { ChercheurCard } from '@/lib/api/chercheurs'
import { getFileUrl } from '@/lib/utils/fileUrl'


interface MiniCardProps {
  chercheur: ChercheurCard
}

function MiniCard({ chercheur }: MiniCardProps) {
  return (
    <Link href={`/chercheurs/${chercheur.id}`}>
      <div className="group bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
          {chercheur.photoUrl ? (
            <img
              src={getFileUrl(chercheur.photoUrl)}
              alt={chercheur.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
            {chercheur.name}
          </p>
          <p className="text-xs text-slate-400 truncate">{chercheur.specialty}</p>
        </div>
      </div>
    </Link>
  )
}

// ── Section ──────────────────────────────────────────────────────────
interface FicheRelatedProps {
  chercheurs: ChercheurCard[]
}

export function FicheRelated({ chercheurs }: FicheRelatedProps) {
  if (chercheurs.length === 0) return null

  return (
    <section className="mt-14">
      <h2 className="text-lg font-bold text-slate-800 mb-5">
        Chercheurs de la même institution
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chercheurs.map((c) => (
          <MiniCard key={c.id} chercheur={c} />
        ))}
      </div>
    </section>
  )
}
