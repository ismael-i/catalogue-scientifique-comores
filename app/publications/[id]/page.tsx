'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Calendar, Download, FileText, User, Users } from 'lucide-react'
import type { Publication, PublicationAuthor } from '@/types'
import {
  domainBadgeClass,
  getPublicationById,
  getSimilarPublications,
} from '@/lib/publications'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const PublicationDetailPage = () => {
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === 'string' ? params.id : ''
  const publication = id ? getPublicationById(id) : undefined

  if (!publication) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6 py-20">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Publication introuvable
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              La publication que vous cherchez n’existe pas ou a été déplacée.
            </p>
            <Link
              href="/publications"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              Retour aux publications
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const similar = getSimilarPublications(publication)
  const truncatedTitle =
    publication.title.length > 32
      ? `${publication.title.slice(0, 32)}...`
      : publication.title

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
          <Link href="/publications" className="hover:text-blue-500 transition-colors">
            Publications
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-700">{truncatedTitle}</span>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero section (title block) */}
        <section className="bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 pt-10 pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                  domainBadgeClass[publication.domain]
                }`}
              >
                {publication.domain}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {publication.year}
              </span>
              <span className="text-xs text-slate-500">Article scientifique</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight max-w-4xl mb-5">
              {publication.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <Users className="w-4 h-4 text-slate-400" />
              <span>
                {publication.authors.map((a, i) => (
                  <span key={a}>
                    {a}
                    {i < publication.authors.length - 1 && (
                      <span className="text-slate-300">,&nbsp;&nbsp;</span>
                    )}
                  </span>
                ))}
              </span>
            </div>

            <p className="italic text-blue-500 text-sm mb-6">{publication.journal}</p>

            <a
              href={publication.pdfUrl ?? '#'}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </a>
          </div>
        </section>

        {/* Two-column content */}
        <section className="border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <Card title="Résumé">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {publication.description}
                </p>
              </Card>

              <Card title="Mots-clés">
                <div className="flex flex-wrap gap-2">
                  {publication.keywords.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </Card>

              <Card title="Auteurs">
                <div className="flex flex-col gap-3">
                  {(publication.detailedAuthors ?? []).map((a) => (
                    <AuthorRow key={a.name} author={a} />
                  ))}
                  {!publication.detailedAuthors?.length && (
                    <p className="text-sm text-slate-500">
                      {publication.authors.join(', ')}
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Right column */}
            <aside className="flex flex-col gap-5">
              <Card title="Informations">
                <InfoRow label="Type" value={publication.type} />
                <InfoRow label="Année" value={String(publication.year)} />
                <InfoRow
                  label="Domaine"
                  value={
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                        domainBadgeClass[publication.domain]
                      }`}
                    >
                      {publication.domain}
                    </span>
                  }
                />
                <InfoRow
                  label="Revue"
                  value={
                    <span className="text-sm text-slate-700">{publication.journal}</span>
                  }
                />
                {publication.laboratoire && (
                  <InfoRow
                    label="Laboratoire"
                    value={
                      <span className="text-sm font-medium text-blue-500">
                        {publication.laboratoire}
                      </span>
                    }
                  />
                )}
              </Card>

              {similar.length > 0 && (
                <Card title="Publications similaires">
                  <ul className="flex flex-col gap-4">
                    {similar.map((s) => (
                      <li key={s.id}>
                        <SimilarItem publication={s} />
                      </li>
                    ))}
                  </ul>
                </Card>
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

interface CardProps {
  title: string
  children: ReactNode
}

const Card = ({ title, children }: CardProps) => (
  <div className="bg-white border border-slate-200 rounded-lg p-5">
    <h3 className="text-base font-semibold text-slate-900 mb-3">{title}</h3>
    {children}
  </div>
)

interface InfoRowProps {
  label: string
  value: ReactNode
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="mb-3 last:mb-0">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <div className="text-sm text-slate-800">{value}</div>
  </div>
)

interface AuthorRowProps {
  author: PublicationAuthor
}

const AuthorRow = ({ author }: AuthorRowProps) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
      <User className="w-4 h-4 text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-900">{author.name}</p>
      {(author.institution || author.faculty) && (
        <p className="text-xs text-slate-500">
          {[author.institution, author.faculty].filter(Boolean).join(' / ')}
        </p>
      )}
    </div>
  </div>
)

interface SimilarItemProps {
  publication: Publication
}

const SimilarItem = ({ publication }: SimilarItemProps) => (
  <Link
    href={`/publications/${publication.id}`}
    className="group block"
  >
    <p className="text-sm font-medium text-slate-900 group-hover:text-blue-500 transition-colors line-clamp-2 leading-snug mb-1">
      {publication.title}
    </p>
    <p className="text-xs text-slate-500">{publication.year}</p>
  </Link>
)

export default PublicationDetailPage
