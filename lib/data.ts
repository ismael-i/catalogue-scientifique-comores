import type { Laboratoire, Institution } from "../types";
import type { Chercheur, ChercheurCard } from '../types'

import type { LaboratoireDetail } from '../types'
// ── Laboratoires ────────────────────────────────────────────────────

// export const labos: Laboratoire[] = [
//   {
//     acronym: "LSML",
//     name: "Laboratoire des Sciences Marines et Littorales",
//     description:
//       "Le LSML est dédié à l'étude des écosystèmes marins et littoraux de l'archipel des Comores. Il mène des recherches sur la biodiversité marine, la qualité des eaux côtières et les impacts du changement climatique.",
//     researchers: 5,
//     institution: "Université des Comores",
//   },
//   {
//     acronym: "LEFE",
//     name: "Laboratoire d'Écologie Fonctionnelle et Environnement",
//     description:
//       "Le LEFE de l'INRAPE mène des recherches en écologie fonctionnelle, contrôle qualité, agro-pédologie et culture in vitro de plantes à haute valeur économique.",
//     researchers: 7,
//     institution: "INRAPE",
//   },
//   {
//     acronym: "BGC",
//     name: "Bureau Géologique des Comores",
//     description:
//       "Le BGC mène des études géophysiques, géologiques et géochimiques, avec un focus sur la géothermie et les risques naturels liés au volcanisme et aux séismes.",
//     researchers: 54,
//     institution: "Bureau Géologique des Comores",
//   },
// ];

// ── Institutions ────────────────────────────────────────────────────


export const institutions: Institution[] = [
  {
    acronym: 'UDC',
    name: 'Université des Comores',
    description:
      "Fondée en 2003, l'UDC est l'université publique principale de l'Union des Comores. Elle est composée de plusieurs facultés, instituts et centres universitaires répartis sur les trois îles.",
    logo: '/intitutions/udc.jpeg',
    logoBg: 'bg-blue-50',
  },
  {
    acronym: 'INRAPE',
    name: "Institut National de Recherche pour l'Agriculture, la Pêche et l'Environnement",
    description:
      "Institut national dédié à la recherche appliquée dans les domaines de l'agriculture, de la pêche et de l'environnement aux Comores.",
    logo: '/intitutions/inrape.jpeg',
    logoBg: 'bg-green-50',
  },
  {
    acronym: 'CNDRS',
    name: 'Centre National de Documentation et de Recherche Scientifique',
    description:
      'Centre de recherche pluridisciplinaire couvrant la sismologie, la volcanologie, le patrimoine, les risques naturels et les sciences sociales.',
    logo: '/intitutions/cndrs.jpeg',
    logoBg: 'bg-amber-50',
  },
  {
    acronym: 'BGC',
    name: 'Bureau Géologique des Comores',
    description:
      'Organisme spécialisé dans les études géophysiques, géologiques et géochimiques, notamment la géothermie et les ressources en eau.',
    logo: '/intitutions/bgc.jpeg',
    logoBg: 'bg-orange-50',
  },
  {
    acronym: 'LNTPB-EPIC',
    name: 'Laboratoire National de Travaux Publics et Bâtiment',
    description:
      'Établissement public à caractère industriel et commercial intervenant dans la recherche sur les matériaux locaux, la géotechnique et la construction.',
    logo: '/intitutions/lntpb.jpeg',
    logoBg: 'bg-slate-50',
  },
]



