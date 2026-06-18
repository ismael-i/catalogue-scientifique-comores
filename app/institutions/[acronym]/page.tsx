'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FlaskConical, Users, FileText, User } from 'lucide-react'
import type { Chercheur, Laboratoire, Publication } from '@/types'
import {
  getInstitutionByAcronym,
  getLabosByInstitution,
} from '@/lib/data'
import { getChercheursByInstitution } from '@/lib/chercheurs'
import {
  domainBadgeClass,
  getPublicationsByInstitution,
} from '@/lib/publications'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { InstIcon } from '@/components/icons'
import { Pagination } from '@/components/Pagination'
import { useLoading } from '@/components/LoadingProvider'
import { InstitutionDetail, institutionsApi } from '@/lib/api/institutions'
import { ApiError } from '@/lib/api/client'
import { PublicationData, publicationsApi } from '@/lib/api/publications'
import { getFileUrl } from '@/lib/utils/fileUrl'

const LABS_PER_PAGE = 6
const CHERCHEURS_PER_PAGE = 8
const PUBLICATIONS_PER_PAGE = 5

const InstitutionDetailPage = () => {
  const { setIsLoading } = useLoading()
  const params = useParams<{ acronym: string }>()
  const acronym = typeof params?.acronym === 'string' ? params.acronym : ''
  // const institution = acronym ? getInstitutionByAcronym(acronym) : undefined

  const [institution, setInstitution] = useState<InstitutionDetail | null>(null)
  const [publications, setPublications] = useState<PublicationData[]>([])
  const [labsPage, setLabsPage] = useState(1)
  const [chercheursPage, setChercheursPage] = useState(1)
  const [publicationsPage, setPublicationsPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [publicationsTotal, setPublicationsTotal] = useState(0)

 // Effect 1 : charge l'institution une seule fois (quand acronym change)
useEffect(() => {
  if (!acronym) return
  let isMounted = true
  setIsLoading(true)
  setError(null)

  institutionsApi.findByAcronym(acronym)
    .then(data => {
      if (isMounted) setInstitution(data)
    })
    .catch(err => {
      if (isMounted) setError(err instanceof ApiError ? err.message : "Institution introuvable")
    })
    .finally(() => {
      if (isMounted) setIsLoading(false)
    })

  return () => { isMounted = false }
}, [acronym])

// Effect 2 : charge les publications, dépend de acronym ET publicationsPage
useEffect(() => {
  if (!acronym) return
  let isMounted = true

  publicationsApi.findAll({ institution: acronym, page: publicationsPage, limit: PUBLICATIONS_PER_PAGE })
    .then(res => {
      if (!isMounted) return
      setPublications(res.data)
      setPublicationsTotal(res.pagination.total)
    })
    .catch(() => {
      if (isMounted) setPublications([])
    })

  return () => { isMounted = false }
}, [acronym, publicationsPage])

  const labos = useMemo(
  () => institution?.laboratoires ?? [],
  [institution],
)
const chercheurs = useMemo(
  () => institution?.chercheurs ?? [],
  [institution],
)


  const labsTotalPages = Math.max(1, Math.ceil(labos.length / LABS_PER_PAGE))
  const chercheursTotalPages = Math.max(
    1,
    Math.ceil(chercheurs.length / CHERCHEURS_PER_PAGE),
  )
  const publicationsTotalPages = Math.max(1, Math.ceil(publicationsTotal / PUBLICATIONS_PER_PAGE))
// publicationsSlice n'est plus nécessaire, utilise directement "publications"

  const labosSlice = labos.slice(
    (labsPage - 1) * LABS_PER_PAGE,
    labsPage * LABS_PER_PAGE,
  )
  const chercheursSlice = chercheurs.slice(
    (chercheursPage - 1) * CHERCHEURS_PER_PAGE,
    chercheursPage * CHERCHEURS_PER_PAGE,
  )
  const publicationsSlice = publications.slice(
    (publicationsPage - 1) * PUBLICATIONS_PER_PAGE,
    publicationsPage * PUBLICATIONS_PER_PAGE,
  )

  if (!institution) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6 py-20">
            <InstIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Institution introuvable
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              L&apos;institution que vous cherchez n&apos;existe pas ou a été déplacée.
            </p>
            <Link
              href="/institutions"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              Retour aux institutions
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

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
          <Link href="/institutions" className="hover:text-blue-500 transition-colors">
            Institutions
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-700">{institution.acronym}</span>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gray-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 pt-10 pb-10">
            <div className="flex items-center gap-4 mb-5">
              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
                  institution.logoBg ?? 'bg-slate-100'
                }`}
              >
                {institution.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={institution.logo}
                    alt={`Logo ${institution.acronym}`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <InstIcon className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <span className="text-xl font-bold text-blue-500 tracking-wide">
                {institution.acronym}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4 max-w-4xl">
              {institution.name}
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
              {institution.description}
            </p>
          </div>
        </section>

        {/* Two-column content */}
        <section>
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <SectionCard
                icon={<FlaskConical className="w-5 h-5 text-blue-500" />}
                title={`Laboratoires (${labos.length})`}
              >
                {labos.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun laboratoire référencé.</p>
                ) : (
                  <>
                    <ul className="flex flex-col gap-3">
                      {labosSlice.map((l) => (
                        <li key={l.acronym}>
                          <LabRow lab={l} />
                        </li>
                      ))}
                    </ul>
                    {labsTotalPages > 1 && (
                      <Pagination
                        currentPage={labsPage}
                        totalPages={labsTotalPages}
                        onPageChange={setLabsPage}
                      />
                    )}
                  </>
                )}
              </SectionCard>

              <SectionCard
                icon={<Users className="w-5 h-5 text-blue-500" />}
                title={`Chercheurs (${chercheurs.length})`}
              >
                {chercheurs.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun chercheur référencé.</p>
                ) : (
                  <>
                    <ul className="flex flex-col gap-3">
                      {chercheursSlice.map((c) => (
                        <li key={c.id}>
                          <ChercheurRow chercheur={c} />
                        </li>
                      ))}
                    </ul>
                    {chercheursTotalPages > 1 && (
                      <Pagination
                        currentPage={chercheursPage}
                        totalPages={chercheursTotalPages}
                        onPageChange={setChercheursPage}
                      />
                    )}
                  </>
                )}
              </SectionCard>

              {publications.length > 0 && (
                <SectionCard
                  icon={<FileText className="w-5 h-5 text-blue-500" />}
                  title={`Publications (${publications.length})`}
                >
                  <ul className="flex flex-col">
                    {publicationsSlice.map((p, idx) => (
                      <li
                        key={p.id}
                        className={
                          idx > 0 ? 'border-t border-slate-100 pt-3 mt-3' : ''
                        }
                      >
                        <PublicationRow publication={p} />
                      </li>
                    ))}
                  </ul>
                  {publicationsTotalPages > 1 && (
                    <Pagination
                      currentPage={publicationsPage}
                      totalPages={publicationsTotalPages}
                      onPageChange={setPublicationsPage}
                    />
                  )}
                </SectionCard>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="flex flex-col gap-5">
              <div className="bg-white border border-slate-200 rounded-lg p-5 lg:sticky lg:top-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Informations
                </h3>
                <InfoRow label="Acronyme" value={institution.acronym} />
                <InfoRow label="Chercheurs" value={String(chercheurs.length)} />
                <InfoRow label="Laboratoires" value={String(labos.length)} />
              </div>
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

interface LabRowProps {
  lab: Laboratoire
}

const LabRow = ({ lab }: LabRowProps) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
      {lab.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getFileUrl(lab.logo)}
          alt={lab.acronym}
        />
      ) : (
        <FlaskConical className="w-4 h-4 text-blue-500" />
      )}
    </div>
    <div className="min-w-0 pt-0.5">
      <p className="text-sm text-slate-900 mb-1">
        <span className="font-semibold">{lab.acronym}</span>
        <span className="text-slate-500"> — {lab.name}</span>
      </p>
      {lab.domain && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${domainBadgeClass[lab.domain]}`}
        >
          {lab.domain}
        </span>
      )}
    </div>
  </div>
)

interface ChercheurRowProps {
  chercheur: Chercheur
}

const ChercheurRow = ({ chercheur }: ChercheurRowProps) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {chercheur.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getFileUrl(chercheur.photoUrl)}
          alt={chercheur.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className="w-4 h-4 text-slate-400" />
      )}
    </div>
    <div className="min-w-0 pt-0.5">
      <p className="text-sm font-medium text-slate-900 mb-0.5">{chercheur.name}</p>
      <p className="text-xs text-slate-500 truncate">{chercheur.specialty}</p>
    </div>
  </div>
)

interface PublicationRowProps {
  publication: PublicationData
}

const PublicationRow = ({ publication }: PublicationRowProps) => (
  <Link href={`/publications/${publication.id}`} className="group block">
    <p className="text-sm font-medium text-slate-900 group-hover:text-blue-500 transition-colors leading-snug mb-1">
      {publication.title}
    </p>
    <p className="text-xs text-slate-500">
      {publication.authors.join(', ')} ({publication.year})
    </p>
  </Link>
)

interface InfoRowProps {
  label: string
  value: string
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="mb-3 last:mb-0">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="text-base font-semibold text-slate-900">{value}</p>
  </div>
)

export default InstitutionDetailPage
