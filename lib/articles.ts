import type { Article } from '@/types/article'

export const articles: Article[] = [
  {
    id: 'nekton-2025',
    date: '15 mars 2025',
    title: 'Expédition Nekton : première exploration des fonds marins comoriens',
    description:
      "Le Dr Nadjim Ahmed Mohamed et l'équipe du LSML ont participé à la première descente en eaux profondes autour de l'archipel des Comores dans le cadre du programme Nekton.",
    imageUrl: '/placeholder.jpg',
    imageAlt: 'Chercheur en plongée sous-marine',
    tags: ['Biodiversité marine', 'Expédition', 'LSML'],
    body: [
      "L'expédition Nekton Première Descente aux Comores a marqué une étape historique pour la recherche marine dans l'archipel. Dirigée en partenariat avec le Laboratoire des Sciences Marines et Littorales (LSML), cette mission a permis d'explorer pour la première fois les écosystèmes profonds entourant les îles comoriennes.",
      "Le Dr Nadjim Ahmed Mohamed, responsable du LSML à la Faculté des Sciences et Techniques de l'Université des Comores, a coordonné la participation comorienne à cette expédition internationale. Les plongées en submersible ont révélé une biodiversité insoupçonnée à des profondeurs allant jusqu'à 500 mètres.",
      "Parmi les découvertes notables, l'équipe a identifié plusieurs espèces de coraux profonds, d'éponges et de poissons potentiellement nouvelles pour la science. Les données collectées contribueront à mieux comprendre les écosystèmes marins de l'océan Indien occidental et à orienter les politiques de conservation marine aux Comores.",
      "Cette collaboration s'inscrit dans le cadre du projet COEXISTENCE et du projet Hifadhi Blu, qui visent à renforcer la protection des zones marines comoriennes.",
    ],
    authorName: 'Dr Nadjim Ahmed Mohamed',
    laboratoryAcronym: 'LSML',
    laboratoryName: 'Laboratoire des Sciences Marines et Littorales',
  },
  {
    id: 'herbier-2025',
    date: '20 février 2025',
    title:
      "Numérisation de l'Herbier National des Comores : 2000 spécimens catalogués",
    description:
      "Le Dr Andiliyat Said Mohamed annonce la numérisation de plus de 2000 spécimens botaniques de l'Herbier National, facilitant l'accès aux chercheurs internationaux.",
    imageUrl: '/placeholder.jpg',
    imageAlt: 'Chercheuse en laboratoire',
    tags: ['Botanique', 'Biodiversité', 'Numérisation'],
    body: [
      "L'Herbier National des Comores franchit une étape majeure : 2000 spécimens botaniques ont été numérisés et rendus accessibles à la communauté scientifique internationale.",
      "Le Dr Andiliyat Said Mohamed, responsable du projet, souligne que cette initiative facilite la collaboration entre chercheurs et contribue à la préservation du patrimoine botanique de l'archipel.",
    ],
    authorName: 'Dr Andiliyat Said Mohamed',
    laboratoryAcronym: 'HNC',
    laboratoryName: 'Herbier National des Comores',
  },
  {
    id: 'sechoir-2025',
    date: '10 janvier 2025',
    title:
      'Le LEMA développe un prototype de séchoir solaire pour les agriculteurs comoriens',
    description:
      "Le Laboratoire d'Énergétique et Mécanique Appliquée présente un séchoir solaire innovant adapté aux conditions climatiques des Comores.",
    imageUrl: '/placeholder.jpg',
    imageAlt: 'Chercheur présentant son projet',
    tags: ['Énergie solaire', 'Agriculture', 'Innovation'],
    body: [
      "Le Laboratoire d'Énergétique et Mécanique Appliquée (LEMA) dévoile un prototype de séchoir solaire conçu spécifiquement pour répondre aux besoins des agriculteurs comoriens.",
      "Ce dispositif, fruit de plusieurs mois de recherche, doit permettre de mieux conserver les récoltes locales tout en réduisant la dépendance énergétique des petites exploitations.",
    ],
    authorName: 'Dr Malik El-Houyoun Ahamada',
    laboratoryAcronym: 'LEMA',
    laboratoryName: "Laboratoire d'Énergétique et Mécanique Appliquée",
  },
  {
    id: 'lmsia-2024',
    date: '5 décembre 2024',
    title:
      "Partenariat LMSIA-Universités européennes pour l'Intelligence Artificielle",
    description:
      'Le laboratoire LMSIA signe de nouveaux accords de coopération avec les universités de Lille et Toulon pour développer la recherche en IA aux Comores.',
    tags: ['Intelligence Artificielle', 'Partenariat', 'Mathématiques'],
    body: [
      "Le LMSIA officialise une nouvelle phase de coopération scientifique avec les universités de Lille et de Toulon. Cet accord ouvre la voie à des projets conjoints en intelligence artificielle, en statistique appliquée et en mathématiques numériques.",
      "Le Dr Halassi Abdoulhafar, à l'origine de cette collaboration, met l'accent sur la formation de jeunes chercheurs comoriens et le partage d'infrastructures de calcul à l'échelle internationale.",
    ],
    authorName: 'Dr Halassi Abdoulhafar',
    laboratoryAcronym: 'LMSIA',
    laboratoryName: 'Laboratoire Mathématique Statistique Informatique et Application',
  },
  {
    id: 'bgc-karthala-2024',
    date: '18 novembre 2024',
    title: 'Étude géothermique majeure du BGC sur le Karthala',
    description:
      "Le Bureau Géologique des Comores publie les résultats d'une étude géothermique approfondie sur le volcan Karthala, ouvrant la voie à l'exploitation de l'énergie géothermique.",
    tags: ['Géothermie', 'Volcanologie', 'Énergie'],
    body: [
      "Le Bureau Géologique des Comores (BGC) rend publics les résultats d'une vaste étude géothermique menée sur le volcan Karthala. Les mesures collectées au cours des derniers mois confirment un potentiel énergétique significatif.",
      "Selon Abdoulanfour Abdou, ces résultats constituent une étape clé pour orienter les futures décisions publiques en matière d'énergie renouvelable et de réduction de la dépendance aux énergies fossiles.",
    ],
    authorName: 'Abdoulanfour Abdou',
    laboratoryAcronym: 'BGC',
    laboratoryName: 'Bureau Géologique des Comores',
  },
  {
    id: 'lar2sn-huiles-2024',
    date: '22 octobre 2024',
    title: 'Le LAR2SN valorise les huiles essentielles comoriennes',
    description:
      "Le laboratoire LAR2SN publie une étude comparative sur les propriétés antimicrobiennes des huiles essentielles d'ylang-ylang et de girofle des Comores.",
    imageUrl: '/placeholder.jpg',
    imageAlt: 'Chercheur du LAR2SN',
    tags: ['Huiles essentielles', 'Chimie', 'Substances naturelles'],
    body: [
      "Le LAR2SN publie une nouvelle étude consacrée aux huiles essentielles emblématiques des Comores : l'ylang-ylang et le girofle. Le travail compare leurs propriétés antimicrobiennes face à plusieurs souches bactériennes.",
      "Le Dr Azali Ahamada, qui a dirigé l'équipe, voit dans ces résultats une base solide pour la valorisation industrielle des produits naturels comoriens, en particulier dans les filières cosmétique et thérapeutique.",
    ],
    authorName: 'Dr Azali Ahamada',
    laboratoryAcronym: 'LAR2SN',
    laboratoryName: 'Laboratoire Aliments, Réactivité et Synthèse des Substances Naturelles',
  },
]

export const getArticleById = (id: string): Article | undefined =>
  articles.find((a) => a.id === id)
