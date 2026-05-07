import type { Institution, Laboratoire } from '@/types'

// ── Institutions ────────────────────────────────────────────────────

export const institutions: Institution[] = [
  {
    acronym: 'UDC',
    name: 'Université des Comores',
    description:
      "Fondée en 2003, l'UDC est l'université publique principale de l'Union des Comores. Elle est composée de plusieurs facultés, instituts et centres universitaires répartis sur les trois îles.",
    logoBg: 'bg-blue-50',
  },
  {
    acronym: 'INRAPE',
    name: "Institut National de Recherche pour l'Agriculture, la Pêche et l'Environnement",
    description:
      "Institut national dédié à la recherche appliquée dans les domaines de l'agriculture, de la pêche et de l'environnement aux Comores.",
    logoBg: 'bg-green-50',
  },
  {
    acronym: 'CNDRS',
    name: 'Centre National de Documentation et de Recherche Scientifique',
    description:
      'Centre de recherche pluridisciplinaire couvrant la sismologie, la volcanologie, le patrimoine, les risques naturels et les sciences sociales.',
    logoBg: 'bg-amber-50',
  },
  {
    acronym: 'BGC',
    name: 'Bureau Géologique des Comores',
    description:
      'Organisme spécialisé dans les études géophysiques, géologiques et géochimiques, notamment la géothermie et les ressources en eau.',
    logoBg: 'bg-orange-50',
  },
  {
    acronym: 'LNTPB-EPIC',
    name: 'Laboratoire National de Travaux Publics et Bâtiment',
    description:
      'Établissement public à caractère industriel et commercial intervenant dans la recherche sur les matériaux locaux, la géotechnique et la construction.',
    logoBg: 'bg-slate-50',
  },
]

export const getInstitutionByAcronym = (acronym: string): Institution | undefined =>
  institutions.find((i) => i.acronym.toLowerCase() === acronym.toLowerCase())

// ── Laboratoires ────────────────────────────────────────────────────

