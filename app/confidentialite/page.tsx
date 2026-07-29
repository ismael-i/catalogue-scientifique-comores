import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Confidentialité',
}

const ConfidentialitePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <section className="bg-slate-950 text-white">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300 mb-3">
              Politique de confidentialité
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Vos données et votre vie privée
            </h1>
            <p className="mx-auto max-w-3xl text-sm sm:text-base leading-7 text-slate-200">
              Le Catalogue Scientifique s'engage à protéger vos informations personnelles et à respecter les règles de confidentialité applicables.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-10 grid gap-6 sm:grid-cols-2">
          <PrivacyCard
            title="Collecte des données"
            description="Nous collectons uniquement les informations nécessaires pour fournir les services et améliorer l'expérience utilisateur."
            points={[
              'Coordonnées de contact',
              'Informations publiées par les chercheurs et institutions',
              'Données techniques liées à la navigation',
            ]}
          />
          <PrivacyCard
            title="Utilisation des données"
            description="Les informations collectées sont utilisées pour le bon fonctionnement du site, la communication et l'analyse statistique."
            points={[
              'Gestion des comptes',
              'Amélioration des contenus',
              'Envoi d\'informations importantes',
            ]}
          />
          <PrivacyCard
            title="Partage des données"
            description="Nous ne vendons jamais les données personnelles et ne les partageons qu'avec des prestataires de confiance lorsque cela est nécessaire."
            points={[
              'Partenaires techniques',
              'Hébergeur du site',
              'Autorités légales si requis',
            ]}
          />
          <PrivacyCard
            title="Vos droits"
            description="Vous pouvez accéder, rectifier ou demander la suppression de vos données en nous contactant."
            points={[
              'Droit d’accès et de rectification',
              'Droit à l’effacement',
              'Droit d’opposition et de limitation',
            ]}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-5">
              Sécurité et conservation
            </h2>
            <p className="text-sm text-slate-600 leading-7 mb-4">
              Les données sont conservées pour la durée nécessaire à la réalisation des finalités et sont protégées par des mesures de sécurité adaptées.
            </p>
            <p className="text-sm text-slate-600 leading-7">
              En cas de question concernant la confidentialité ou pour exercer vos droits, contactez-nous à
              <span className="font-semibold text-slate-900"> contact@catalogue-scientifique.km</span>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

interface PrivacyCardProps {
  title: string
  description: string
  points: string[]
}

const PrivacyCard = ({ title, description, points }: PrivacyCardProps) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900 mb-3">{title}</h3>
    <p className="text-sm text-slate-600 leading-7 mb-4">{description}</p>
    <ul className="space-y-3 text-sm text-slate-600">
      {points.map((point) => (
        <li key={point} className="flex gap-3 items-start">
          <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default ConfidentialitePage
