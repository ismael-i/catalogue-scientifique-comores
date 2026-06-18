'use client'
import { institutions,MOCK_LABORATOIRES } from "@/lib/data";
import { Section } from "./Section";
import { LabCard } from "../labs/LabCard";
import { InstitutionCard } from "../institution/InstitutionCard";
import { useEffect, useState } from "react";
import { LaboratoireCard, laboratoiresApi } from "@/lib/api/laboratoires";
import { ApiError } from "@/lib/api/client";
import { AlertCircle } from "lucide-react";
import { InstitutionData, institutionsApi } from "@/lib/api/institutions";

export default function LabPage() {

   const [labos, setLabos]         = useState<LaboratoireCard[]>([])
    const [items, setItems] = useState<InstitutionData[]>([])
    const [error, setError] = useState<string | null>(null) 
    const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function fetchLabosAndIns() {
      setLoading(true)
      setError(null)
      try {
         const result = await laboratoiresApi.findAll({
                limit: 6
              }) 
        // const data = await res.json()
        setLabos(result.data)
        const resultIns = await institutionsApi.findAll({
                  limit: 3
                })
        setItems(resultIns.data)
      } catch (err){
        setError(err instanceof ApiError ? err.message : "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }
    fetchLabosAndIns()
  }, [])
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-6">

        {/* Laboratoires */}
        <Section
          title="Laboratoires de recherche"
          subtitle="Les unités de recherche actives aux Comores"
          viewAllLabel="Voir tous →"
          link="/laboratoires"
          cols={3}
        >
            {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
          </div>
        )}
         {labos.map((labo) => (
            <LabCard key={labo.id} labo={labo} />
          ))}
        </Section>

        {/* Institutions */}
        <Section
          title="Institutions"
          subtitle="Les institutions scientifiques des Comores"
          viewAllLabel="Voir toutes →"
          link="/institutions"
          cols={3}
        >
          {items && items.map((inst) => (
            <InstitutionCard key={inst.acronym} {...inst} />
          ))}
        </Section>

      </div>
    </div>
  );
}
