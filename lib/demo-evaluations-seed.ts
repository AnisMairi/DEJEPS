// Graine de démo Sabre Talent — pré-évaluations MA + cas discordance fédérale

import type { DemoEvaluation } from "./demo-evaluations"
import type { SKey, TCKey } from "./sabre-evaluation-constants"
import { sumFederal } from "./sabre-evaluation-constants"

const SEED_FLAG = "sabre_demo_evaluations_seeded_v1"

/** Total 42/60 : 11×3 + 4×4 = 49 — adjust: 42 = 18 tc + 24 s from earlier plan */
function buildFederal42(): { tc: Record<TCKey, number>; s: Record<SKey, number> } {
  const tc: Record<TCKey, number> = {
    tc1: 2,
    tc2: 2,
    tc3: 2,
    tc4: 3,
    tc5: 3,
    tc6: 3,
    tc7: 3,
  }
  const s: Record<SKey, number> = {
    s1: 3,
    s2: 3,
    s3: 3,
    s4: 3,
    s5: 3,
    s6: 3,
    s7: 3,
    s8: 3,
  }
  return { tc, s }
}

/** Total 49/60 : 11×3 + 4×4 = 49 */
function buildFederal49(): { tc: Record<TCKey, number>; s: Record<SKey, number> } {
  const tc: Record<TCKey, number> = {
    tc1: 4,
    tc2: 4,
    tc3: 4,
    tc4: 4,
    tc5: 3,
    tc6: 3,
    tc7: 3,
  }
  const s: Record<SKey, number> = {
    s1: 3,
    s2: 3,
    s3: 3,
    s4: 3,
    s5: 3,
    s6: 3,
    s7: 3,
    s8: 3,
  }
  return { tc, s }
}

function sumCheck(tc: Record<TCKey, number>, s: Record<SKey, number>): number {
  return sumFederal(tc, s)
}

export async function seedDemoEvaluations(): Promise<void> {
  if (typeof window === "undefined") return
  if (localStorage.getItem(SEED_FLAG)) return

  const { saveEvaluation, getEvaluations } = await import("./demo-evaluations")

  const maTc = (vals: number[]): Record<TCKey, number> => ({
    tc1: vals[0],
    tc2: vals[1],
    tc3: vals[2],
    tc4: vals[3],
    tc5: vals[4],
    tc6: vals[5],
    tc7: vals[6],
  })

  const seeds: Omit<DemoEvaluation, "id" | "createdAt">[] = [
    {
      kind: "ma_pre",
      athleteId: "1",
      videoId: "1",
      evaluatorName: "Contact Local",
      evaluatorRole: "local_contact",
      tc: maTc([3, 3, 3, 3, 3, 3, 3]),
      observations: "Bonne explosivité, à confirmer en compétition nationale.",
    },
    {
      kind: "ma_pre",
      athleteId: "2",
      videoId: "2",
      evaluatorName: "Contact Local",
      evaluatorRole: "local_contact",
      tc: maTc([4, 3, 4, 3, 4, 4, 3]),
      observations: "Très régulière, lecture de jeu au-dessus de la moyenne.",
    },
  ]

  const f42 = buildFederal42()
  const f49 = buildFederal49()
  // Verify sums (dev sanity)
  if (sumCheck(f42.tc, f42.s) !== 42 || sumCheck(f49.tc, f49.s) !== 49) {
    console.warn("Seed federal scores mismatch", sumCheck(f42.tc, f42.s), sumCheck(f49.tc, f49.s))
  }

  seeds.push(
    {
      kind: "federal",
      athleteId: "1",
      videoId: "1",
      evaluatorName: "Commission — Lecteur A",
      evaluatorRole: "federal_evaluator",
      tc: f42.tc,
      s: f42.s,
      observations: "Lecture 1 (démo discordance).",
    },
    {
      kind: "federal",
      athleteId: "1",
      videoId: "1",
      evaluatorName: "Commission — Lecteur B",
      evaluatorRole: "federal_evaluator",
      tc: f49.tc,
      s: f49.s,
      observations: "Lecture 2 (démo discordance).",
    }
  )

  const existing = getEvaluations()
  if (existing.length > 0) {
    localStorage.setItem(SEED_FLAG, "1")
    return
  }

  seeds.forEach((row) => saveEvaluation(row))
  localStorage.setItem(SEED_FLAG, "1")
}
