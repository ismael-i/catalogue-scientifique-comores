// components/laboratoires/LaboCard.tsx
import Link from 'next/link'
import { FlaskConical, Users, ChevronRight } from 'lucide-react'
import type { LaboratoireCard, LabCategorie } from '../../types'

const BADGE_COLORS: Record<LabCategorie, string> = {
  Sciences:      'bg-blue-50 text-blue-600',
  Environnement: 'bg-emerald-50 text-emerald-600',
  Santé:         'bg-rose-50 text-rose-600',
  Économie:      'bg-amber-50 text-amber-600',
  Lettres:       'bg-violet-50 text-violet-600',
}

interface LaboCardProps {
  labo: LaboratoireCard
}

export function LaboCard({ labo }: LaboCardProps) {
  const { id, acronym, name, description, categorie, researchers, institution  ,logo} = labo

  return (
    <Link href={`/laboratoires/${id}`}>
      <div className="group bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-500">
              {logo ? (
                                  <img src={logo} alt={acronym} className="w-10 h-10 object-contain" />
                                ) : (
                                   <FlaskConical className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                                )}
            <span className="text-xs font-bold tracking-wide uppercase">{acronym}</span>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${BADGE_COLORS[categorie]}`}>
            {categorie}
          </span>
        </div>

        {/* Nom */}
        <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
              {researchers} chercheurs
            </span>
            <span>•</span>
            <span className="truncate max-w-[140px]">{institution}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}
