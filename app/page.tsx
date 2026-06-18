'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/sections/hero'
import { CTASection } from '@/components/sections/cta-section'
import { ResearchersSection } from '@/components/sections/researchers-section'
import LabPage from '@/components/sections/LabPage'
import { Section } from '@/components/sections/Section'
import { articles } from '@/lib/articles'
import { ArticleCard } from '@/components/ArticleCard'
import { ArticleData, articlesApi } from '@/lib/api/articles'
import { ApiError } from '@/lib/api/client'
import { AlertCircle } from 'lucide-react'

export default function Home() {
  // const [searchQuery, setSearchQuery] = useState('')

  // const filteredItems = CATALOG_ITEMS.filter(
  //   (item) =>
  //     item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     item.description.toLowerCase().includes(searchQuery.toLowerCase())
  // )

    const [items, setItems] = useState<ArticleData[]>([])
    const [error, setError] = useState<string | null>(null) 
    const [loading, setLoading]     = useState(true)

      useEffect(() => {
    async function fetchArcticle() {
      setLoading(true)
      setError(null)
      try {
         const result = await articlesApi.findAll({
                 limit: 3
               })
        setItems(result.data)
      } catch (err){
        setError(err instanceof ApiError ? err.message : "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    fetchArcticle()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <Hero />

        {/* Researchers Section */}
        <ResearchersSection />

        {/* lab and institution Cards */}
        <LabPage />

        {/* article page */}

        {/* Fil info */}
        <section className="mb-14">
            <div className="max-w-6xl mx-auto px-6">
              <Section
                title="Fil info"
                subtitle="Les dernières actualités scientifiques"
                viewAllLabel="Voir tout →"
                cols={3}
              >
                
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
                  <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
                </div>
              )}
              {items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              </Section>
            </div>
        </section>

      </main>

      <CTASection />
      <Footer />
    </div>
  )
}
