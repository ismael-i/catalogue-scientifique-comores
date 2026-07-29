import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Mentions légales',
}

const MentionsLegalesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-slate-100 to-white">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600 mb-3">
              Mentions légales
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Informations légales du Catalogue Scientifique
            </h1>
            <p className="mx-auto max-w-3xl text-sm sm:text-base text-slate-600 leading-7">
              Cette page présente les informations obligatoires concernant l'
              éditeur, l'hébergement et les conditions d'utilisation de la
              plateforme Catalogue Scientifique des Comores.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-2">
          <InfoCard
            title="Éditeur"
            description="Catalogue Scientifique des Comores"
            details={[
              'Adresse : Moroni, Grande Comore, Union des Comores',
              'Courriel : contact@catalogue-scientifique.km',
              'Téléphone : +269 123 456',
            ]}
          />
          <InfoCard
            title="Responsable de la publication"
            description="Le Directeur de la publication est chargé de la bonne diffusion des informations présentes sur le site."
            details={[
              'Nom : Direction générale',
              'Fonction : Responsable éditorial',
            ]}
          />

          <InfoCard
            title="Hébergement"
            description="Le site est hébergé sur une infrastructure sécurisée pour garantir une disponibilité et une confidentialité optimales."
            details={[
              'Hébergement : Fournisseur tiers certifié',
              'Adresse : Serveurs situés en Union des Comores ou dans l’océan Indien',
            ]}
          />
          <InfoCard
            title="Propriété intellectuelle"
            description="Tous les contenus publiés sur ce site sont protégés par le droit d'auteur et ne peuvent être reproduits sans autorisation."
            details={[
              'Textes, images et logos : propriété du Catalogue Scientifique',
              'Reproduction interdite sans accord préalable',
            ]}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-5">
              Utilisation du site
            </h2>
            <p className="text-sm text-slate-600 leading-7 mb-4">
              L'accès et l'utilisation de cette plateforme sont soumis au respect
              des lois en vigueur et des présentes mentions légales. Toute
              reproduction, intégrale ou partielle, du contenu est interdite sans
              autorisation.
            </p>
            <p className="text-sm text-slate-600 leading-7">
              Nous nous réservons le droit de modifier ces informations à tout
              moment, notamment pour garantir la conformité légale ou adapter
              notre service à l'évolution de la réglementation.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

interface InfoCardProps {
  title: string
  description: string
  details: string[]
}

const InfoCard = ({ title, description, details }: InfoCardProps) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900 mb-3">{title}</h3>
    <p className="text-sm text-slate-600 leading-7 mb-4">{description}</p>
    <ul className="space-y-3 text-sm text-slate-600">
      {details.map((item) => (
        <li key={item} className="flex gap-3 items-start">
          <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default MentionsLegalesPage
