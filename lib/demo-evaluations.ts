// Gestion des évaluations en mode démo - Stockage localStorage

export interface DemoEvaluation {
  id: string
  athleteId: string
  evaluatorName: string
  evaluatorRole: string
  createdAt: string
  // Métadonnées athlète
  lastName: string
  firstName: string
  club: string
  regionalCommittee: string
  birthDate: string
  armedArm: string
  natRankU15: string
  // Domaines d'évaluation (Likert 4)
  physique: number
  technique: number
  garde: number
  motivation: number
  main: number
  mobilite: number
  cognitif: number
  // Bilan et potentiel
  bilan: string
  potential: string
  // Score calculé
  globalScore: number
  scoreLabel: string
}

const STORAGE_KEY = "demo_evaluations"

export function saveEvaluation(evaluation: Omit<DemoEvaluation, "id" | "createdAt">): DemoEvaluation {
  const evaluations = getEvaluations()
  const newEvaluation: DemoEvaluation = {
    ...evaluation,
    id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  
  evaluations.push(newEvaluation)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations))
  
  return newEvaluation
}

export function getEvaluations(): DemoEvaluation[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading evaluations from localStorage:", error)
    return []
  }
}

export function getEvaluationsByAthleteId(athleteId: string): DemoEvaluation[] {
  const evaluations = getEvaluations()
  return evaluations.filter(evaluation => evaluation.athleteId === athleteId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function deleteEvaluation(evaluationId: string): void {
  const evaluations = getEvaluations()
  const filtered = evaluations.filter(evaluation => evaluation.id !== evaluationId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

