'use client'
// app/chercheurs/[id]/page.tsx
// Gère uniquement : fetch des données + état (loading, chercheur, related)
// Le rendu est délégué aux composants dans components/chercheurs/

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import type { Chercheur } from '@/types'

import { FicheSkeleton }  from '@/components/researcher/FicheSkeleton'
import { FicheHero }      from '@/components/researcher/FicheHero'
import { FicheContent }   from '@/components/researcher/FicheContent'
import { FicheSidebar }   from '@/components/researcher/FicheSidebar'
import { FicheRelated }   from '@/components/researcher/FicheRelated'
import { MOCK_CHERCHEURS, MOCK_RELATED } from '@/lib/data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ChercheurCard, ChercheurDetail, chercheursApi } from '@/lib/api/chercheurs'
import { ApiError } from '@/lib/api/client'

interface PageProps {
  params: Promise<{ id: string }>  
}


export default function FicheChercheurPage({ params }: PageProps) {
  const { id } = use(params)     
  const [chercheur, setChercheur] = useState<ChercheurDetail | null>(null)
  const [related, setRelated]     = useState<ChercheurCard[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError] = useState<string | null>(null)
  

 useEffect(() => {
  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const data = await chercheursApi.findById(id)
      setChercheur(data)

      // On a maintenant "data" directement, pas besoin d'attendre le state chercheur
      try {
        if (data.institution) {
          const relatedRes = await chercheursApi.findAll({
            institution: data.institution.id,
            excludeId: data.id,
            limit: 3,
          })
          setRelated(relatedRes.data)
        } else {
          setRelated([])
        }
      } catch (relErr) {
        console.error('Erreur related:', relErr)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Chercheur non trouvé")
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