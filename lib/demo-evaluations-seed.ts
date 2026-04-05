// Évaluations de démo pré-remplies pour plusieurs athlètes
// Ce fichier peut être utilisé pour initialiser des évaluations de démo

import { DemoEvaluation } from "./demo-evaluations"

export const SEED_EVALUATIONS: Omit<DemoEvaluation, "id" | "createdAt">[] = [
  // Évaluation pour Emma Dubois (ID: 2)
  {
    athleteId: "2",
    evaluatorName: "Marie Laurent",
    evaluatorRole: "coach",
    lastName: "Dubois",
    firstName: "Emma",
    club: "AS Escrime Lyon",
    regionalCommittee: "Auvergne-Rhône-Alpes",
    birthDate: "2008-08-22",
    armedArm: "Droitier",
    natRankU15: "3",
    physique: 4,
    technique: 4,
    garde: 3,
    motivation: 4,
    main: 4,
    mobilite: 3,
    cognitif: 4,
    bilan: "Athlète exceptionnelle avec un potentiel très élevé. Technique impeccable, excellente compréhension tactique et détermination remarquable. À suivre de très près pour les sélections nationales.",
    potential: "Fort potentiel",
    globalScore: 87.5, // (4+4+3+4+4+3+4)/7 * 25
    scoreLabel: "Talent détecté",
  },
  // Évaluation pour Thomas Bernard (ID: 3)
  {
    athleteId: "3",
    evaluatorName: "Pierre Moreau",
    evaluatorRole: "coach",
    lastName: "Bernard",
    firstName: "Thomas",
    club: "Cercle d'Escrime Marseille",
    regionalCommittee: "Provence-Alpes-Côte d'Azur",
    birthDate: "2006-03-10",
    armedArm: "Droitier",
    natRankU15: "8",
    physique: 3,
    technique: 3,
    garde: 3,
    motivation: 4,
    main: 3,
    mobilite: 3,
    cognitif: 3,
    bilan: "Jeune athlète prometteur avec de bonnes bases techniques. Motivation et détermination au-dessus de la moyenne. Nécessite un travail supplémentaire sur la mobilité et la vitesse d'exécution.",
    potential: "Potentiel intéressant",
    globalScore: 75.0, // (3+3+3+4+3+3+3)/7 * 25
    scoreLabel: "Prometteur",
  },
  // Évaluation pour Hugo Moreau (ID: 5)
  {
    athleteId: "5",
    evaluatorName: "Antoine Martin",
    evaluatorRole: "coach",
    lastName: "Moreau",
    firstName: "Hugo",
    club: "Cercle d'Escrime Bordeaux",
    regionalCommittee: "Nouvelle-Aquitaine",
    birthDate: "2008-07-18",
    armedArm: "Droitier",
    natRankU15: "12",
    physique: 3,
    technique: 3,
    garde: 2,
    motivation: 3,
    main: 3,
    mobilite: 2,
    cognitif: 3,
    bilan: "Athlète en développement avec des bases solides. Posture et mobilité à améliorer. Bonne compréhension tactique mais manque encore de fluidité dans l'exécution.",
    potential: "Potentiel intéressant",
    globalScore: 60.7, // (3+3+2+3+3+2+3)/7 * 25
    scoreLabel: "Prometteur",
  },
  // Évaluation pour Léa Petit (ID: 6)
  {
    athleteId: "6",
    evaluatorName: "Sophie Bernard",
    evaluatorRole: "coach",
    lastName: "Petit",
    firstName: "Léa",
    club: "AS Escrime Toulouse",
    regionalCommittee: "Occitanie",
    birthDate: "2005-12-03",
    armedArm: "Gaucher",
    natRankU15: "2",
    physique: 4,
    technique: 4,
    garde: 4,
    motivation: 4,
    main: 4,
    mobilite: 4,
    cognitif: 4,
    bilan: "Talent exceptionnel, l'une des meilleures de sa génération. Technique parfaite, excellente condition physique et intelligence tactique remarquable. Candidate idéale pour les compétitions internationales.",
    potential: "Fort potentiel",
    globalScore: 100.0, // (4+4+4+4+4+4+4)/7 * 25
    scoreLabel: "Talent détecté",
  },
  // Évaluation pour Nicolas Fournier (ID: 11)
  {
    athleteId: "11",
    evaluatorName: "Antoine Martin",
    evaluatorRole: "coach",
    lastName: "Fournier",
    firstName: "Nicolas",
    club: "Cercle d'Escrime Bordeaux",
    regionalCommittee: "Nouvelle-Aquitaine",
    birthDate: "2008-10-08",
    armedArm: "Droitier",
    natRankU15: "14",
    physique: 2,
    technique: 3,
    garde: 2,
    motivation: 3,
    main: 3,
    mobilite: 2,
    cognitif: 3,
    bilan: "Jeune athlète avec des qualités techniques correctes mais nécessitant un travail important sur la condition physique et la mobilité. Motivation présente, à encourager.",
    potential: "Potentiel encore à déterminer",
    globalScore: 53.6, // (2+3+2+3+3+2+3)/7 * 25
    scoreLabel: "À suivre",
  },
  // Évaluation pour Manon Girard (ID: 12)
  {
    athleteId: "12",
    evaluatorName: "Pierre Moreau",
    evaluatorRole: "coach",
    lastName: "Girard",
    firstName: "Manon",
    club: "Cercle d'Escrime Marseille",
    regionalCommittee: "Provence-Alpes-Côte d'Azur",
    birthDate: "2006-01-20",
    armedArm: "Droitier",
    natRankU15: "5",
    physique: 4,
    technique: 4,
    garde: 3,
    motivation: 4,
    main: 4,
    mobilite: 3,
    cognitif: 4,
    bilan: "Excellente athlète avec un très bon niveau technique et tactique. Condition physique au top, détermination exemplaire. Quelques ajustements à faire sur la posture en garde.",
    potential: "Fort potentiel",
    globalScore: 82.1, // (4+4+3+4+4+3+4)/7 * 25
    scoreLabel: "Talent détecté",
  },
]

// Fonction pour initialiser les évaluations de démo (à appeler une fois)
export async function seedDemoEvaluations(): Promise<void> {
  if (typeof window === "undefined") return
  
  const { getEvaluations, saveEvaluation } = await import("./demo-evaluations")
  const existingEvaluations = getEvaluations()
  
  // Vérifier quelles évaluations existent déjà
  const existingAthleteIds = new Set(existingEvaluations.map((e: DemoEvaluation) => e.athleteId))
  
  // Ajouter seulement les évaluations qui n'existent pas encore
  SEED_EVALUATIONS.forEach((seedEval) => {
    if (!existingAthleteIds.has(seedEval.athleteId)) {
      saveEvaluation(seedEval)
    }
  })
}

