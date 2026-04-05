import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const COMPETITION_GROUPS = [
  {
    level: "Local",
    competitions: [
      "Compétition locale",
      "Match amical",
      "Challenge club",
      "Interclubs"
    ]
  },
  {
    level: "Departmental",
    competitions: [
      "Compétition départementale",
      "Championnat départemental"
    ]
  },
  {
    level: "Regional",
    competitions: [
      "Compétition régionale",
      "Championnat régional",
      "Circuit régional",
      "Tournoi de zone"
    ]
  },
  {
    level: "National (France)",
    competitions: [
      "Circuit national M15",
      "Circuit national Cadets",
      "Circuit national Juniors",
      "Circuit national Seniors",
      "Circuit national Vétérans",
      "Championnat de France M15",
      "Championnat de France Cadets",
      "Championnat de France Juniors",
      "Championnat de France Seniors",
      "Championnat de France Vétérans",
      "Coupe de France (par équipes)",
      "Fête des Jeunes",
      "Sélection nationale"
    ]
  },
  {
    level: "European (EFC)",
    competitions: [
      "Championnat d'Europe Cadets",
      "Championnat d'Europe Juniors",
      "Championnat d'Europe Seniors",
      "Championnat d'Europe Vétérans",
      "Circuit Européen U14",
      "Circuit Européen Cadets (U17)",
      "Coupe d’Europe des clubs",
      "Jeux Européens"
    ]
  },
  {
    level: "International (FIE)",
    competitions: [
      "Épreuve satellite",
      "Coupe du Monde Cadets",
      "Coupe du Monde Juniors",
      "Coupe du Monde Seniors",
      "Grand Prix FIE",
      "Championnat du Monde Cadets",
      "Championnat du Monde Juniors",
      "Championnat du Monde Seniors",
      "Championnat du Monde Vétérans",
      "Jeux Olympiques"
    ]
  }
];
