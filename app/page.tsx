'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/sections/hero'
import { CTASection } from '@/components/sections/cta-section'
import { ResearchersSection } from '@/components/sections/researchers-section'
import LabPage from '@/components/sections/LabPage'
import { Section } from '@/components/sections/Section'
import { articles } from '@/lib/articles'
import { ArticleCard } from '@/components/ArticleCard'

export default function Home() {
  // const [searchQuery, setSearchQuery] = useState('')

  // const filteredItems = CATALOG_ITEMS.filter(
  //   (item) =>
  //     item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     item.description.toLowerCase().includes(searchQuery.toLowerCase())
  // )

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
              {articles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} {...article} />
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
