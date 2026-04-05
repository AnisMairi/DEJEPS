"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AthleteCard } from "./athlete-card"
import { Search, Users, Plus, X } from "lucide-react"
import Link from "next/link"
import { RotateCcw } from "lucide-react";

export function AthleteNavigation() {
  const defaultFilters = {
    search: "",
    weapon: "all",
    skill: "all",
    region: "all",
    gender: "all",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const athletesPerPage = 6;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Mock athlete data
  const AllAthletes = [
    {
      id: "1",
      firstName: "Marie",
      lastName: "Dubois",
      age: 16,
      gender: "female",
      weapon: "épée",
      skillLevel: "advanced",
      avatar: "https://placehold.co/64x64?text=MD",
      videosCount: 12,
      region: "Paris, France",
    },
    {
      id: "2",
      firstName: "Jean",
      lastName: "Martin",
      age: 14,
      gender: "male",
      weapon: "foil",
      skillLevel: "intermediate",
      avatar: "https://placehold.co/64x64?text=JM",
      videosCount: 8,
      region: "Lyon, France",
    },
    {
      id: "3",
      firstName: "Sophie",
      lastName: "Laurent",
      age: 17,
      gender: "female",
      weapon: "sabre",
      skillLevel: "advanced",
      avatar: "https://placehold.co/64x64?text=SL",
      videosCount: 15,
      region: "Marseille, France",
    },
    {
      id: "4",
      firstName: "Lucas",
      lastName: "Bernard",
      age: 13,
      gender: "male",
      weapon: "foil",
      skillLevel: "beginner",
      avatar: "https://placehold.co/64x64?text=LB",
      videosCount: 5,
      region: "Nice, France",
    },
  ];

  // Get unique regions for filter dropdown
  const uniqueRegions = useMemo(() => {
    const regions = AllAthletes.map((a) => a.region).filter(Boolean);
    return ["all", ...Array.from(new Set(regions))];
  }, [AllAthletes]);

  // Enhanced filter logic
  const filteredAthletes = AllAthletes.filter((athlete) => {
    const search = filters.search.trim().toLowerCase();
    const matchesSearch =
      athlete.firstName.toLowerCase().includes(search) ||
      athlete.lastName.toLowerCase().includes(search) ||
      (athlete.region && athlete.region.toLowerCase().includes(search));
    const matchesWeapon = filters.weapon === "all" || athlete.weapon.toLowerCase() === filters.weapon.toLowerCase();
    const matchesSkill = filters.skill === "all" || athlete.skillLevel.toLowerCase() === filters.skill.toLowerCase();
    const matchesRegion = filters.region === "all" || (athlete.region && athlete.region.toLowerCase() === filters.region.toLowerCase());
    const matchesGender = filters.gender === "all" || (athlete.gender && athlete.gender.toLowerCase() === filters.gender.toLowerCase());
    return matchesSearch && matchesWeapon && matchesSkill && matchesRegion && matchesGender;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAthletes.length / athletesPerPage);
  const paginatedAthletes = filteredAthletes.slice(
    (currentPage - 1) * athletesPerPage,
    currentPage * athletesPerPage
  );

  // Clear filters handler
  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchInput("");
  };
  const handleFilterChange = (key: keyof typeof defaultFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "search") setSearchInput(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Athletes ({filteredAthletes.length})
          </CardTitle>
          <Button size="sm" asChild>
            <Link href="/athletes/create">
              <Plus className="h-4 w-4 mr-1" />
              Add Athlete
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex gap-2 flex-wrap mb-2 items-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search athletes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.weapon} onValueChange={val => handleFilterChange("weapon", val)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Weapon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="foil">Foil</SelectItem>
              <SelectItem value="sabre">Sabre</SelectItem>
              <SelectItem value="épée">Épée</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.skill} onValueChange={val => handleFilterChange("skill", val)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.region} onValueChange={val => handleFilterChange("region", val)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {uniqueRegions.map((region) => (
                <SelectItem key={region} value={region}>{region === "all" ? "All Regions" : region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.gender} onValueChange={val => handleFilterChange("gender", val)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full justify-end mb-4">
          <Button variant="outline" onClick={clearFilters} className="min-w-[140px]">
            <RotateCcw className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        </div>
        {/* Show active filters as badges */}
        <div className="mb-2 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground mr-2">Active Filters:</span>
          {filters.weapon !== "all" && (
            <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1">
              Weapon: {filters.weapon}
              <button
                className="ml-1 text-blue-800 hover:text-blue-600"
                onClick={() => handleFilterChange("weapon", "all")}
                aria-label="Clear weapon filter"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.skill !== "all" && (
            <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1">
              Skill: {filters.skill}
              <button
                className="ml-1 text-green-800 hover:text-green-600"
                onClick={() => handleFilterChange("skill", "all")}
                aria-label="Clear skill filter"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.region !== "all" && (
            <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1">
              Region: {filters.region}
              <button
                className="ml-1 text-yellow-800 hover:text-yellow-600"
                onClick={() => handleFilterChange("region", "all")}
                aria-label="Clear region filter"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.gender !== "all" && (
            <span className="inline-flex items-center bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1">
              Gender: {filters.gender}
              <button
                className="ml-1 text-pink-800 hover:text-pink-600"
                onClick={() => handleFilterChange("gender", "all")}
                aria-label="Clear gender filter"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded mr-1">
              Search: "{filters.search}"
              <button
                className="ml-1 text-purple-800 hover:text-purple-600"
                onClick={() => { setSearchInput(""); handleFilterChange("search", ""); }}
                aria-label="Clear search filter"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(filters.weapon === "all" && filters.skill === "all" && filters.region === "all" && filters.gender === "all" && !filters.search) && (
            <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
              None
            </span>
          )}
        </div>
        {/* Athletes Grid */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {paginatedAthletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
        {filteredAthletes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No athletes found matching your criteria.</p>
          </div>
        )}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
