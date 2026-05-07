import type { ReactNode } from 'react'
import {
  BookOpen,
  FlaskConical,
  Globe,
  Mail,
  Target,
  Users,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const AProposPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-16 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5">
              À propos
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-3xl mx-auto">
              Le Catalogue Scientifique des Comores est une initiative nationale visant à
              valoriser la recherche scientifique de l&apos;ensemble des établissements
              universitaires comoriens et à favoriser la collaboration académique.
            </p>
          </div>
        </section>

        {/* Mission / Vision */}
        <section>
          <div className="max-w-5xl mx-auto px-6 pt-2 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <PillarCard
              icon={<Target className="w-5 h-5 text-blue-500" />}
              iconBg="bg-sky-50"
              title="Notre mission"
              description="Recenser, valoriser et rendre visible l'ensemble des chercheurs, laboratoires et publications scientifiques de l'Union des Comores."
            />
            <PillarCard
              icon={<Globe className="w-5 h-5 text-blue-500" />}
              iconBg="bg-sky-50"
              title="Notre vision"
              description="Faire des Comores un acteur reconnu de la recherche scientifique dans l'océan Indien et au-delà, en favorisant la collaboration et le partage des connaissances."
            />
          </div>
        </section>

        {/* Objectifs */}
        <section>
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10">
              <h2 className="text-xl font-bold text-slate-900 mb-8">
                Objectifs de la plateforme
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ObjectiveItem
                  icon={<Users className="w-5 h-5 text-emerald-600" />}
                  title="Référencer les chercheurs"
                  description="Constituer un annuaire complet et à jour des chercheurs comoriens et de leurs domaines d'expertise."
                />
                <ObjectiveItem
                  icon={<FlaskConical className="w-5 h-5 text-emerald-600" />}
                  title="Cartographier les laboratoires"
                  description="Donner de la visibilité aux unités de recherche actives et en création au sein des institutions comoriennes."
                />
                <ObjectiveItem
                  icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
                  title="Diffuser les publications"
                  description="Centraliser et faciliter l'accès aux travaux de recherche produits par les scientifiques comoriens."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="max-w-5xl mx-auto px-6 pt-6 pb-16">
            <div className="bg-sky-50 border border-sky-100 rounded-xl px-6 py-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Contact</h2>
              <p className="text-sm text-slate-500 mb-5">
                Pour toute question, suggestion ou demande de référencement :
              </p>
              <p className="text-base font-semibold text-slate-900 mb-1">
                contact@catalogue-scientifique.km
              </p>
              <p className="text-sm text-slate-500">Moroni, Union des Comores</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────

interface PillarCardProps {
  icon: ReactNode
  iconBg: string
  title: string
  description: string
}

const PillarCard = ({ icon, iconBg, title, description }: PillarCardProps) => (
  <div className="bg-white border border-slate-200 rounded-xl p-7">
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 ${iconBg}`}
    >
      {icon}
    </div>
    <h2 className="text-base font-semibold text-slate-900 mb-3">{title}</h2>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
)

interface ObjectiveItemProps {
  icon: ReactNode
  title: string
  description: string
}

const ObjectiveItem = ({ icon, title, description }: ObjectiveItemProps) => (
  <div className="text-center">
    <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
  </div>
)

export default AProposPage
