/** Tronc commun TC1–TC7 — pré-évaluation MA et grille fédérale */
export const TRONC_COMMUN_ITEMS = [
  { key: "tc1", code: "TC1", label: "Qualités physiques" },
  { key: "tc2", code: "TC2", label: "Qualités techniques" },
  { key: "tc3", code: "TC3", label: "Posture/garde" },
  { key: "tc4", code: "TC4", label: "Motivation" },
  { key: "tc5", code: "TC5", label: "Techniques de main" },
  { key: "tc6", code: "TC6", label: "Mobilité" },
  { key: "tc7", code: "TC7", label: "Capacités cognitives" },
] as const

export type TCKey = (typeof TRONC_COMMUN_ITEMS)[number]["key"]

/** Spécifiques sabre S1–S8 — évaluateur fédéral uniquement */
export const SABRE_SPECIFIC_ITEMS = [
  { key: "s1", code: "S1", label: "Attaque simple (fente)" },
  { key: "s2", code: "S2", label: "Attaque composée" },
  { key: "s3", code: "S3", label: "Parade-riposte" },
  { key: "s4", code: "S4", label: "Contre-attaque" },
  { key: "s5", code: "S5", label: "Préparation d'attaque" },
  { key: "s6", code: "S6", label: "Flèche" },
  { key: "s7", code: "S7", label: "Jeu de fer" },
  { key: "s8", code: "S8", label: "Reprise d'attaque" },
] as const

export type SKey = (typeof SABRE_SPECIFIC_ITEMS)[number]["key"]

export const LIKERT_4_LABELS: Record<
  1 | 2 | 3 | 4,
  string
> = {
  1: "À développer (la compétence n'est pas présente)",
  2: "En cours de développement (présente mais inconsistante)",
  3: "En voie de maîtrise (généralement correcte)",
  4: "Maîtrise / point fort (automatisée, constante)",
}

/** Écart max entre deux évaluateurs fédéraux (/60) avant discordance */
export const DISCORDANCE_THRESHOLD = 6

export function sumTc(tc: Record<TCKey, number>): number {
  return TRONC_COMMUN_ITEMS.reduce((acc, { key }) => acc + (tc[key] ?? 0), 0)
}

export function sumFederal(tc: Record<TCKey, number>, s: Record<SKey, number>): number {
  return sumTc(tc) + SABRE_SPECIFIC_ITEMS.reduce((acc, { key }) => acc + (s[key] ?? 0), 0)
}

export function emptyTc(): Record<TCKey, number> {
  return {
    tc1: 1,
    tc2: 1,
    tc3: 1,
    tc4: 1,
    tc5: 1,
    tc6: 1,
    tc7: 1,
  }
}

export function emptyS(): Record<SKey, number> {
  return {
    s1: 1,
    s2: 1,
    s3: 1,
    s4: 1,
    s5: 1,
    s6: 1,
    s7: 1,
    s8: 1,
  }
}
