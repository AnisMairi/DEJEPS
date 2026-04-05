"use client";

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { EnhancedAthleteCard } from "@/components/athlete/enhanced-athlete-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Users, Plus, Filter } from "lucide-react"
import { RotateCcw } from "lucide-react";
import Link from "next/link"
import { useEffect, useState } from "react"

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [weaponFilter, setWeaponFilter] = useState("all-weapons");
  const [skillFilter, setSkillFilter] = useState("all-levels");
  const [ageFilter, setAgeFilter] = useState("all-ages");
  const [regionFilter, setRegionFilter] = useState("all-regions");
  // Reset filters handler
  const resetFilters = () => {
    setSearchTerm("");
    setWeaponFilter("all-weapons");
    setSkillFilter("all-levels");
    setAgeFilter("all-ages");
    setRegionFilter("all-regions");
  };

  useEffect(() => {
    // Mode démo : utiliser les données de démo au lieu de l'API
    const loadAthletes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Import dynamique pour éviter les erreurs de build
        const { DEMO_ATHLETES } = await import("@/lib/demo-athletes");
        setAthletes(DEMO_ATHLETES);
      } catch (err) {
        console.error('Error loading athletes:', err);
        setError("Échec du chargement des athlètes");
        setAthletes([]);
      } finally {
        setLoading(false);
      }
    };
    loadAthletes();
  }, []);

  // Helper to map API athlete to EnhancedAthleteCard props
  const mapAthlete = (athlete: any) => {
    // Calculate age from date_of_birth
    let age = 0;
    if (athlete.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(athlete.date_of_birth);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    return {
      id: String(athlete.id),
      firstName: athlete.first_name,
      lastName: athlete.last_name,
      age,
      gender: athlete.gender,
      weapon: athlete.weapon,
      skillLevel: athlete.skill_level,
      avatar: athlete.avatar_url || "https://placehold.co/200x200?text=Athlete",
      videosCount: athlete.videos_count || 0, // fallback if not present
      region: athlete.region || "",
      club: athlete.club || "",
      coach: athlete.coach || "",
      ranking: athlete.ranking || "-", // fallback if not present
      recentActivity: athlete.recent_activity || "-", // fallback if not present
    };
  };

  // Filtering logic
  const filteredAthletes = athletes.filter((athlete) => {
    // Search by name, club, region
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      athlete.first_name.toLowerCase().includes(search) ||
      athlete.last_name.toLowerCase().includes(search) ||
      (athlete.club && athlete.club.toLowerCase().includes(search)) ||
      (athlete.region && athlete.region.toLowerCase().includes(search));

    // Weapon filter (normalize weapon names)
    const normalizeWeapon = (weapon: string) => {
      if (weapon === "épée" || weapon === "epee") return "epee";
      return weapon;
    };
    const matchesWeapon =
      weaponFilter === "all-weapons" || normalizeWeapon(athlete.weapon) === normalizeWeapon(weaponFilter);

    // Skill filter
    const matchesSkill =
      skillFilter === "all-levels" || athlete.skill_level === skillFilter;

    // Age filter (implement logic for age ranges)
    let matchesAge = true;
    if (ageFilter !== "all-ages" && athlete.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(athlete.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (ageFilter === "6-10") matchesAge = age >= 6 && age <= 10;
      if (ageFilter === "11-14") matchesAge = age >= 11 && age <= 14;
      if (ageFilter === "15-18") matchesAge = age >= 15 && age <= 18;
      if (ageFilter === "19-25") matchesAge = age >= 19 && age <= 25;
    }

    // Region filter
    const matchesRegion =
      regionFilter === "all-regions" || (athlete.region && athlete.region.toLowerCase() === regionFilter.toLowerCase());

    return matchesSearch && matchesWeapon && matchesSkill && matchesAge && matchesRegion;
  });

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Athlètes</h1>
            </div>
            <Button asChild>
              <Link href="/athletes/create">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un athlète
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtrer les athlètes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="relative min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher des athlètes..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                <Select value={weaponFilter} onValueChange={setWeaponFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Arme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-weapons">Toutes les armes</SelectItem>
                    <SelectItem value="foil">Fleuret</SelectItem>
                    <SelectItem value="sabre">Sabre</SelectItem>
                    <SelectItem value="epee">Épée</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-levels">Tous les niveaux</SelectItem>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                    <SelectItem value="elite">Élite</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tranche d'âge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-ages">Tous les âges</SelectItem>
                    <SelectItem value="6-10">6-10 ans</SelectItem>
                    <SelectItem value="11-14">11-14 ans</SelectItem>
                    <SelectItem value="15-18">15-18 ans</SelectItem>
                    <SelectItem value="19-25">19-25 ans</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-regions">Toutes les régions</SelectItem>
                    <SelectItem value="Île-de-France">Île-de-France</SelectItem>
                    <SelectItem value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</SelectItem>
                    <SelectItem value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</SelectItem>
                    <SelectItem value="Occitanie">Occitanie</SelectItem>
                    <SelectItem value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</SelectItem>
                    <SelectItem value="Hauts-de-France">Hauts-de-France</SelectItem>
                    <SelectItem value="Grand Est">Grand Est</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={resetFilters} className="h-10 w-[140px]" type="button">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Athletes Grid */}
          {loading ? (
            <div className="text-center py-10">Chargement des athlètes...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error === "Failed to load athletes" ? "Échec du chargement des athlètes" : error}</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAthletes.map((athlete) => (
                <EnhancedAthleteCard key={athlete.id} athlete={mapAthlete(athlete)} />
              ))}
            </div>
          )}

          {/* Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Statistiques de la plateforme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{athletes.length}</div>
                  <div className="text-sm text-muted-foreground">Nombre total d'athlètes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {athletes.reduce((sum, athlete) => sum + (athlete.videos_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Nombre total de vidéos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {new Set(athletes.map((athlete) => athlete.club)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Clubs représentés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {new Set(athletes.map((athlete) => athlete.region)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Régions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
