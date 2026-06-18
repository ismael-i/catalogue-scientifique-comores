'use client'

import Link from 'next/link'

import { AlertCircle, ArrowRight, Search } from 'lucide-react'
import { ResearcherCard } from '../researcher/researcher-card'
import {MOCK_CHERCHEURS} from "@/lib/data";
import { useEffect, useState } from 'react';
import { ChercheurCard, chercheursApi } from '@/lib/api/chercheurs';
import { ViewMode } from '@/types';
import { ApiError } from '@/lib/api/client';
import { ChercheurSkeletonList } from '../ChercheurSkeleton';

export function ResearchersSection() {
  const [chercheurs, setChercheurs] = useState<ChercheurCard[]>([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState<ViewMode>('grid')
  const [error, setError]           = useState<string | null>(null)


  // ── Fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchChercheurs() {
      setLoading(true)
      try {
        // Remplace cette URL par ton endpoint réel
        const result = await chercheursApi.findAll({
            limit: 6,
              })
        setChercheurs(result.data)
      } catch (err) {
        // En dev, données fictives pour prévisualiser
          setError(err instanceof ApiError ? err.message : "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    fetchChercheurs()
  }, [])


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
           {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
          </div>
        )}
        {/* Researchers Grid */}
        <div className="">
             {loading ? (
          <ChercheurSkeletonList count={6} mode={view} />
        ) : chercheurs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-10 h-10 text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">Aucun chercheur ne correspond à votre recherche.</p>
          </div>
        ) :   (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chercheurs.map((c) => (
                 <ResearcherCard
                key={c.id}
                chercheur={c}
              />
            ))}
          </div>
        ) }
        </div>
          {/* {MOCK_CHERCHEURS.slice(0, 6).
            map((researcher) => (
              <ResearcherCard
                key={researcher.id}
                chercheur={researcher}
              />
            ))} */}
      </div>
    </section>
  )
}
