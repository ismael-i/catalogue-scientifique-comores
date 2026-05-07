'use client'
// app/chercheurs/[id]/page.tsx
// Gère uniquement : fetch des données + état (loading, chercheur, related)
// Le rendu est délégué aux composants dans components/chercheurs/

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import type { Chercheur, ChercheurCard } from '@/types'

import { FicheSkeleton }  from '@/components/researcher/FicheSkeleton'
import { FicheHero }      from '@/components/researcher/FicheHero'
import { FicheContent }   from '@/components/researcher/FicheContent'
import { FicheSidebar }   from '@/components/researcher/FicheSidebar'
import { FicheRelated }   from '@/components/researcher/FicheRelated'
import { MOCK_CHERCHEURS, MOCK_RELATED } from '@/lib/data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

interface PageProps {
  params: Promise<{ id: string }>  
}


export default function FicheChercheurPage({ params }: PageProps) {
  const { id } = use(params)     
    const [chercheur, setChercheur] = useState<Chercheur | null>(null)
  const [related, setRelated]     = useState<ChercheurCard[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
      const [resChercheur, resRelated] = await Promise.all([
          fetch(`/api/chercheurs/${id}`),
          fetch(`/api/chercheurs/${id}/related`),
        ])
        const [c, r] = await Promise.all([resChercheur.json(), resRelated.json()])
        setChercheur(c)
        setRelated(r)
      } catch {
        // Fallback données fictives (dev uniquement)   
      // ✅ Cherche par id dans le tableau
const found = MOCK_CHERCHEURS.find((c) => c.id === id) ?? MOCK_CHERCHEURS[0]
setChercheur(found)

// ✅ Related = même institution, sans le chercheur courant
setRelated(
  MOCK_CHERCHEURS
    .filter((c) => c.institution === found.institution && c.id !== found.id)
    .slice(0, 3)
)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
          <Header /> 
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-blue-500 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/chercheurs" className="hover:text-blue-500 transition-colors">Chercheurs</Link>
          <span>/</span>
          <span className="text-slate-600 truncate">{chercheur?.name ?? '…'}</span>
        </nav>

        {loading && <FicheSkeleton />}

        {!loading && !chercheur && (
          <p className="text-slate-500">Chercheur introuvable.</p>
        )}

        {!loading && chercheur && (
          <>
            <FicheHero chercheur={chercheur} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mb-14">
              <FicheContent chercheur={chercheur} />
              <FicheSidebar chercheur={chercheur} />
            </div>

            <FicheRelated chercheurs={related} />
          </>
        )}

      </div>
       <Footer />
    </div>
  )
}