export type FencingAgeCategory = "M9" | "M11" | "M13" | "M15" | "M17" | "M20" | "Senior"

function toValidDate(dateLike: string | Date): Date | null {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike
  return isNaN(d.getTime()) ? null : d
}

/**
 * Âge révolu à une date donnée (par défaut: aujourd'hui).
 * Simple et stable, suffisant pour les règles business de cohérence.
 */
export function computeAge(dateOfBirth: string, asOf: Date = new Date()): number | null {
  const birthDate = toValidDate(dateOfBirth)
  if (!birthDate) return null
  const today = asOf

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
  return Math.max(0, age)
}

/**
 * Catégories (approx. FFE) par âge révolu.
 * Objectif: cohérence simple (ex: 16 ans ≠ M15).
 */
export function fencingCategoryFromAge(age: number): FencingAgeCategory {
  if (age <= 10) return "M9"
  if (age <= 12) return "M11"
  if (age <= 14) return "M13"
  if (age <= 16) return "M15"
  if (age <= 18) return "M17"
  if (age <= 20) return "M20"
  return "Senior"
}

export function fencingCategoryFromDob(dateOfBirth: string, asOf: Date = new Date()): FencingAgeCategory | null {
  const age = computeAge(dateOfBirth, asOf)
  if (age === null) return null
  return fencingCategoryFromAge(age)
}

export function isCategoryConsistentWithDob(
  dateOfBirth: string,
  category: string | null | undefined,
  asOf: Date = new Date()
): boolean {
  if (!category) return true
  const expected = fencingCategoryFromDob(dateOfBirth, asOf)
  if (!expected) return true
  return category === expected
}

/**
 * Sabre Talent — évaluation fédérale en aveugle : seules M13 et M15 sont affichées au lecteur.
 * (Découpage simple : ≤ 14 ans → M13, sinon → M15.)
 */
export function sabreTalentFederalBlindCategory(dateOfBirth: string, asOf: Date = new Date()): "M13" | "M15" {
  const age = computeAge(dateOfBirth, asOf)
  if (age === null) return "M13"
  return age <= 14 ? "M13" : "M15"
}

