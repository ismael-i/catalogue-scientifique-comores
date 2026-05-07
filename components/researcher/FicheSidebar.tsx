// components/chercheurs/FicheSidebar.tsx
// Colonne droite de la fiche : informations institutionnelles + bloc téléchargement PDF

import { Download } from 'lucide-react'
import type { Chercheur } from '../../types'

// ── Ligne d'info ─────────────────────────────────────────────────────
interface InfoRowProps {
  label: string
  value: string
  isEmail?: boolean
}

function InfoRow({ label, value, isEmail }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-slate-400 uppercase tracking-wide">{label}</span>
      {isEmail ? (
        <a
          href={`mailto:${value}`}
          className="text-sm font-medium text-blue-500 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      )}
    </div>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────
interface FicheSidebarProps {
  chercheur: Chercheur
}

export function FicheSidebar({ chercheur }: FicheSidebarProps) {
  const { institution, faculty, laboratoire, effectif, email, phone, note } = chercheur
  const institutionLabel = `${institution}${faculty ? ` / ${faculty}` : ''}`

  return (
    <div className="flex flex-col gap-4">

      {/* Bloc informations */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-800">Informations</h2>

        <InfoRow label="Institution" value={institutionLabel} />

        {laboratoire && (
          <InfoRow label="Laboratoire" value={laboratoire} />
        )}

        {effectif !== undefined && (
          <InfoRow label="Effectif" value={String(effectif)} />
        )}

        {email && (
          <InfoRow label="Email" value={email} isEmail />
        )}

        {phone && (
          <InfoRow label="Téléphone" value={phone} />
        )}

        {note && (
          <InfoRow label="Note" value={note} />
        )}
      </div>

      {/* Bloc téléchargement */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Téléchargement</h2>
        <p className="text-xs text-slate-500 mb-4">Fiche complète au format PDF.</p>
        <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Télécharger PDF
        </button>
      </div>
    </div>
  )
}
