import type { Publication, PublicationDomain } from '@/types'

export const publications: Publication[] = [
  {
    id: 'monitoring-shoreline-ngazidja-2023',
    title:
      'Monitoring shoreline change using remote sensing, GIS, and field surveys: a case study of the Ngazidja Island Coast, Comoros',
    domain: 'Environnement',
    year: 2023,
    type: 'Article Scientifique',
    authors: ['Mahamoud, A.', 'Maher, G.', 'Mohamed, N.A.'],
    journal: 'Arab J Geosci 16, 114',
    description:
      'Cette étude analyse les changements du littoral de l’île de Ngazidja à l’aide de la télédétection, des SIG et d’enquêtes de terrain.',
    keywords: ['télédétection', 'SIG', 'érosion côtière', 'Ngazidja'],
    laboratoire: 'LSML',
    institutionAcronym: 'UDC',
    detailedAuthors: [
      { name: 'Dr Nadjim Ahmed Mohamed', institution: 'UDC', faculty: 'FST' },
    ],
  },
  {
    id: 'wio-benthic-imagery-2022',
    title: 'The WIO Regional Benthic Imagery Workshop: Lessons from past IIOE-2 expeditions',
    domain: 'Environnement',
    year: 2022,
    type: 'Article Scientifique',
    authors: ['Haupt, T.', 'Ceasar, J.', 'Stefanoudis, P.', 'Ahmed, N.'],
    journal: 'Research Ideas and Outcomes, 8, e81563',
    description:
      'Compte-rendu de l’atelier régional sur l’imagerie benthique de l’océan Indien occidental.',
    keywords: ['imagerie benthique', 'océan Indien', 'IIOE-2'],
    laboratoire: 'LSML',
    institutionAcronym: 'UDC',
  },
  {
    id: 'coastal-vulnerability-ngazidja-2022',
    title:
      'A preliminary assessment of coastal vulnerability for Ngazidja Island, Comoros Archipelago, Western Indian Ocean',
    domain: 'Environnement',
    year: 2022,
    type: 'Article Scientifique',
    authors: ['Mahamoud A.', 'Gzam M.', 'Ahmed Mohamed N.', 'Soulé H.H.', 'Montacer M.'],
    journal: 'Environ Earth Sci, 81(2), 1-14',
    description:
      'Évaluation préliminaire de la vulnérabilité côtière de l’île de Ngazidja dans l’archipel des Comores.',
    keywords: ['vulnérabilité côtière', 'Ngazidja', 'Comores'],
    laboratoire: 'LSML',
    institutionAcronym: 'UDC',
  },
  {
    id: 'risk-coastal-erosion-ngazidja-2022',
    title:
      'Risk Assessment of Coastal Erosion Hazard of Ngazidja Island in Comoros Archipelago',
    domain: 'Environnement',
    year: 2022,
    type: 'Communication De Conférence',
    authors: ['Mahamoud A.', 'Mohamed N.A.', 'Maher G.', 'Montacer M.'],
    journal: 'Conference of the Arabian Journal of Geosciences (pp. 277-280), Springer, Cham',
    description: 'Évaluation des risques d’érosion côtière de l’île de Ngazidja.',
    keywords: ['érosion côtière', 'risques', 'Ngazidja'],
    laboratoire: 'LSML',
    institutionAcronym: 'UDC',
  },
  {
    id: 'phyllarthron-bignoniaceae-2011',
    title: 'Études des feuilles de Phyllarthron madagascariense (BIGNONIACEAE)',
    domain: 'Sciences',
    year: 2011,
    type: 'Article Scientifique',
    authors: ['Ibrahim Said Ali', 'Laurence R.'],
    journal: 'Éditions Universitaires Européennes',
    description: 'Étude des propriétés des feuilles de Phyllarthron madagascariense.',
    keywords: ['Phyllarthron', 'BIGNONIACEAE', 'botanique'],
    institutionAcronym: 'UDC',
  },
  {
    id: 'cycas-comores-2014',
    title:
      'Les fruits de Cycas (Cycadaceae) des Comores : utilisation, compositions chimique et nutritionnelle',
    domain: 'Sciences',
    year: 2014,
    type: 'Article Scientifique',
    authors: ['Ibrahim Said Ali', 'Louisette Razanamparany', 'Olivier Gilbert'],
    journal: 'Afrique Science 10(2): 394-408',
    description:
      'Analyse de l’utilisation et de la composition chimique et nutritionnelle des fruits de Cycas des Comores.',
    keywords: ['Cycas', 'nutrition', 'Comores', 'chimie'],
    institutionAcronym: 'UDC',
  },
  {
    id: 'malaria-comoro-islands-2017',
    title: 'Control of malaria in the Comoro Islands over the past century',
    domain: 'Santé',
    year: 2017,
    type: 'Article Scientifique',
    authors: ['Ismael Chakir', 'Ibrahim Said Ali', 'Bacar Affane', 'Ronan Jambou'],
    journal: 'Malaria Journal, 16:387',
    description:
      'Revue historique du contrôle du paludisme dans les Iles Comores au cours du siècle dernier.',
    keywords: ['paludisme', 'malaria', 'Comores', 'contrôle'],
    institutionAcronym: 'UDC',
  },
  {
    id: 'starches-cycas-ntsambu-2024',
    title:
      'Physicochemical and functional properties of starches of flour of Cycas fruits or "Ntsambu" from Comoros',
    domain: 'Sciences',
    year: 2024,
    type: 'Article Scientifique',
    authors: ['Ibrahim Said Ali', 'Ismael Chakir', 'Anli Mohamed', 'Louisette Razanamparany'],
    journal: 'International Journal of Engineering Technologies and Management Research, 11(8), 9-26',
    description:
      'Propriétés physicochimiques et fonctionnelles des amidons de farine de fruits de Cycas des Comores.',
    keywords: ['Cycas', 'Ntsambu', 'amidon', 'Comores'],
    institutionAcronym: 'UDC',
  },
  {
    id: 'microcredit-double-sanction-2025',
    title:
      'Contrats de microcrédit à double sanction sociale : une approche markovienne de la viabilité incitative',
    domain: 'Économie',
    year: 2025,
    type: 'Article Scientifique',
    authors: [
      'Andriamanantena Philibert',
      'Abdou Issouf',
      'Ravelomanana Mamy Raoul',
      'Rakotozafy Rivo',
    ],
    journal: 'Revue Française d’Économie et de Gestion, Volume 6: Numéro 11, pp. 577-601',
    description:
      'Modélisation markovienne des contrats de microcrédit avec double sanction sociale.',
    keywords: ['microcrédit', 'Markov', 'microfinance'],
    institutionAcronym: 'UDC',
  },
  {
    id: 'shikomor-ndzuani-2025',
    title:
      'La langue maternelle dans le système éducatif de Ndzuani (Comores) : politiques linguistiques et didactique du shikomor',
    domain: 'Lettres',
    year: 2025,
    type: 'Article Scientifique',
    authors: ['Daniel R.S.'],
    journal: 'Revue Internationale du Chercheur, Volume 6: Numéro 4, pp. 1002-1026',
    description:
      'Analyse des politiques linguistiques et de la didactique du shikomor dans le système éducatif de Ndzuani.',
    keywords: ['shikomor', 'linguistique', 'éducation', 'Ndzuani'],
    institutionAcronym: 'UDC',
  },
  {
    id: 'ntrimba-nioumakele-anjouan-2020',
    title: 'Le Ntrimba de Nioumakélé à Anjouan-Comores, rite agraire séculaire',
    domain: 'Lettres',
    year: 2020,
    type: 'Article Scientifique',
    authors: ['Abdou Mohamed Abdallah'],
    journal: 'SOKELA',
    description:
      'Étude du Ntrimba de Nioumakélé, rite agraire séculaire de l’Île d’Anjouan.',
    keywords: ['Ntrimba', 'Anjouan', 'rite agraire', 'anthropologie'],
    institutionAcronym: 'UDC',
  },
  {
    id: 'pomdp-microfinance-choquet-2025',
    title:
      'Gouvernance multi-niveaux en microfinance : un cadre POMDP coopératif avec intégrale de Choquet hiérarchique',
    domain: 'Économie',
    year: 2025,
    type: 'Article Scientifique',
    authors: ['Abdou Issouf', 'Philibert Andriamanantena'],
    journal: 'HAL Archives Ouvertes',
    description:
      'Cadre POMDP coopératif avec intégrale de Choquet hiérarchique pour la gouvernance multi-niveaux en microfinance.',
    keywords: ['POMDP', 'microfinance', 'Choquet', 'gouvernance'],
    institutionAcronym: 'UDC',
  },
]

export const getPublicationsByInstitution = (acronym: string): Publication[] =>
  publications.filter(
    (p) => p.institutionAcronym?.toLowerCase() === acronym.toLowerCase(),
  )

export const PUBLICATION_DOMAINS: PublicationDomain[] = [
  'Environnement',
  'Sciences',
  'Santé',
  'Économie',
  'Lettres',
]

export const domainBadgeClass: Record<PublicationDomain, string> = {
  Environnement: 'bg-sky-100 text-sky-700',
  Sciences: 'bg-cyan-100 text-cyan-700',
  Santé: 'bg-rose-100 text-rose-700',
  Économie: 'bg-amber-100 text-amber-800',
  Lettres: 'bg-violet-100 text-violet-700',
}

export const getPublicationById = (id: string): Publication | undefined =>
  publications.find((p) => p.id === id)

export const getSimilarPublications = (
  publication: Publication,
  limit = 3,
): Publication[] =>
  publications
    .filter((p) => p.id !== publication.id && p.domain === publication.domain)
    .slice(0, limit)
