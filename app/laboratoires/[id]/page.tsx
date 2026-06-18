'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  BookOpen,
  FileText,
  FlaskConical,
  Mail,
  Phone,
  Users,
} from 'lucide-react'
import type { Chercheur, Publication } from '@/types'
import { MOCK_LABORATOIRES, MOCK_CHERCHEURS } from '@/lib/data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LaboratoireDetail, laboratoiresApi } from '@/lib/api/laboratoires'
import { useLoading } from '@/components/LoadingProvider'
import { ApiError } from '@/lib/api/client'
import { getFileUrl } from '@/lib/utils/fileUrl'
import { ChercheurCard } from '@/lib/api/chercheurs'

const categorieBadgeClass: Record<string, string> = {
  Environnement: 'bg-sky-100 text-sky-700',
  Sciences: 'bg-cyan-100 text-cyan-700',
  Santé: 'bg-rose-100 text-rose-700',
  Économie: 'bg-amber-100 text-amber-800',
  Lettres: 'bg-violet-100 text-violet-700',
}

const LaboratoireDetailPage = () => {

  const [laboratoire, setLaboratoire] = useState<LaboratoireDetail | null>(null)
  const { show, hide } = useLoading()
  const [error, setError] = useState<string | null>(null)
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === 'string' ? params.id : ''

    // ─── Charger le laboratoire ────────────────────────────
  const fetchLaboratoire = useCallback(async () => {
    show({ label: 'Chargement du laboratoire…' })
    setError(null)

    try {
      const data = await laboratoiresApi.findById(id)
      setLaboratoire(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Laboratoire non trouvé")
    } finally {
      hide()
    }
  }, [ id])

  useEffect(() => {
    if ( id) fetchLaboratoire()
  }, [ id, fetchLaboratoire])
  const lab = id
    ? MOCK_LABORATOIRES.find((l) => l.id.toLowerCase() === id.toLowerCase())
    : undefined

  if (error || !laboratoire) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6 py-20">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Laboratoire introuvable
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Le laboratoire que vous cherchez n&apos;existe pas ou a été déplacé.
            </p>
            <Link
              href="/laboratoires"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              Retour aux laboratoires
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // const affilies = MOCK_CHERCHEURS.filter(
  //   (c) => c.laboratoireId?.toLowerCase() === lab.id.toLowerCase(),
  // )
  // const publications = lab.publications ?? []
  // const partenariats = lab.partenariats ?? []
  const thematiquesText = (laboratoire.thematiques ?? []).join(', ')
  const badgeClass = categorieBadgeClass[laboratoire.categorie] ?? 'bg-slate-100 text-slate-700'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Accueil
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <Link href="/laboratoires" className="hover:text-blue-500 transition-colors">
            Laboratoires
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-700">{laboratoire.acronym}</span>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gray-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 pt-10 pb-10">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                 {laboratoire.logo ? (
                                  <img src={getFileUrl(laboratoire.logo)} alt={laboratoire.acronym} className="w-30 h-30 object-contain" />
                                ) : (
                                   <FlaskConical className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                                )}
              </div>
              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="text-xl font-bold text-blue-500 tracking-wide">
                    {laboratoire.acronym}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${badgeClass}`}
                  >
                    {laboratoire.categorie}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Actif</p>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4 max-w-4xl">
              {laboratoire.name}
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
              {laboratoire.description}
            </p>
          </div>
        </section>

        {/* Two-column content */}
        <section>
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {thematiquesText && (
                <SectionCard
                  icon={<BookOpen className="w-5 h-5 text-blue-500" />}
                  title="Thématiques"
                >
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {thematiquesText}
                  </p>
                </SectionCard>
              )}

              <SectionCard
                icon={<Users className="w-5 h-5 text-blue-500" />}
                title={`Chercheurs affiliés (${laboratoire._count?.chercheurs })`}
              >
                {laboratoire._count?.chercheurs === 0 ? (
                  <p className="text-sm text-slate-500">Aucun chercheur affilié.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {laboratoire.chercheurs?.map((c) => (
                      <li key={c.id}>
                        <ChercheurRow chercheur={c} />
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard
                icon={<FileText className="w-5 h-5 text-blue-500" />}
                title={`Publications (${laboratoire._count?.publications })`}
              >
                {laboratoire.publications?.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Aucune publication référencée.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {laboratoire.publications?.map((p) => (
                      <li key={p.id}>
                        <PublicationRow publication={p} />
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>

            {/* Right sidebar */}
            <aside className="flex flex-col gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Informations
                </h3>
                <InfoRow label="Institution" value={laboratoire.institution?.name} />
                <InfoRow
                  label="Domaine"
                  value={
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${badgeClass}`}
                    >
                      {laboratoire.categorie}
                    </span>
                  }
                />
                <InfoRow label="Statut" value="Actif" />
                <InfoRow label="Chercheurs" value={String(laboratoire.chercheurs?.length)} />
                {laboratoire.responsable && (
                  <InfoRow label="Responsable" value={laboratoire.responsable.name} />
                )}
              </div>

              {laboratoire.partenariats?.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-slate-900 mb-3">
                    Partenariats
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {laboratoire.partenariats?.join(', ')}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────

interface SectionCardProps {
  icon: ReactNode
  title: string
  children: ReactNode
}

const SectionCard = ({ icon, title, children }: SectionCardProps) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    </div>
    {children}
  </div>
)

interface ChercheurRowProps {
  chercheur: ChercheurCard & { email?: string; phone?: string }
}

const ChercheurRow = ({ chercheur }: ChercheurRowProps) => (
  <Link href={`/chercheurs/${chercheur.id}`} className="block">
  <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {chercheur.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getFileUrl(chercheur.photoUrl)}
          alt={chercheur.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <Users className="w-4 h-4 text-slate-400" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-slate-900 mb-0.5">{chercheur.name}</p>
      <p className="text-xs text-slate-500 mb-1.5">{chercheur.specialty}</p>
      {(chercheur.email || chercheur.phone) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {chercheur.email && (
            <p
              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {chercheur.email}
            </p>
          )}
          {chercheur.phone && (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Phone className="w-3.5 h-3.5" />
              {chercheur.phone}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
  </Link>
)

interface PublicationRowProps {
  publication: Publication
}

const PublicationRow = ({ publication }: PublicationRowProps) => (
  <Link
    href={`/publications/${publication.id}`}
    className="group block bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors"
  >
    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">
      {publication.title}
    </p>
    <p className="text-xs text-slate-500">
      {publication.authors.join(', ')}
      <span className="mx-1.5 text-slate-300">•</span>
      {publication.year}
    </p>
  </Link>
)

interface InfoRowProps {
  label: string
  value: ReactNode
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="mb-3 last:mb-0">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <div className="text-base font-semibold text-slate-900">{value}</div>
  </div>
)

export default LaboratoireDetailPage