export const MOCK_CHERCHEURS: Chercheur[] = [
  {
    id: 'nadjim-ahmed-mohamed',
    name: 'Dr Nadjim Ahmed Mohamed',
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lsml',
    laboratoire: 'Laboratoire des Sciences Marines et Littorales (LSML)',
    effectif: 5,
    specialty: 'Écosystème et Biodiversité marine, pollution marine et côtière',
    publications:
      'Mahamoud, A., Maher, G., Mohamed, N.A. et al. (2023) Monitoring shoreline change using remote sensing, GIS, and field surveys: a case study of the Ngazidja Island Coast, Comoros. Arab J Geosci 16, 114',
    partenariats:
      'Nekton Première Descente: Expédition Comores, Projet COEXISTENCE, Projet Mermoz, Projet Hifadhi Blu',
    email: 'ahmed.nadjim@fst-udc.org',
    phone: '+269-341 62 48',
  },
  {
    id: 'andiliyat-said-mohamed',
    name: 'Dr Andiliyat Said Mohamed',
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'hnc',
    laboratoire: 'Herbier National des Comores (HNC)',
    specialty: 'Biodiversité, botanique, géomatique',
    publications: 'Oui (colloques, bases de données)',
    partenariats: 'LR2SN, LEFE',
    note: 'Manque de locaux et équipements',
  },
  {
    id: 'said-hassani-mohamed',
    name: 'Dr Said Hassani Mohamed',
    photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'biosan',
    laboratoire: 'Laboratoire Biologie et Santé (BioSan)',
    effectif: 12,
    specialty: 'Biologie et Santé',
    email: 'mohamed.saidhassani@univ-comores.com',
    phone: '3330787',
    note: 'Équipements et réactifs insuffisants',
  },
  {
    id: 'malik-elhouyoun-ahamada',
    name: 'Dr Malik El-Houyoun Ahamada',
    photoUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lema',
    laboratoire: "Laboratoire d'Énergétique et Mécanique Appliquée (LEMA)",
    effectif: 6,
    specialty: 'Énergétique et mécanique appliquée',
    partenariats:
      "IME (Université d'Antananarivo), Department of Chemical and Environmental Engineering, University of Mauritius",
    email: 'elhouyoun@gmail.com',
    phone: '3634730 / 483 30 62',
    note: 'Manque de locaux et équipements, manque de financements',
  },
  {
    id: 'salim-ahmed',
    name: 'Dr Salim Ahmed',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lapec',
    laboratoire: "Laboratoire de Physique de l'Environnement et du Climat (LaPEC)",
    specialty: "Physique de l'environnement et du climat",
    phone: '3227652',
  },
  {
    id: 'halassi-abdoulhafar',
    name: 'Dr Halassi Abdoulhafar',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lmsia',
    laboratoire: 'Laboratoire Mathématique Statistique Informatique et Application (LMSIA)',
    effectif: 32,
    specialty: 'Mathématiques, Informatique et IA',
    partenariats:
      'Université de Lille, Toulon, Sorbonne Paris Nord, Hassan II Casablanca, Poitiers',
    email: 'halassi.abdoul@gmail.com',
    phone: '3350176',
  },
  {
    id: 'azali-ahamada',
    name: 'Dr Azali Ahamada',
    photoUrl: 'https://randomuser.me/api/portraits/men/47.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    specialty: 'Aliments, Réactivité et Synthèse des Substances Naturelles',
  },
  {
    id: 'ibrahim-said-ali',
    name: 'Dr Ibrahim Said Ali',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    specialty: 'Valorisation des ressources alimentaires locales',
  },
  {
    id: 'rastami-ahamadi',
    name: 'Rastami Ahamadi',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    specialty: 'Inventaires des plantes médicinales et aromatiques',
  },
  {
    id: 'allaoui-ahamadi',
    name: 'Allaoui Ahamadi',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    specialty: 'Santé des plantes et animaux',
  },
  {
    id: 'anli-mohamed',
    name: 'Dr Anli Mohamed',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    specialty: 'Valorisation et transformation des déchets',
  },
  {
    id: 'mohamed-abdou',
    name: 'Dr Mohamed Abdou',
    institutionId: 'bgc',
    institution: 'BGC',
    specialty: 'Gestion et exploitation des ressources géologiques',
  },
  {
    id: 'azali-ahamada-inrape',
    name: 'Dr Azali Ahamada',
    institutionId: 'inrape',
    institution: 'INRAPE',
    specialty: 'Aliments, Réactivité et Synthèse des Substances Naturelles',
  },
  {
    id: 'chakira-hamada',
    name: 'Dr Chakira Hamada',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    specialty: 'Entomologie, Neurosciences et Santé',
  },
]

export const MOCK_RELATED: ChercheurCard[] = MOCK_CHERCHEURS
  .filter((c) => c.institution === 'UDC' && c.id !== MOCK_CHERCHEURS[0].id)
  .slice(0, 3)
  .map(({ id, name, photoUrl, institution, faculty, specialty }) => ({
    id, name, photoUrl, institution, faculty, specialty,
  }))


