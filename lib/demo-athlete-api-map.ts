/**
 * Mappe un athlète de démo vers la forme attendue par les hooks API (sans backend).
 */
import type { DemoAthlete } from "@/lib/demo-athletes"
import type { Athlete, AthleteList } from "@/hooks/use-athlete-api"

function weaponToApi(w: DemoAthlete["weapon"]): Athlete["weapon"] {
  if (w === "epee" || w === "épée") return "épée"
  if (w === "foil") return "foil"
  return "sabre"
}

export function demoAthleteToApiAthlete(d: DemoAthlete): Athlete {
  return {
    id: Number(d.id),
    first_name: d.first_name,
    last_name: d.last_name,
    date_of_birth: d.date_of_birth,
    gender: d.gender,
    email: `${d.first_name.toLowerCase()}.${d.last_name.toLowerCase()}@example.com`,
    weapon: weaponToApi(d.weapon),
    skill_level: d.skill_level,
    club: d.club,
    coach: d.coach,
    region: "other",
    created_at: new Date().toISOString(),
    avatar_url: d.avatar_url,
  }
}

export function demoAthletesToApiList(athletes: DemoAthlete[]): AthleteList[] {
  return athletes.map((d) => ({
    id: Number(d.id),
    first_name: d.first_name,
    last_name: d.last_name,
    date_of_birth: d.date_of_birth,
    gender: d.gender,
    weapon: weaponToApi(d.weapon),
    skill_level: d.skill_level,
    club: d.club,
    region: "other",
    created_at: new Date().toISOString(),
    avatar_url: d.avatar_url,
  }))
}
