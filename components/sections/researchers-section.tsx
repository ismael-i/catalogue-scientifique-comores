'use client'

import Link from 'next/link'

import { ArrowRight } from 'lucide-react'
import { ResearcherCard } from '../researcher/researcher-card'
import {MOCK_CHERCHEURS} from "@/lib/data";

const researchers = [
  {
    id: '1',
    name: 'Dr Nadjim Ahmed Mohamed',
    affiliation: 'UDC / FST',
    specialty: 'Écosystème et Biodiversité marine, pollution marine et côtière',
  },
  {
    id: '2',
    name: 'Dr Azali Ahamada',
    affiliation: 'UDC / FST',
    specialty: 'Aliments, Réactivité et Synthèse des Substances Naturelles',
  },
  {
    id: '3',
    name: 'Mme Sara Said Anli',
    affiliation: 'UDC / FST',
    specialty: 'Géosciences et Environnement',
  },
  {
    id: '4',
    name: 'Abdoulanfour Abdou',
    affiliation: 'Bureau Géologique des Comores',
    specialty: 'Géophysique, géologie, géochimie',
  },
  {
    id: '5',
    name: 'Dr Soilhi Mohamed',
    affiliation: 'UDC / FST',
    specialty: 'Études et données scientifiques sur les secteurs informels et...',
  },
  {
    id: '6',
    name: 'Dr Chakira Hamada',
    affiliation: 'UDC / FST',
    specialty: 'Entomologie, Neurosciences et Santé',
  },
]

export function ResearchersSection() {
  
  return (
    <section className="w-full bg-gray-50 py-16 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Chercheurs référencés
            </h2>
            <p className="text-gray-600 text-sm">
              Découvrez les profils mis en avant dans le catalogue
            </p>
          </div>
          <Link href="/chercheurs" className="text-blue-500 hover:text-blue-600 text-sm font-semibold flex items-center gap-1">
            Voir tous
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Researchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CHERCHEURS.slice(0, 6).
            map((researcher) => (
              <ResearcherCard
                key={researcher.id}
                chercheur={researcher}
              />
            ))}
        </div>
      </div>
    </section>
  )
}