export const labos: Laboratoire[] = [
  // UDC (19)
  {
    acronym: 'LSML',
    name: 'Laboratoire des Sciences Marines et Littorales',
    description:
      "Le LSML est dédié à l'étude des écosystèmes marins et littoraux de l'archipel des Comores.",
    researchers: 5,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Environnement',
  },
  {
    acronym: 'HNC',
    name: 'Herbier National des Comores',
    description: "Conservation et étude des plantes de l'archipel.",
    researchers: 3,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'BioSan',
    name: 'Laboratoire Biologie et Santé',
    description: 'Recherche en biologie et santé humaine.',
    researchers: 4,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Santé',
  },
  {
    acronym: 'LEMA',
    name: "Laboratoire d'Énergétique et Mécanique Appliquée",
    description: 'Énergétique, mécanique et applications industrielles.',
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'LaPEC',
    name: "Laboratoire de Physique de l'Environnement et du Climat",
    description: "Physique de l'environnement et du climat.",
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'LMSIA',
    name: 'Laboratoire Mathématique Statistique Informatique et Application',
    description: 'Mathématiques appliquées, statistique, informatique et IA.',
    researchers: 3,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'LAR2SN',
    name: 'Laboratoire Aliments, Réactivité et Synthèse des Substances Naturelles',
    description: 'Aliments, réactivité, synthèse des substances naturelles.',
    researchers: 3,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'LARRE-B',
    name: 'Laboratoire de Recherche sur les Ressources Environnementales et le Bien-Être',
    description: 'Ressources environnementales et bien-être humain.',
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'PSN',
    name: 'Phytochimie des Sciences Naturelles',
    description: 'Phytochimie et chimie des produits naturels.',
    researchers: 4,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'EPP',
    name: 'Entomo-Phyto-Pathologie',
    description: 'Entomologie, phytopathologie et défense des cultures.',
    researchers: 3,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'GAVD',
    name: 'Gestion Agricole et Valorisation des Déchets',
    description: 'Gestion agricole et valorisation des déchets.',
    researchers: 3,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'GVETM',
    name: 'Gestion et Valorisation des Écosystèmes Terrestres et Marins',
    description: 'Gestion et valorisation des écosystèmes terrestres et marins.',
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Sciences',
  },
  {
    acronym: 'DEJ-SIF',
    name: 'Dynamiques Économiques et Juridiques des Secteurs Informels et Formels',
    description: 'Dynamiques économiques et juridiques des secteurs.',
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Économie',
  },
  {
    acronym: 'FCL',
    name: 'FLE et Création Littéraire',
    description: 'Français langue étrangère et création littéraire.',
    researchers: 4,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Lettres',
  },
  {
    acronym: 'EMSP-Lab',
    name: "Laboratoire en Création à l'EMSP",
    description: "Recherche en création à l'EMSP.",
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Lettres',
  },
  {
    acronym: 'LVM',
    name: 'Laboratoire Vivants de Mohéli',
    description: 'Recherche sur les milieux vivants de Mohéli.',
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Environnement',
  },
  {
    acronym: 'LAR.JES',
    name: 'Laboratoire de Recherche Juridiques Économiques et Sociales',
    description: 'Recherche juridique, économique et sociale.',
    researchers: 3,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Économie',
  },
  {
    acronym: 'LaGE',
    name: 'Laboratoire de Géosciences et Environnement',
    description: 'Géosciences et environnement.',
    researchers: 2,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Environnement',
  },
  {
    acronym: 'LEENS',
    name: 'Laboratoire Entomologie Neurosciences et Santé',
    description: 'Entomologie, neurosciences et santé.',
    researchers: 3,
    institution: 'Université des Comores',
    institutionAcronym: 'UDC',
    domain: 'Santé',
  },

  // INRAPE (5)
  {
    acronym: 'LEFE',
    name: "Laboratoire d'Écologie Fonctionnelle et Environnement",
    description: "Le LEFE de l'INRAPE mène des recherches en écologie fonctionnelle.",
    researchers: 2,
    institution: 'INRAPE',
    institutionAcronym: 'INRAPE',
    domain: 'Environnement',
  },
  {
    acronym: 'LSAZ',
    name: 'Laboratoire Santé Animale et Zoonoses',
    description: 'Santé animale et zoonoses.',
    researchers: 1,
    institution: 'INRAPE',
    institutionAcronym: 'INRAPE',
    domain: 'Santé',
  },
  {
    acronym: 'LCQRV',
    name: 'Laboratoire Contrôle Qualité, Recherche et Vulgarisation',
    description: 'Contrôle qualité, recherche et vulgarisation.',
    researchers: 1,
    institution: 'INRAPE',
    institutionAcronym: 'INRAPE',
    domain: 'Sciences',
  },
  {
    acronym: 'LEP',
    name: 'Laboratoire Entomologie et Phytopathologie',
    description: 'Entomologie et phytopathologie.',
    researchers: 1,
    institution: 'INRAPE',
    institutionAcronym: 'INRAPE',
    domain: 'Sciences',
  },
  {
    acronym: 'LORH',
    name: 'Laboratoire de Recherche Océanographique et Ressources Halieutiques',
    description: 'Océanographie et ressources halieutiques.',
    researchers: 1,
    institution: 'INRAPE',
    institutionAcronym: 'INRAPE',
    domain: 'Environnement',
  },

  // CNDRS (2)
  {
    acronym: 'LRCN',
    name: 'Laboratoire Risques et Catastrophes Naturelles',
    description: 'Risques et catastrophes naturelles.',
    researchers: 0,
    institution: 'CNDRS',
    institutionAcronym: 'CNDRS',
    domain: 'Sciences',
  },
  {
    acronym: 'URA',
    name: 'Unité de Recherche en Anthropologie',
    description: 'Anthropologie et sciences sociales.',
    researchers: 0,
    institution: 'CNDRS',
    institutionAcronym: 'CNDRS',
    domain: 'Lettres',
  },

  // BGC (1)
  {
    acronym: 'BGC',
    name: 'Bureau Géologique des Comores',
    description:
      'Le BGC mène des études géophysiques, géologiques et géochimiques.',
    researchers: 3,
    institution: 'BGC',
    institutionAcronym: 'BGC',
    domain: 'Sciences',
  },

  // LNTPB-EPIC (1)
  {
    acronym: 'LNTPB',
    name: 'Laboratoire National de Travaux Publics et Bâtiment',
    description: 'Travaux publics, bâtiment et matériaux.',
    researchers: 0,
    institution: 'LNTPB-EPIC',
    institutionAcronym: 'LNTPB-EPIC',
    domain: 'Sciences',
  },
]

export const getLabosByInstitution = (institutionAcronym: string): Laboratoire[] =>
  labos.filter(
    (l) => l.institutionAcronym?.toLowerCase() === institutionAcronym.toLowerCase(),
  )
