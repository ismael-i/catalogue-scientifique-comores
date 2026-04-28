import type { Laboratoire, Institution } from "../types";

// ── Laboratoires ────────────────────────────────────────────────────

export const labos: Laboratoire[] = [
  {
    acronym: "LSML",
    name: "Laboratoire des Sciences Marines et Littorales",
    description:
      "Le LSML est dédié à l'étude des écosystèmes marins et littoraux de l'archipel des Comores. Il mène des recherches sur la biodiversité marine, la qualité des eaux côtières et les impacts du changement climatique.",
    researchers: 5,
    institution: "Université des Comores",
  },
  {
    acronym: "LEFE",
    name: "Laboratoire d'Écologie Fonctionnelle et Environnement",
    description:
      "Le LEFE de l'INRAPE mène des recherches en écologie fonctionnelle, contrôle qualité, agro-pédologie et culture in vitro de plantes à haute valeur économique.",
    researchers: 7,
    institution: "INRAPE",
  },
  {
    acronym: "BGC",
    name: "Bureau Géologique des Comores",
    description:
      "Le BGC mène des études géophysiques, géologiques et géochimiques, avec un focus sur la géothermie et les risques naturels liés au volcanisme et aux séismes.",
    researchers: 54,
    institution: "Bureau Géologique des Comores",
  },
];

// ── Institutions ────────────────────────────────────────────────────

export const institutions: Institution[] = [
  {
    acronym: "UDC",
    name: "Université des Comores",
    description:
      "Fondée en 2003, l'UDC est l'université publique principale de l'Union des Comores. Elle est composée de plusieurs facultés, instituts et centres universitaires répartis sur les trois îles.",
  },
  {
    acronym: "INRAPE",
    name: "Institut National de Recherche pour l'Agriculture, la Pêche et l'Environnement",
    description:
      "Institut national dédié à la recherche appliquée dans les domaines de l'agriculture, de la pêche et de l'environnement aux Comores.",
  },
  {
    acronym: "CNDRS",
    name: "Centre National de Documentation et de Recherche Scientifique",
    description:
      "Centre de recherche pluridisciplinaire couvrant la sismologie, la volcanologie, le patrimoine, les risques naturels et les sciences sociales.",
  },
];