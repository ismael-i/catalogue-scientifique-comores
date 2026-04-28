'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { CatalogCards } from '@/components/catalog-cards'
import { CTASection } from '@/components/cta-section'
import { ResearchersSection } from '@/components/researchers-section'

const CATALOG_ITEMS = [
  {
    id: '1',
    title: 'Faune Marine',
    category: 'Biologie Marine',
    description: 'Exploration complète de la vie marine des eaux de Comores, incluant poissons, coraux et crustacés.',
    specimens: 2450,
    icon: '🐠',
  },
  {
    id: '2',
    title: 'Flore Endémique',
    category: 'Botanique',
    description: 'Collection des plantes uniques et endémiques des îles de Comores avec leurs propriétés botaniques.',
    specimens: 1820,
    icon: '🌿',
  },
  {
    id: '3',
    title: 'Géologie et Minéralogie',
    category: 'Géosciences',
    description: 'Étude des formations géologiques, roches volcaniques et minéraux présents dans l\'archipel.',
    specimens: 950,
    icon: '🪨',
  },
  {
    id: '4',
    title: 'Aviofaune',
    category: 'Ornithologie',
    description: 'Catalogue complet des espèces d\'oiseaux observées aux Comores, migrateurs et résidents.',
    specimens: 340,
    icon: '🦅',
  },
  {
    id: '5',
    title: 'Écosystèmes et Habitats',
    category: 'Écologie',
    description: 'Analyse détaillée des différents écosystèmes insulaires et de leur biodiversité associée.',
    specimens: 1200,
    icon: '🌴',
  },
  {
    id: '6',
    title: 'Ressources Naturelles',
    category: 'Études Appliquées',
    description: 'Inventaire des ressources naturelles exploitables et leur gestion durable.',
    specimens: 675,
    icon: '⛏️',
  },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = CATALOG_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <Hero />

        {/* Researchers Section */}
        <ResearchersSection />

        {/* Catalog Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Catégories du Catalogue</h2>
              <p className="text-gray-600 text-sm">
                {searchQuery
                  ? `${filteredItems.length} résultat${filteredItems.length !== 1 ? 's' : ''} trouvé${filteredItems.length !== 1 ? 's' : ''}`
                  : 'Explorez les 6 catégories principales de notre catalogue scientifique'}
              </p>
            </div>
            {filteredItems.length > 0 ? (
              <CatalogCards items={filteredItems} />
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">
                  Aucun résultat trouvé pour &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-blue-400 mb-2">8,000+</p>
                <p className="text-gray-300 text-sm">Spécimens catalogués</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-400 mb-2">6</p>
                <p className="text-gray-300 text-sm">Catégories principales</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-400 mb-2">100+</p>
                <p className="text-gray-300 text-sm">Années de recherche</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-400 mb-2">3</p>
                <p className="text-gray-300 text-sm">Îles principales</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CTASection />
      <Footer />
    </div>
  )
}
