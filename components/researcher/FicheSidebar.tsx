// components/chercheurs/FicheSidebar.tsx
// Colonne droite de la fiche : informations institutionnelles + bloc téléchargement PDF

import { Download } from 'lucide-react'
import type { Chercheur } from '../../types'
import { ChercheurDetail } from '@/lib/api/chercheurs'
import { getFileUrl } from '@/lib/utils/fileUrl'

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
  chercheur: ChercheurDetail
}

export function FicheSidebar({ chercheur }: FicheSidebarProps) {
  const { institution, faculty, laboratoires, email, phone, note, fiche } = chercheur
  const institutionLabel = institution
    ? `${institution.acronym}${faculty ? ` / ${faculty}` : ''}`
    : 'Chercheur externe'

  return (
    <div className="flex flex-col gap-4">

      {/* Bloc informations */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-800">Informations</h2>

        <InfoRow label="Institution" value={institutionLabel} />

        {laboratoires && laboratoires.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">
              {laboratoires.length > 1 ? 'Laboratoires' : 'Laboratoire'}
            </span>
            <div className="flex flex-col gap-1">
              {laboratoires.map((labo) => (
                <span key={labo.id} className="text-sm font-medium text-slate-800">
                  {labo.acronym} - {labo.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {email && <InfoRow label="Email" value={email} isEmail />}
        {phone && <InfoRow label="Téléphone" value={phone} />}
        {note && <InfoRow label="Note" value={note} />}
      </div>

      {/* Bloc téléchargement */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Téléchargement</h2>
        <p className="text-xs text-slate-500 mb-4">Fiche complète au format PDF.</p>
        
        <a
          href={getFileUrl(fiche)}
          download
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Télécharger PDF
        </a>
      </div>
    </div>
  )
}
