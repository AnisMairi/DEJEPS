"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { VideoCard } from "@/components/video/video-card"
import { RealTimeVideoFilters } from "@/components/video/real-time-video-filters"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { Loading } from "@/components/common/loading"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

export default function VideosPage() {
  const [allVideos, setAllVideos] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [perPage] = useState(16)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [filters, setFilters] = useState<any>({
    search: "",
    weapon: "allWeapons",
    gender: "allGenders",
    competitionLevel: "allLevels",
    competitionType: "allCompetitions",
    year: "allYears",
    region: "allRegions",
    department: "allDepartments",
    club: "allClubs",
  })

  // Memoize filters to avoid infinite loop
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)])

  useEffect(() => {
    // Mode démo : utiliser les données de démo au lieu de l'API
    const loadVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        // Import dynamique pour éviter les erreurs de build
        const { DEMO_VIDEOS } = await import("@/lib/demo-videos")
        setAllVideos(DEMO_VIDEOS)
      } catch (err) {
        console.error('Error loading videos:', err)
        setError("Erreur lors du chargement des vidéos")
        setAllVideos([])
      } finally {
        setLoading(false)
      }
    }
    loadVideos()
  }, [])

  // Filter and paginate client-side
  const filteredVideos = useMemo(() => {
    let filtered = allVideos
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(search) ||
        (v.description && v.description.toLowerCase().includes(search)) ||
        (v.athleteRight_name && v.athleteRight_name.toLowerCase().includes(search)) ||
        (v.athleteLeft_name && v.athleteLeft_name.toLowerCase().includes(search)) ||
        (v.uploader_name && v.uploader_name.toLowerCase().includes(search)) ||
        (v.competition_name && v.competition_name.toLowerCase().includes(search))
      )
    }
    // Status filter (if you want to filter published/removed/etc.)
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(v => v.status === filters.status)
    }
    // is_public filter (if you want to filter public/private)
    if (filters.is_public !== undefined && filters.is_public !== 'all') {
      filtered = filtered.filter(v => v.is_public === (filters.is_public === 'true'))
    }
    // Weapon filter
    if (filters.weapon && filters.weapon !== 'allWeapons') {
      filtered = filtered.filter(v => v.weapon_type === filters.weapon)
    }
    // Year filter (based on competition_date)
    if (filters.year && filters.year !== 'allYears') {
      filtered = filtered.filter(v => {
        if (!v.competition_date) return false
        const year = new Date(v.competition_date).getFullYear().toString()
        return year === filters.year
      })
    }
    // Region filter
    if (filters.region && filters.region !== 'allRegions') {
      filtered = filtered.filter(v => v.region === filters.region)
    }
    // Department filter
    if (filters.department && filters.department !== 'allDepartments') {
      filtered = filtered.filter(v => v.department === filters.department)
    }
    // Club filter
    if (filters.club && filters.club !== 'allClubs') {
      filtered = filtered.filter(v => v.club === filters.club)
    }
    setTotalResults(filtered.length)
    setTotalPages(Math.max(1, Math.ceil(filtered.length / perPage)))
    return filtered.slice((page - 1) * perPage, page * perPage)
  }, [allVideos, filters, page, perPage])

  // Update videos when filteredVideos changes
  useEffect(() => {
    setVideos(filteredVideos)
  }, [filteredVideos])

  const handleFiltersChange = (newFilters: any) => {
    // Only update filters if they actually changed
    if (JSON.stringify(filters) !== JSON.stringify(newFilters)) {
      setFilters(newFilters)
      setPage(1)
    }
  }

  // Helper function to format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Helper function to get athlete display name
  const getAthleteDisplayName = (video: any): string => {
    if (video.athleteRight_name && video.athleteLeft_name) {
      if (video.athleteRight_id === video.athleteLeft_id) {
        return video.athleteRight_name
      } else {
        return `${video.athleteRight_name} vs ${video.athleteLeft_name}`
      }
    } else if (video.athleteRight_name) {
      return video.athleteRight_name
    } else if (video.athleteLeft_name) {
      return video.athleteLeft_name
    } else {
      return 'Athlète inconnu'
    }
  }

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'Date inconnue'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'il y a moins d\'une heure'
    if (diffInHours < 24) return `il y a ${diffInHours}h`
    if (diffInHours < 48) return 'il y a 1 jour'
    if (diffInHours < 168) return `il y a ${Math.floor(diffInHours / 24)} jours`
    if (diffInHours < 336) return 'il y a 1 semaine'
    return `il y a ${Math.floor(diffInHours / 168)} semaines`
  }

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages)
      }
    }
    return pages
  }

  if (loading && (page === 1 && Object.keys(filters).length === 0)) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center py-12">
            <Loading />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  // Show shimmer skeletons when loading (not initial load)
  const showShimmer = loading && !(page === 1 && Object.keys(filters).length === 0)

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Vidéos de Compétition</h1>
              <p className="text-muted-foreground">
                Parcourez les vidéos d'escrime avec informations détaillées des athlètes
              </p>
            </div>
            <Button asChild>
              <Link href="/videos/upload">
                <Upload className="mr-2 h-4 w-4" />
                Télécharger une Vidéo
              </Link>
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <RealTimeVideoFilters
            filters={filters}
            setFilters={setFilters}
            onFiltersChange={handleFiltersChange}
            totalResults={totalResults}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {showShimmer
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))
              : videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
          </div>

          {/* Dynamic Pagination (shadcn) */}
          <Pagination className="mt-8">
            <PaginationContent>
              {/* Only show Previous if not on first page */}
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => { e.preventDefault(); if (page > 1) setPage(page - 1) }}
                    aria-disabled={page === 1}
                  />
                </PaginationItem>
              )}
              {getPageNumbers().map((p, idx) =>
                p === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={page === p}
                      onClick={e => { e.preventDefault(); setPage(Number(p)) }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              {/* Only show Next if not on last page */}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => { e.preventDefault(); if (page < totalPages) setPage(page + 1) }}
                    aria-disabled={page === totalPages}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>

          {!loading && !error && videos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {videos.length === 0 ? "Aucune vidéo disponible." : "Aucune vidéo trouvée avec ces critères de recherche."}
              </p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
