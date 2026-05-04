'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Users, FlaskConical, BookOpen, Building2 } from 'lucide-react'

const stats = [
  { icon: Users,        value: 45, label: 'Chercheurs'   },
  { icon: FlaskConical, value: 28, label: 'Laboratoires' },
  { icon: BookOpen,     value: 12, label: 'Publications'  },
  { icon: Building2,    value: 5,  label: 'Institutions'  },
]

// Logos partenaires — remplace src par les vraies URLs/imports
const partnerLogos = [
  { src: '/logos/udc.png',    alt: 'Université des Comores' },
  { src: '/logos/inrape.png', alt: 'INRAPE' },
  { src: '/logos/lntpb.png',  alt: 'LNTPB' },
  { src: '/logos/cndrs.png',  alt: 'CNDRS' },
  { src: '/logos/bgc.png',    alt: 'BGC' },
]

export function Hero() {
  return (
    <section className="w-full">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* ── Bande logos ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-y-4 gap-x-6 mb-16 pb-8">

          {/* Logos partenaires — scroll horizontal sur très petits écrans */}
          <div className="flex items-center gap-4 overflow-x-auto pb-1 flex-1 min-w-0">
            {partnerLogos.map(({ src, alt }) => (
              <div
                key={alt}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    // Fallback si le logo est absent
                    const t = e.currentTarget
                    t.style.display = 'none'
                    if (t.parentElement) {
                      t.parentElement.innerHTML =
                        `<span class="text-gray-400 text-[10px] text-center px-1">${alt}</span>`
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Soutien Ambassade de France */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900 leading-tight">Avec le soutien de</p>
              <p className="text-xs text-gray-600">l&apos;Ambassade de France</p>
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/ambassade-france.png"
                alt="Ambassade de France"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  const t = e.currentTarget
                  t.style.display = 'none'
                  if (t.parentElement) {
                    t.parentElement.innerHTML =
                      `<span class="text-blue-700 text-[10px] font-bold text-center px-1">🇫🇷</span>`
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Titre + CTA ───────────────────────────────────────────── */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-gray-800">Catalogue Scientifique</span>
            <br />
            <span className="text-blue-500">des Comores</span>
          </h1>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
            Explorez le répertoire des chercheurs, laboratoires et publications
            scientifiques de l&apos;Union des Comores. Un outil au service de la
            recherche et de la collaboration académique.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 h-auto rounded flex items-center gap-2">
              Explorer les chercheurs
              <ArrowRight size={18} />
            </Button>
            <Button
              variant="outline"
              className="text-gray-700 hover:text-blue-500 border-gray-300 px-6 py-3 h-auto"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100  flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-500" strokeWidth={1.6} />
                </div>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}