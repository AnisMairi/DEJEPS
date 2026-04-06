// Tests physiques — stage juillet / Toussaint (mode démo)

import type { DemoAthlete } from "@/lib/demo-athletes"

const STORAGE_KEY = "sabre_demo_physical_tests_v1"

export type AgeCategory = "M13" | "M15"
export type Sex = "male" | "female"

export interface PhysicalSessionResults {
  sfcodtSeconds: number | null
  cmjCm: number | null
  yoyoMeters: number | null
  sprint10Seconds: number | null
}

export interface AthletePhysicalRecord {
  athleteId: string
  session1: PhysicalSessionResults | null
  session2: PhysicalSessionResults | null
}

export type PerformanceZone = "excellent" | "bon" | "moyen" | "developper"

function zoneFromScore100(n: number): PerformanceZone {
  if (n >= 85) return "excellent"
  if (n >= 65) return "bon"
  if (n >= 45) return "moyen"
  return "developper"
}

/** Catégorie d'âge projet Sabre Talent (M13 / M15) à partir de la date de naissance */
export function getAgeCategoryFromBirthDate(dateOfBirth: string): AgeCategory {
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age <= 13 ? "M13" : "M15"
}

/** Barèmes : retourne une valeur 0–100 pour le radar (plus haut = meilleure performance) */
export function rawToRadarScore(
  test: "sfcodt" | "cmj" | "yoyo" | "sprint10",
  value: number,
  age: AgeCategory,
  sex: Sex
): number {
  if (test === "sfcodt") return scoreSfcodt(value, age, sex)
  if (test === "cmj") return scoreCmj(value, age, sex)
  if (test === "yoyo") return scoreYoyo(value, age, sex)
  return scoreSprint(value, age, sex)
}

function scoreSfcodt(seconds: number, age: AgeCategory, sex: Sex): number {
  // plus bas = mieux — on inverse
  const tables: Record<AgeCategory, Record<Sex, { exc: number; bon: [number, number]; moy: [number, number]; dev: number }>> = {
    M13: {
      male: { exc: 7.5, bon: [7.5, 8.49], moy: [8.5, 8.99], dev: 9.0 },
      female: { exc: 7.8, bon: [7.8, 8.79], moy: [8.8, 9.29], dev: 9.3 },
    },
    M15: {
      male: { exc: 7.2, bon: [7.2, 8.19], moy: [8.2, 8.69], dev: 8.7 },
      female: { exc: 7.5, bon: [7.5, 8.49], moy: [8.5, 8.99], dev: 9.0 },
    },
  }
  const t = tables[age][sex]
  if (seconds < t.exc) return 95
  if (seconds <= t.bon[1]) return 75
  if (seconds <= t.moy[1]) return 55
  if (seconds <= t.dev + 0.5) return 35
  return 20
}

function scoreCmj(cm: number, age: AgeCategory, sex: Sex): number {
  const tables: Record<AgeCategory, Record<Sex, { exc: number; bon: [number, number]; moy: [number, number]; dev: number }>> = {
    M13: {
      male: { exc: 35, bon: [25, 35], moy: [20, 24], dev: 20 },
      female: { exc: 30, bon: [22, 30], moy: [18, 21], dev: 18 },
    },
    M15: {
      male: { exc: 40, bon: [30, 40], moy: [25, 29], dev: 25 },
      female: { exc: 33, bon: [25, 33], moy: [21, 24], dev: 21 },
    },
  }
  const t = tables[age][sex]
  if (cm > t.exc) return 95
  if (cm >= t.bon[0]) return 75
  if (cm >= t.moy[0]) return 55
  return 30
}

function scoreYoyo(meters: number, age: AgeCategory, sex: Sex): number {
  const tables: Record<AgeCategory, Record<Sex, { exc: number; bon: [number, number]; moy: [number, number]; dev: number }>> = {
    M13: {
      male: { exc: 1600, bon: [1040, 1600], moy: [760, 1000], dev: 760 },
      female: { exc: 1200, bon: [800, 1200], moy: [600, 760], dev: 600 },
    },
    M15: {
      male: { exc: 1920, bon: [1280, 1920], moy: [960, 1240], dev: 960 },
      female: { exc: 1440, bon: [1000, 1440], moy: [760, 960], dev: 760 },
    },
  }
  const t = tables[age][sex]
  if (meters > t.exc) return 95
  if (meters >= t.bon[0]) return 75
  if (meters >= t.moy[0]) return 55
  return 30
}

