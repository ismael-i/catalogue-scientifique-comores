import { institutions, labos } from "@/lib/data";
import { Section } from "./Section";
import { LabCard } from "../labs/LabCard";
import { InstitutionCard } from "../institution/InstitutionCard";

export default function LabPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-6">

        {/* Laboratoires */}
        <Section
          title="Laboratoires de recherche"
          subtitle="Les unités de recherche actives aux Comores"
          viewAllLabel="Voir tous →"
          cols={3}
        >
         {labos.slice(0, 6).map((labo) => (
            <LabCard key={labo.acronym} {...labo} />
          ))}
        </Section>

        {/* Institutions */}
        <Section
          title="Institutions"
          subtitle="Les institutions scientifiques des Comores"
          viewAllLabel="Voir toutes →"
          cols={3}
        >
          {institutions && institutions.slice(0, 3).map((inst) => (
            <InstitutionCard key={inst.acronym} {...inst} />
          ))}
        </Section>

      </div>
    </div>
  );
}
