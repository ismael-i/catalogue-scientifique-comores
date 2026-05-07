'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  FlaskConical,
  Newspaper,
  Tag as TagIcon,
  User,
} from 'lucide-react'
import { getArticleById } from '@/lib/articles'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const FilInfoDetailPage = () => {
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === 'string' ? params.id : ''
  const article = id ? getArticleById(id) : undefined

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6 py-20">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              Actualité introuvable
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              L&apos;actualité que vous cherchez n&apos;existe pas ou a été déplacée.
            </p>
            <Link
              href="/fil-info"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              Retour au fil info
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const truncatedTitle =
    article.title.length > 36 ? `${article.title.slice(0, 36)}...` : article.title

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
          <Link href="/fil-info" className="hover:text-blue-500 transition-colors">
            Fil info
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-700">{truncatedTitle}</span>
        </div>
      </div>

      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-8">
          {/* Back link */}
          <Link
            href="/fil-info"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au fil info
          </Link>

          {/* Date */}
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Calendar className="w-4 h-4" />
            {article.date}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-5">
            {article.title}
          </h1>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-7">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs"
                >
                  <TagIcon className="w-3 h-3" />
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Cover image */}
          <div className="rounded-xl overflow-hidden mb-8 bg-slate-100">
            {article.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.imageUrl}
                alt={article.imageAlt ?? article.title}
                className="w-full h-auto max-h-[520px] object-cover"
              />
            ) : (
              <div className="w-full h-[420px] bg-gradient-to-br from-cyan-50 to-sky-100 flex items-center justify-center">
                <Newspaper className="w-16 h-16 text-sky-300" />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 text-sm text-slate-600 leading-relaxed mb-8">
            {article.body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Separator */}
          <hr className="border-slate-200 mb-6" />

          {/* Author + Laboratory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {article.authorPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.authorPhotoUrl}
                    alt={article.authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Auteur</p>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {article.authorName}
                </p>
              </div>
            </div>

            {article.laboratoryAcronym && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">Laboratoire</p>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {article.laboratoryAcronym}
                    {article.laboratoryName && (
                      <>
                        <span className="text-slate-400"> – </span>
                        <span className="font-normal text-slate-600">
                          {article.laboratoryName}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}

export default FilInfoDetailPage
