// components/chercheurs/ChercheurCard.tsx

import { ChercheurCard as ChercheurCardType } from "@/types/chercheur" // adapte le chemin

interface ChercheurCardProps {
  chercheur: ChercheurCardType
  viewMode: "grid" | "list"
}

export function ChercheurCard({ chercheur, viewMode }: ChercheurCardProps) {
  if (viewMode === "list") {
    return (
      <a href={`/chercheurs/${chercheur.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {chercheur.photoUrl ? (
              <img src={chercheur.photoUrl} alt={chercheur.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-lg">
                {chercheur.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{chercheur.name}</h3>
            <p className="text-sm text-gray-600">{chercheur.specialty}</p>
            <p className="text-xs text-gray-400">
              {chercheur.institutionName}
              {chercheur.laboratoireName ? ` — ${chercheur.laboratoireName}` : ""}
            </p>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a href={`/chercheurs/${chercheur.id}`} className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          {chercheur.photoUrl ? (
            <img src={chercheur.photoUrl} alt={chercheur.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <span className="text-blue-600 font-bold text-2xl">
              {chercheur.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{chercheur.name}</h3>
          <p className="text-sm text-gray-500">{chercheur.institutionName}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{chercheur.specialty}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        {chercheur.laboratoireName && <span>🏛️ {chercheur.laboratoireName}</span>}
        {chercheur.faculty && <span>📚 {chercheur.faculty}</span>}
      </div>
    </a>
  )
}