// lib/mock/laboratoires.ts
// export interface Chercheur {
//   nom: string;
//   titre?: string;
//   email?: string;
//   telephone?: string;
// }

export interface Publication {
  titre: string;
  auteurs: string;
  annee: number;
}

// export interface LaboratoireDetail {
//   id: string;
//   acronym: string;
//   name: string;
//   description: string;
//   categorie: string;
//   researchers: number;
//   institution: string;
//   institutionId: string;
//   thematiques?: string[];
//   responsable?: Chercheur;
//   publications?: Publication[];
//   partenariats?: string[];
//   contact?: {
//     email?: string;
//     telephone?: string;
//     site?: string;
//   };
// }

export const MOCK_LABORATOIRES: LaboratoireDetail[] = [
  {
    id: "lsml",
    acronym: "LSML",
    name: "Laboratoire des Sciences Marines et Littorales",
    description:
      "Le LSML est dédié à l'étude des écosystèmes marins et littoraux de l'archipel des Comores. Il mène des recherches sur la biodiversité marine, la pollution côtière et la gestion durable des ressources.",
    categorie: "Environnement",
    researchers: 5,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Écosystème et Biodiversité marine", "Pollution marine et côtière"],
    logo : '/labicon/LSML.svg',
    responsable: 
       {
    id: 'nadjim-ahmed-mohamed',
    name: 'Dr Nadjim Ahmed Mohamed',
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lsml',
    laboratoire: 'Laboratoire des Sciences Marines et Littorales (LSML)',
    effectif: 5,
    specialty: 'Écosystème et Biodiversité marine, pollution marine et côtière',
    publications:
      'Mahamoud, A., Maher, G., Mohamed, N.A. et al. (2023) Monitoring shoreline change using remote sensing, GIS, and field surveys: a case study of the Ngazidja Island Coast, Comoros. Arab J Geosci 16, 114',
    partenariats:
      'Nekton Première Descente: Expédition Comores, Projet COEXISTENCE, Projet Mermoz, Projet Hifadhi Blu',
    email: 'ahmed.nadjim@fst-udc.org',
    phone: '+269-341 62 48',
  },
    
    publications: [
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
    ],
    partenariats: ["Nekton Première Descente", "Projet COEXISTENCE", "Projet Mermoz", "Projet Hifadhi Blu"],
  },
  {
    id: "hnc",
    acronym: "HNC",
    name: "Herbier National des Comores",
    description:
      "L'Herbier national des Comores est consacré à l'inventaire et à la conservation de la flore comorienne. Il associe botanique, géomatique et bases de données pour documenter la biodiversité.",
    categorie: "Sciences",
    researchers: 3,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Biodiversité", "Botanique", "Géomatique"],
    logo : '/labicon/HNC.svg',
    responsable: {
    id: 'andiliyat-said-mohamed',
    name: 'Dr Andiliyat Said Mohamed',
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'hnc',
    laboratoire: 'Herbier National des Comores (HNC)',
    specialty: 'Biodiversité, botanique, géomatique',
    publications: 'Oui (colloques, bases de données)',
    partenariats: 'LR2SN, LEFE',
    note: 'Manque de locaux et équipements',
  },
    partenariats: ["LR2SN", "LEFE"],
  },
  {
    id: "biosan",
    acronym: "BioSan",
    name: "Laboratoire Biologie et Santé",
    description:
      "Le Laboratoire BioSan mène des recherches en biologie et santé, couvrant la microbiologie, la biochimie et la santé publique.",
    categorie: "Santé",
    researchers: 12,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Biologie et Santé"],
     logo : '/labicon/BIOSAN.svg',
    responsable:  {
    id: 'said-hassani-mohamed',
    name: 'Dr Said Hassani Mohamed',
    photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'biosan',
    laboratoire: 'Laboratoire Biologie et Santé (BioSan)',
    effectif: 12,
    specialty: 'Biologie et Santé',
    email: 'mohamed.saidhassani@univ-comores.com',
    phone: '3330787',
    note: 'Équipements et réactifs insuffisants',
    
  },
  },
  {
    id: "lema",
    acronym: "LEMA",
    name: "Laboratoire d'Énergétique et Mécanique Appliquée",
    description:
      "Le LEMA se consacre à la recherche en énergétique et mécanique appliquée, en collaboration avec des universités internationales.",
    categorie: "Sciences",
    researchers: 6,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Énergétique et mécanique appliquée"],
    logo : '/labicon/LEMA.svg',
    responsable:  {
    id: 'malik-elhouyoun-ahamada',
    name: 'Dr Malik El-Houyoun Ahamada',
    photoUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lema',
    laboratoire: "Laboratoire d'Énergétique et Mécanique Appliquée (LEMA)",
    effectif: 6,
    specialty: 'Énergétique et mécanique appliquée',
    partenariats:
      "IME (Université d'Antananarivo), Department of Chemical and Environmental Engineering, University of Mauritius",
    email: 'elhouyoun@gmail.com',
    phone: '3634730 / 483 30 62',
    note: 'Manque de locaux et équipements, manque de financements',
  },
    partenariats: ["IME (Université d'Antananarivo)", "University of Mauritius"],
  },
  {
    id: "lapec",
    acronym: "LaPEC",
    name: "Laboratoire de Physique de l'Environnement et du Climat",
    description:
      "Le LaPEC mène des recherches sur la physique de l'environnement et les sciences du climat dans le contexte insulaire des Comores.",
    categorie: "Sciences",
    researchers: 4,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Physique de l'environnement et du climat"],
    responsable: {
    id: 'salim-ahmed',
    name: 'Dr Salim Ahmed',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lapec',
    laboratoire: "Laboratoire de Physique de l'Environnement et du Climat (LaPEC)",
    specialty: "Physique de l'environnement et du climat",
    phone: '3227652',
  },
  },
  {
    id: "lmsia",
    acronym: "LMSIA",
    name: "Laboratoire Mathématique Statistique Informatique et Application",
    description:
      "Le LMSIA regroupe des chercheurs en mathématiques, statistique, informatique et intelligence artificielle des Comores.",
    categorie: "Sciences",
    researchers: 32,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Mathématiques", "Informatique et IA"],
    logo : '/labicon/LMSIA.svg',
    responsable:  {
    id: 'halassi-abdoulhafar',
    name: 'Dr Halassi Abdoulhafar',
    institutionId: 'udc',
    institution: 'UDC',
    faculty: 'FST',
    laboratoireId: 'lmsia',
    laboratoire: 'Laboratoire Mathématique Statistique Informatique et Application (LMSIA)',
    effectif: 32,
    specialty: 'Mathématiques, Informatique et IA',
    partenariats:
      'Université de Lille, Toulon, Sorbonne Paris Nord, Hassan II Casablanca, Poitiers',
    email: 'halassi.abdoul@gmail.com',
    phone: '3350176',
  },
    partenariats: ["Université de Lille", "Toulon", "Sorbonne Paris Nord", "Hassan II Casablanca", "Poitiers"],
  },
  {
    id: "lar2sn",
    acronym: "LAR2SN",
    name: "Laboratoire Aliments, Réactivité et Synthèse des Substances Naturelles",
    description:
      "Le LAR2SN se consacre à la recherche sur les substances naturelles, la réactivité chimique et la valorisation des ressources alimentaires locales.",
    categorie: "Sciences",
    researchers: 11,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Substances naturelles", "Réactivité chimique", "Valorisation alimentaire"],
    logo : '/labicon/LAR2SN.svg',
    partenariats: ["Université de La Réunion"],
  },
  {
    id: "larre-b",
    acronym: "LARRE-B",
    name: "Laboratoire de Recherche sur les Ressources Environnementales et le Bien-Être",
    description:
      "Le LARRE-B mène des recherches sur la valorisation des ressources environnementales et les solutions locales pour le bien-être des populations comoriennes.",
    categorie: "Sciences",
    researchers: 5,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Environnement", "Bien-être social"],
  },
  {
    id: "psn",
    acronym: "PSN",
    name: "Phytochimie des Sciences Naturelles",
    description:
      "Ce laboratoire se consacre à l'inventaire et à l'étude phytochimique des plantes médicinales et aromatiques des Comores.",
    categorie: "Sciences",
    researchers: 10,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Phytochimie", "Plantes médicinales"],
  },
  {
    id: "epp",
    acronym: "EPP",
    name: "Entomo-Phyto-Pathologie",
    description:
      "Laboratoire dédié à l'étude des maladies des plantes et des animaux, à l'entomologie et à la phytopathologie.",
    categorie: "Sciences",
    researchers: 5,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Entomologie", "Phytopathologie", "Maladies animales"],
  },
  {
    id: "gavd",
    acronym: "GAVD",
    name: "Gestion Agricole et Valorisation des Déchets",
    description:
      "Recherche sur la gestion agricole durable et la valorisation des déchets organiques et agricoles.",
    categorie: "Sciences",
    researchers: 6,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Gestion agricole", "Valorisation des déchets"],
    logo : '/labicon/GAVD.svg'
  },
  {
    id: "gvetm",
    acronym: "GVETM",
    name: "Gestion et Valorisation des Écosystèmes Terrestres et Marins",
    description:
      "Recherche sur la gestion durable et la valorisation des écosystèmes terrestres et marins des Comores.",
    categorie: "Environnement",
    researchers: 5,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Écosystèmes terrestres", "Écosystèmes marins"],
  },
  {
    id: "dej-sif",
    acronym: "DEJ-SIF",
    name: "Dynamiques Économiques et Juridiques des Secteurs Informels et Formels",
    description:
      "Production d'études et de données scientifiques sur les dynamiques économiques et juridiques des secteurs informels et formels aux Comores.",
    categorie: "Économie",
    researchers: 8,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Économie informelle", "Droit et économie"],
  },
  {
    id: "fcl",
    acronym: "FCL",
    name: "FLE et Création Littéraire",
    description:
      "Recherche sur le français langue étrangère, la didactique des langues et la création littéraire comorienne.",
    categorie: "Lettres",
    researchers: 9,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["FLE", "Didactique des langues", "Création littéraire"],
  },
  {
    id: "emsp-lab",
    acronym: "EMSP-Lab",
    name: "Laboratoire en Création à l'EMSP",
    description:
      "Laboratoire en cours de création au sein de l'École de Médecine et de Santé Publique de l'Université des Comores.",
    categorie: "Santé",
    researchers: 5,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Santé publique", "Médecine"],
  },
  {
    id: "lvm",
    acronym: "LVM",
    name: "Laboratoire Vivants de Mohéli",
    description:
      "Laboratoire dédié à l'étude des organismes vivants et de la biodiversité de l'île de Mohéli.",
    categorie: "Sciences",
    researchers: 3,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Biodiversité", "Organismes vivants"],
  },
  {
    id: "larjes",
    acronym: "LARJES",
    name: "Laboratoire de Recherche Juridiques Économiques et Sociales",
    description:
      "Recherche pluridisciplinaire en droit, économie et sciences sociales appliquée au contexte comorien.",
    categorie: "Économie",
    researchers: 3,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Droit", "Économie", "Sciences sociales"],
    logo : '/labicon/LARJES.svg'
  },
  {
    id: "lage",
    acronym: "LaGE",
    name: "Laboratoire de Géosciences et Environnement",
    description:
      "Le LaGE mène des recherches en géosciences et environnement, incluant la géologie, l'hydrologie et les risques naturels.",
    categorie: "Environnement",
    researchers: 11,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Géosciences", "Environnement", "Risques naturels"],
  },
  {
    id: "leens",
    acronym: "LEENS",
    name: "Laboratoire Entomologie Neurosciences et Santé",
    description:
      "Le LEENS mène des recherches à l'intersection de l'entomologie, des neurosciences et de la santé publique.",
    categorie: "Santé",
    researchers: 7,
    institution: "Université des Comores",
    institutionId: "udc",
    thematiques: ["Entomologie", "Neurosciences", "Santé publique"],
    logo : '/labicon/LEENS.svg'
  },
  {
    id: "lefe",
    acronym: "LEFE",
    name: "Laboratoire d'Écologie Fonctionnelle et Environnement",
    description:
      "Le LEFE de l'INRAPE mène des recherches en écologie fonctionnelle, contrôle qualité, agro-pédologie et culture in vitro.",
    categorie: "Environnement",
    researchers: 7,
    institution: "INRAPE",
    institutionId: "inrape",
    thematiques: ["Écologie fonctionnelle", "Agro-pédologie", "Culture in vitro"],
  },
  {
    id: "lsaz",
    acronym: "LSAZ",
    name: "Laboratoire Santé Animale et Zoonoses",
    description:
      "Recherche sur la santé animale, les zoonoses et la production animale aux Comores.",
    categorie: "Santé",
    researchers: 2,
    institution: "INRAPE",
    institutionId: "inrape",
    thematiques: ["Santé animale", "Zoonoses"],
  },
  {
    id: "lcqrv",
    acronym: "LCQRV",
    name: "Laboratoire Contrôle Qualité, Recherche et Vulgarisation",
    description:
      "Laboratoire dédié au contrôle qualité, à la recherche et à la vulgarisation scientifique.",
    categorie: "Sciences",
    researchers: 2,
    institution: "INRAPE",
    institutionId: "inrape",
    thematiques: ["Contrôle qualité", "Vulgarisation scientifique"],
    logo : '/labicon/LCQRV.svg'
  },
  {
    id: "lep",
    acronym: "LEP",
    name: "Laboratoire Entomologie et Phytopathologie",
    description:
      "Recherche en entomologie et phytopathologie appliquée à l'agriculture comorienne.",
    categorie: "Sciences",
    researchers: 2,
    institution: "INRAPE",
    institutionId: "inrape",
    thematiques: ["Entomologie", "Phytopathologie"],
  },
  {
    id: "lorh",
    acronym: "LORH",
    name: "Laboratoire de Recherche Océanographique et Ressources Halieutiques",
    description:
      "Recherche océanographique et étude des ressources halieutiques des eaux comoriennes.",
    categorie: "Environnement",
    researchers: 2,
    institution: "INRAPE",
    institutionId: "inrape",
    thematiques: ["Océanographie", "Ressources halieutiques"],
  },
  {
    id: "lrcn",
    acronym: "LRCN",
    name: "Laboratoire Risques et Catastrophes Naturelles",
    description:
      "Recherche sur la volcanologie, la sismologie et les risques naturels de l'archipel des Comores.",
    categorie: "Sciences",
    researchers: 4,
    institution: "CNDRS",
    institutionId: "cndrs",
    thematiques: ["Volcanologie", "Sismologie", "Risques naturels"],
     logo : '/labicon/LRCN.svg'
  },
  {
    id: "ura",
    acronym: "URA",
    name: "Unité de Recherche en Anthropologie",
    description:
      "Recherche anthropologique sur la société comorienne, le patrimoine culturel et les dynamiques de changement.",
    categorie: "Lettres",
    researchers: 4,
    institution: "CNDRS",
    institutionId: "cndrs",
    thematiques: ["Anthropologie", "Patrimoine culturel"],
    logo : '/labicon/URA.svg'
  },
  {
    id: "lntpb",
    acronym: "LNTPB",
    name: "Laboratoire National de Travaux Publics et Bâtiment",
    description:
      "Recherche sur les matériaux locaux, la géotechnique et la construction adaptée au contexte comorien.",
    categorie: "Sciences",
    researchers: 2,
    institution: "LNTPB-EPIC",
    institutionId: "lntpb",
    thematiques: ["Matériaux locaux", "Géotechnique", "Construction"],
    logo : '/labicon/LNTPB.svg'
  },
  {
    id: "bgc",
    acronym: "BGC",
    name: "Bureau Géologique des Comores",
    description:
      "Le BGC mène des études géophysiques, géologiques et géochimiques, avec un focus sur la géothermie et les ressources en eau de l'archipel.",
    categorie: "Sciences",
    researchers: 54,
    institution: "Bureau Géologique des Comores",
    institutionId: "bgc",
    thematiques: ["Géophysique", "Géologie", "Géochimie", "Géothermie"],
    logo : '/labicon/BGC.svg'
  },
];
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
    logo : '/labicon/icones 14 labos-03.svg'
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
