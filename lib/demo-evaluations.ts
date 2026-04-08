// Évaluations Sabre Talent — stockage localStorage (mode démo)

import type { SKey, TCKey } from "@/lib/sabre-evaluation-constants"
import {
  DISCORDANCE_THRESHOLD,
  SABRE_SPECIFIC_ITEMS,
  TRONC_COMMUN_ITEMS,
  sumFederal,
  sumTc,
} from "@/lib/sabre-evaluation-constants"

function medianScores(scores: number[]): number {
  const s = [...scores].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2
}

const STORAGE_KEY = "sabre_demo_evaluations_v1"

export type EvaluationKind = "ma_pre" | "federal"

/** Statut affiché dans le panel (ligne d'évaluation) */
export type PanelEvaluationStatus =
  | "EN_ATTENTE_DE_VALIDATION"
  | "EN_ATTENTE_2E_LECTURE_FÉDÉRALE"
  | "VALIDÉE"
  | "DISCORDANCE"
  | "DISCORDANCE_RESOLUE"

export interface DemoEvaluation {
  id: string
  createdAt: string
  kind: EvaluationKind
  athleteId: string
  /** Obligatoire pour enchaînement MA → fédéral */
  videoId: string
  evaluatorName: string
  evaluatorRole: string
  evaluatorUserId?: string

  tc: Record<TCKey, number>
  /** Présent seulement si kind === "federal" */
  s?: Record<SKey, number>
  observations: string

  totalScore: number
}

/** Legacy (ancienne grille domaines) — ignorée si présente dans le même storage */
export interface LegacyDemoEvaluation {
  id: string
  athleteId: string
  physique?: number
  globalScore?: number
  kind?: never
}

function isLegacy(e: unknown): e is LegacyDemoEvaluation {
  return (
    typeof e === "object" &&
    e !== null &&
    "physique" in e &&
    !("kind" in e && (e as DemoEvaluation).kind)
  )
}

export function saveEvaluation(
  evaluation: Omit<DemoEvaluation, "id" | "createdAt" | "totalScore"> & { totalScore?: number }
): DemoEvaluation {
  const evaluations = getEvaluationsRaw()
  let totalScore = evaluation.totalScore
  if (totalScore === undefined) {
    if (evaluation.kind === "ma_pre") {
      totalScore = sumTc(evaluation.tc)
    } else {
      totalScore = sumFederal(evaluation.tc, evaluation.s ?? ({} as Record<SKey, number>))
    }
  }
  const newEvaluation: DemoEvaluation = {
    ...evaluation,
    totalScore,
    id: `eval_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    createdAt: new Date().toISOString(),
  }
  evaluations.push(newEvaluation)
  persist(evaluations)
  return newEvaluation
}

function persist(list: DemoEvaluation[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function getEvaluationsRaw(): DemoEvaluation[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((e): e is DemoEvaluation => {
      if (isLegacy(e)) return false
      return typeof e === "object" && e !== null && "kind" in e && (e as DemoEvaluation).kind
    })
  } catch {
    return []
  }
}

export function getEvaluations(): DemoEvaluation[] {
  return getEvaluationsRaw()
}

export function getEvaluationsByAthleteId(athleteId: string): DemoEvaluation[] {
  return getEvaluations()
    .filter((e) => e.athleteId === athleteId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function deleteEvaluation(evaluationId: string): void {
  const filtered = getEvaluationsRaw().filter((e) => e.id !== evaluationId)
  persist(filtered)
}

export function getFederalEvaluationsForAthlete(athleteId: string, videoId?: string): DemoEvaluation[] {
  return getEvaluations()
    .filter((e) => e.kind === "federal" && e.athleteId === athleteId && (videoId === undefined || e.videoId === videoId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

/**
 * Statut agrégé pour une vidéo (toutes lectures fédérales /60).
 * On ne compare jamais la pré-éval MA (/28) aux notes fédérales.
 */
export function getFederalAggregateStatus(athleteId: string, videoId: string): PanelEvaluationStatus {
  const federal = getFederalEvaluationsForAthlete(athleteId, videoId)
  const scores = federal.map((x) => x.totalScore)
  if (scores.length === 0) return "VALIDÉE"
  if (scores.length === 1) return "EN_ATTENTE_2E_LECTURE_FÉDÉRALE"
  if (scores.length === 2) {
    const diff = Math.abs(scores[0] - scores[1])
    return diff > DISCORDANCE_THRESHOLD ? "DISCORDANCE" : "VALIDÉE"
  }
  const diff12 = Math.abs(scores[0] - scores[1])
  if (diff12 > DISCORDANCE_THRESHOLD) return "DISCORDANCE_RESOLUE"
  return "VALIDÉE"
}

/**
 * Note finale fédérale : moyenne des 2 si écart ≤ 6 ; si discordance, médiane des 3 après 3e lecture.
 */
export function getFederalFinalScore(athleteId: string, videoId: string): number | null {
  const federal = getFederalEvaluationsForAthlete(athleteId, videoId)
  const scores = federal.map((x) => x.totalScore)
  if (scores.length < 2) return null
  if (scores.length === 2) {
    const diff = Math.abs(scores[0] - scores[1])
    if (diff > DISCORDANCE_THRESHOLD) return null
    return (scores[0] + scores[1]) / 2
  }
  const diff12 = Math.abs(scores[0] - scores[1])
  if (diff12 > DISCORDANCE_THRESHOLD) return medianScores(scores)
  return (scores[0] + scores[1]) / 2
}

/**
 * Retourne le statut d'affichage pour une ligne d'évaluation.
 * La discordance ne compare que les scores fédéraux /60 entre eux.
 */
export function getPanelStatusForEvaluation(e: DemoEvaluation, _all: DemoEvaluation[]): PanelEvaluationStatus {
  if (e.kind === "ma_pre") {
    return "EN_ATTENTE_DE_VALIDATION"
  }
  return getFederalAggregateStatus(e.athleteId, e.videoId)
}

export function getFederalMedianScore(athleteId: string, videoId: string): number | null {
  const federal = getFederalEvaluationsForAthlete(athleteId, videoId)
  const scores = federal.map((x) => x.totalScore)
  if (scores.length === 0) return null
  return medianScores(scores)
}

export function assertCompleteTc(tc: Record<TCKey, number>): boolean {
  return TRONC_COMMUN_ITEMS.every(({ key }) => tc[key] >= 1 && tc[key] <= 4)
}

export function assertCompleteFederal(tc: Record<TCKey, number>, s: Record<SKey, number>): boolean {
  return (
    assertCompleteTc(tc) &&
    SABRE_SPECIFIC_ITEMS.every(({ key }) => s[key] >= 1 && s[key] <= 4)
  )
}
