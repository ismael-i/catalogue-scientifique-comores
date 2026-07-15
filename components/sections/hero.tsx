'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Users, FlaskConical, BookOpen, Building2 } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { icon: Users,        value: 170, label: 'Chercheurs'   },
  { icon: FlaskConical, value: 30, label: 'Laboratoires' },
  { icon: BookOpen,     value: 21, label: 'Publications'  },
  { icon: Building2,    value: 5,  label: 'Institutions'  },
]

// Logos partenaires — remplace src par les vraies URLs/imports
const partnerLogos = [
  { src: 'udc.jpeg', alt: 'Université des Comores' },
  { src: 'inrape.jpeg', alt: 'INRAPE' },
  { src: 'lntpb.jpeg',  alt: 'LNTPB' },
  { src: 'cndrs.jpeg', alt: 'CNDRS' },
  { src: 'bgc.jpeg',    alt: 'BGC' },
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
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg  flex items-center justify-center flex-shrink-0 overflow-hidden"
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
            <Link href={'/chercheurs'} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 h-auto rounded flex items-center gap-2">
              Explorer les chercheurs
              <ArrowRight size={18} />
            </Link>
            <Link href={'/a-propos'}
              className="text-gray-700 hover:text-blue-500 border-gray-300 px-6 py-3 h-auto"
            >
              En savoir plus
            </Link>
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