function scoreSprint(seconds: number, age: AgeCategory, sex: Sex): number {
  const tables: Record<AgeCategory, Record<Sex, { exc: number; bon: [number, number]; moy: [number, number]; dev: number }>> = {
    M13: {
      male: { exc: 1.85, bon: [1.85, 1.95], moy: [1.95, 2.1], dev: 2.1 },
      female: { exc: 1.95, bon: [1.95, 2.05], moy: [2.05, 2.2], dev: 2.2 },
    },
    M15: {
      male: { exc: 1.75, bon: [1.75, 1.85], moy: [1.85, 2.0], dev: 2.0 },
      female: { exc: 1.85, bon: [1.85, 1.95], moy: [1.95, 2.1], dev: 2.1 },
    },
  }
  const t = tables[age][sex]
  if (seconds < t.exc) return 95
  if (seconds <= t.bon[1]) return 75
  if (seconds <= t.moy[1]) return 55
  return 30
}

export function getPerformanceLabelForTest(
  test: "sfcodt" | "cmj" | "yoyo" | "sprint10",
  value: number,
  athlete: Pick<DemoAthlete, "date_of_birth" | "gender">
): { zone: PerformanceZone; label: string } {
  const age = getAgeCategoryFromBirthDate(athlete.date_of_birth)
  const sex = athlete.gender
  const score = rawToRadarScore(test, value, age, sex)
  const zone = zoneFromScore100(score)
  const labels: Record<PerformanceZone, string> = {
    excellent: "Excellent",
    bon: "Bon",
    moyen: "Moyen",
    developper: "À développer",
  }
  return { zone, label: labels[zone] }
}

export function getPhysicalRecord(athleteId: string): AthletePhysicalRecord {
  if (typeof window === "undefined") {
    return { athleteId, session1: null, session2: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { athleteId, session1: null, session2: null }
    const all = JSON.parse(raw) as AthletePhysicalRecord[]
    const found = all.find((a) => a.athleteId === athleteId)
    return found ?? { athleteId, session1: null, session2: null }
  } catch {
    return { athleteId, session1: null, session2: null }
  }
}

export function savePhysicalRecord(record: AthletePhysicalRecord): void {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all: AthletePhysicalRecord[] = raw ? JSON.parse(raw) : []
    const idx = all.findIndex((a) => a.athleteId === record.athleteId)
    if (idx >= 0) all[idx] = record
    else all.push(record)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

export function buildRadarChartData(
  athlete: Pick<DemoAthlete, "id" | "date_of_birth" | "gender">
): { subject: string; juillet: number | null; toussaint: number | null }[] {
  const rec = getPhysicalRecord(athlete.id)
  const age = getAgeCategoryFromBirthDate(athlete.date_of_birth)
  const sex = athlete.gender
  const axes: { key: keyof PhysicalSessionResults; label: string; test: "sfcodt" | "cmj" | "yoyo" | "sprint10" }[] = [
    { key: "sfcodtSeconds", label: "SFCODT", test: "sfcodt" },
    { key: "cmjCm", label: "CMJ", test: "cmj" },
    { key: "yoyoMeters", label: "Yo-Yo IR1", test: "yoyo" },
    { key: "sprint10Seconds", label: "Sprint 10 m", test: "sprint10" },
  ]
  return axes.map(({ key, label, test }) => {
    const v1 = rec.session1?.[key]
    const v2 = rec.session2?.[key]
    return {
      subject: label,
      juillet: v1 != null && !Number.isNaN(v1) ? rawToRadarScore(test, v1 as number, age, sex) : null,
      toussaint: v2 != null && !Number.isNaN(v2) ? rawToRadarScore(test, v2 as number, age, sex) : null,
    }
  })
}
