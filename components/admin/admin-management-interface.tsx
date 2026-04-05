"use client"

import { useUserApi } from "@/hooks/use-user-api"
import { useCommentApi } from "@/hooks/use-comment-api"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Users,
  Video,
  MessageSquare,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Flag,
  Settings,
  X,
  Calendar,
  User,
  Trophy,
  Sword,
  RotateCcw,
  Eye as EyeIcon,
  Filter,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useVideoApi } from "@/hooks/use-video-api"
import { Loading } from "@/components/common/loading"
import { UserProfileModal } from "./UserProfileModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface User {
  id: string | number
  name: string
  email: string
  role: "local_contact" | "coach" | "administrator"
  status: "active" | "suspended" | "pending"
  joinDate?: string
  lastActive?: string
  videosUploaded?: number
  phone?: string
  club_name?: string
  bio?: string
  avatar_url?: string | null
  last_login?: string
  created_at?: string
  updated_at?: string
}

interface VideoItem {
  id: string
  title: string
  athlete: string
  uploader: string
  uploadDate: string
  status: "published" | "pending" | "flagged" | "removed"
  views: number
  comments: number
  reports: number
  rawVideo?: any // Store original API data
}

interface CommentItem {
  id: string
  author: string
  content: string
  videoTitle: string
  timestamp: string
  status: "approved" | "pending" | "flagged" | "removed"
  reports: number
}

export function AdminManagementInterface() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("users")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileTab, setProfileTab] = useState<'profil' | 'details' | 'activity'>('profil')
  
  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)



  // Comments state
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)

  // Filter states
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all")
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all")
  const [videoStatusFilter, setVideoStatusFilter] = useState<string>("all")
  const [commentStatusFilter, setCommentStatusFilter] = useState<string>("all")

  const { getUsersExcludingAdmins, updateUserStatus, getUser, updateUserProfileAdmin } = useUserApi()
  const { getAllComments, updateCommentStatus } = useCommentApi()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Mode démo : utiliser les données de démo au lieu de l'API
        const { DEMO_USERS_LIST } = await import("@/lib/demo-users-list")
        setUsers(DEMO_USERS_LIST)
      } catch (err) {
        console.error("Error loading users:", err)
        // Fallback : essayer l'API si disponible
        try {
          const apiUsers = await getUsersExcludingAdmins()
          setUsers(apiUsers)
        } catch (apiErr) {
          setError("Erreur lors du chargement des utilisateurs")
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadUsers()

    // Load videos immediately for stats
    getVideos()
      .then((response) => {
        const videosData = response.videos || response || []
        const transformedVideos = videosData.map((video: any) => {
          let athleteNames = '';
          if (video.athleteRight_name && video.athleteLeft_name) {
            if (video.athleteRight_id === video.athleteLeft_id) {
              athleteNames = video.athleteRight_name;
            } else {
              athleteNames = `Droite: ${video.athleteRight_name}\nGauche: ${video.athleteLeft_name}`;
            }
          } else if (video.athleteRight_name) {
            athleteNames = video.athleteRight_name;
          } else if (video.athleteLeft_name) {
            athleteNames = video.athleteLeft_name;
          } else {
            athleteNames = 'Athlète inconnu';
          }
          return {
            id: video.id.toString(),
            title: video.title || 'Sans titre',
            athlete: athleteNames,
            uploader: video.uploader_name || video.uploader?.name || video.uploader?.email || 'Utilisateur inconnu',
            uploadDate: video.created_at || video.upload_date || '',
            status: video.status?.toLowerCase() || 'pending',
            views: video.view_count || 0,
            comments: video.comment_count || 0,
            reports: video.report_count || 0,
            rawVideo: video,
          }
        })
        setVideos(transformedVideos)
      })
      .catch(() => setVideos([]))
      .finally(() => setLoadingVideos(false))

    // Load comments immediately for stats
    getAllComments()
      .then((response) => {
        if (response && Array.isArray(response.comments)) {
          setComments(response.comments)
        } else if (response && Array.isArray(response)) {
          setComments(response)
        } else if (response && response.data && Array.isArray(response.data)) {
          setComments(response.data)
        } else {
          setComments([])
        }
      })
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false))
  }, [])


  const activeUsersCount = users.filter(u => u.status === 'active').length;
  
  // Calculate users who joined this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const usersJoinedThisMonth = users.filter(user => {
    if (!user.created_at) return false;
    const joinDate = new Date(user.created_at);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;





  const handleSuspend = async (userId: string | number) => {
    try {
      await updateUserStatus(Number(userId), "suspended")
      setUsers(users.map(u => u.id === userId ? { ...u, status: "suspended" } : u))
      toast({ title: "Utilisateur suspendu", description: "L'utilisateur a été suspendu." })
    } catch {
      toast({ title: "Erreur", description: "Impossible de suspendre l'utilisateur.", variant: "destructive" })
    }
  }

  const handleApprove = async (userId: string | number) => {
    try {
      await updateUserStatus(Number(userId), "active")
      setUsers(users.map(u => u.id === userId ? { ...u, status: "active" } : u))
      toast({ title: "Utilisateur approuvé", description: "L'utilisateur a été approuvé." })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'approuver l'utilisateur.", variant: "destructive" })
    }
  }

  const handleViewProfile = async (userId: string | number) => {
    setProfileLoading(true)
    setProfileError(null)
    setShowProfileModal(true)
    
    try {
      // Mode démo : utiliser les données de démo au lieu de l'API
      const { DEMO_USERS_LIST } = await import("@/lib/demo-users-list")
      const demoUser = DEMO_USERS_LIST.find(u => u.id === userId || String(u.id) === String(userId))
      
      if (demoUser) {
        setSelectedUser(demoUser as User)
      } else {
        // Fallback : essayer l'API si disponible
        try {
          const user = await getUser(Number(userId))
          setSelectedUser(user)
        } catch (apiErr) {
          setProfileError("Impossible de charger le profil utilisateur")
          toast({ title: "Erreur", description: "Impossible de charger le profil utilisateur.", variant: "destructive" })
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setProfileError("Impossible de charger le profil utilisateur")
      toast({ title: "Erreur", description: "Impossible de charger le profil utilisateur.", variant: "destructive" })
    } finally {
      setProfileLoading(false)
    }
  }

  const { getVideos, deleteVideo, updateVideoStatus, getVideo } = useVideoApi()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [errorVideos, setErrorVideos] = useState<string | null>(null)

  // Load videos when videos tab is selected
  useEffect(() => {
    if (selectedTab === "videos") {
      setLoadingVideos(true)
      setErrorVideos(null) // Clear any previous errors
      
      getVideos()
        .then((response) => {
          // Handle the VideoList response structure
          const videosData = response.videos || response || []
          
          // Transform API data to match our interface
          const transformedVideos = videosData.map((video: any) => {
            // Handle athlete names - show both if there are two different athletes, or just one
            let athleteNames = '';
            if (video.athleteRight_name && video.athleteLeft_name) {
              // Check if both athletes exist and if they're the same person
              if (video.athleteRight_id === video.athleteLeft_id) {
                // Same athlete - show only once
                athleteNames = video.athleteRight_name;
              } else {
                // Different athletes - show both with Right/Left labels
                athleteNames = `Droite: ${video.athleteRight_name}\nGauche: ${video.athleteLeft_name}`;
              }
            } else if (video.athleteRight_name) {
              // Only right athlete
              athleteNames = video.athleteRight_name;
            } else if (video.athleteLeft_name) {
              // Only left athlete
              athleteNames = video.athleteLeft_name;
            } else {
              athleteNames = 'Athlète inconnu';
            }

            return {
              id: video.id.toString(),
              title: video.title || 'Sans titre',
              athlete: athleteNames,
              uploader: video.uploader_name || video.uploader?.name || video.uploader?.email || 'Utilisateur inconnu',
              uploadDate: video.created_at || video.upload_date || '',
              status: video.status?.toLowerCase() || 'pending',
              views: video.view_count || 0,
              comments: video.comment_count || 0,
              reports: video.report_count || 0,
              // Store raw data for actions
              rawVideo: video,
            }
          })
          setVideos(transformedVideos)
        })
        .catch((error) => {
          console.error('Error loading videos:', error)
          // Don't set error message for empty results, let the UI handle it
          setVideos([])
        })
        .finally(() => setLoadingVideos(false))
    }
  }, [selectedTab])

  // Calculate video statistics (excluding removed videos)
  const publishedVideosCount = videos.filter(v => v.status === 'published').length;
  const flaggedVideosCount = videos.filter(v => v.status === 'flagged').length;
  const totalViews = videos.filter(v => v.status !== 'removed').reduce((sum, v) => sum + v.views, 0);
  

  
  // Calculate videos uploaded this month (excluding removed videos)
  const videosUploadedThisMonth = videos.filter(video => {
    if (!video.uploadDate || video.status === 'removed') return false;
    const uploadDate = new Date(video.uploadDate);
    return uploadDate.getMonth() === currentMonth && uploadDate.getFullYear() === currentYear;
  }).length;

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    // Apply status filter
    if (userStatusFilter !== "all" && user.status !== userStatusFilter) {
      return false;
    }
    
    // Apply role filter
    if (userRoleFilter !== "all" && user.role !== userRoleFilter) {
      return false;
    }
    
    // Apply search term
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.status?.toLowerCase().includes(searchLower)
    );
  });

  // Filter videos based on search term and filters
  const filteredVideos = videos.filter(video => {
    // Apply status filter
    if (videoStatusFilter !== "all" && video.status !== videoStatusFilter) {
      return false;
    }
    
    // Apply search term
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      video.title?.toLowerCase().includes(searchLower) ||
      video.athlete?.toLowerCase().includes(searchLower) ||
      video.uploader?.toLowerCase().includes(searchLower) ||
      video.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await updateVideoStatus(Number(videoId), "removed")
      setVideos(videos.map(v => v.id === videoId ? { ...v, status: "removed" } : v))
      toast({ title: "Vidéo masquée", description: "La vidéo a été masquée avec succès." })
    } catch {
      toast({ title: "Erreur", description: "Impossible de masquer la vidéo.", variant: "destructive" })
    }
  }

  const handlePublishVideo = async (videoId: string) => {
    try {
      await updateVideoStatus(Number(videoId), "published")
      setVideos(videos.map(v => v.id === videoId ? { ...v, status: "published" } : v))
      toast({ title: "Vidéo publiée", description: "La vidéo a été publiée." })
    } catch {
      toast({ title: "Erreur", description: "Impossible de publier la vidéo.", variant: "destructive" })
    }
  }

  const handleFlagVideo = async (videoId: string) => {
    try {
      await updateVideoStatus(Number(videoId), "flagged")
      setVideos(videos.map(v => v.id === videoId ? { ...v, status: "flagged" } : v))
      toast({ title: "Vidéo signalée", description: "La vidéo a été signalée." })
    } catch {
      toast({ title: "Erreur", description: "Impossible de signaler la vidéo.", variant: "destructive" })
    }
  }

  const handleRestoreVideo = async (videoId: string) => {
    try {
      await updateVideoStatus(Number(videoId), "published")
      setVideos(videos.map(v => v.id === videoId ? { ...v, status: "published" } : v))
      toast({ title: "Vidéo restaurée", description: "La vidéo a été restaurée et publiée." })
    } catch {
      toast({ title: "Erreur", description: "Impossible de restaurer la vidéo.", variant: "destructive" })
    }
  }

  const handleViewVideo = async (videoId: string) => {
    setVideoLoading(true)
    setVideoError(null)
    setShowVideoModal(true)
    
    try {
      // Get video details without incrementing view count (admin view)
      const video = await getVideo(Number(videoId))
      console.log('Video details:', video)
      setSelectedVideo(video)
    } catch (error) {
      console.error('Error fetching video:', error)
      setVideoError("Impossible de charger la vidéo")
      toast({ title: "Erreur", description: "Impossible de charger la vidéo.", variant: "destructive" })
    } finally {
      setVideoLoading(false)
    }
  }

  const handleCloseVideoModal = () => {
    setShowVideoModal(false)
    setSelectedVideo(null)
    setVideoError(null)
    setVideoLoading(false)
  }



  const handleApproveComment = async (commentId: string) => {
    try {
      await updateCommentStatus(Number(commentId), "approved")
      setComments(comments.map(c => c.id === commentId ? { ...c, status: "approved" } : c))
      toast({ title: "Commentaire approuvé", description: "Le commentaire a été approuvé." })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'approuver le commentaire.", variant: "destructive" })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await updateCommentStatus(Number(commentId), "removed")
      setComments(comments.map(c => c.id === commentId ? { ...c, status: "removed" } : c))
      toast({ title: "Commentaire supprimé", description: "Le commentaire a été supprimé." })
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le commentaire.", variant: "destructive" })
    }
  }

  // Filter comments based on status filter
  const filteredComments = comments.filter(comment => {
    if (commentStatusFilter !== "all" && comment.status !== commentStatusFilter) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "published":
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
      case "flagged":
        return "bg-red-100 text-red-800"
      case "removed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "administrator":
        return "bg-purple-100 text-purple-800"
      case "coach":
        return "bg-blue-100 text-blue-800"
      case "local_contact":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper to format dates
  function formatDate(dateStr?: string | null) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  }
  // Helper to get relative time (minutes, hours, days)
  function relativeTime(dateStr?: string | null) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `il y a ${diffSec} sec`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `il y a ${diffD} j`;
    return formatDate(dateStr);
  }

  const handleSaveProfile = async () => {
    if (!selectedUser) return
    setProfileLoading(true)
    try {
      // Update user profile via admin API
      await updateUserProfileAdmin(Number(selectedUser.id), {
        name: selectedUser.name || undefined,
        phone: selectedUser.phone || undefined,
        club_name: selectedUser.club_name || undefined,
        bio: selectedUser.bio || undefined,
        avatar_url: selectedUser.avatar_url || undefined,
      })
      // Refresh users list to update last activity
      // Mode démo : recharger depuis les données de démo
      try {
        const { DEMO_USERS_LIST } = await import("@/lib/demo-users-list")
        // Mettre à jour l'utilisateur modifié dans la liste
        const updatedList = DEMO_USERS_LIST.map(user => 
          user.id === selectedUser.id ? { ...user, ...selectedUser, updated_at: new Date().toISOString() } : user
        )
        setUsers(updatedList)
      } catch (err) {
        // Fallback : essayer l'API si disponible
        try {
          const updatedUsers = await getUsersExcludingAdmins()
          setUsers(updatedUsers)
        } catch (apiErr) {
          console.error("Error refreshing users:", apiErr)
        }
      }
      toast({ title: "Profil mis à jour", description: "Les informations de l'utilisateur ont été sauvegardées." })
      setShowProfileModal(false)
    } catch (error) {
      setProfileError("Erreur lors de la sauvegarde du profil.")
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Gestion des utilisateurs, contenus et modération</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Paramètres Système
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersCount}</div>
              <p className="text-xs text-muted-foreground">{usersJoinedThisMonth} nouveaux ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vidéos Publiées</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedVideosCount}</div>
            <p className="text-xs text-muted-foreground">{videosUploadedThisMonth} nouvelles ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
            <p className="text-xs text-muted-foreground">{comments.length > 0 ? `+${comments.length} ce mois` : 'Aucun commentaire ce mois'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 ">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="videos">Vidéos</TabsTrigger>
          <TabsTrigger value="comments">Commentaires</TabsTrigger>
        </TabsList>

        {/* Enhanced Search Bar */}
        <div className="flex items-center gap-4 mb-8 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher utilisateurs, vidéos, commentaires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="h-10"
            >
              Effacer
            </Button>
          )}
        </div>

        {/* Enhanced Filters */}
        {(selectedTab === "users" || selectedTab === "videos" || selectedTab === "comments") && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filtres</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {selectedTab === "users" && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="user-status" className="text-sm font-medium">Statut:</Label>
                    <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="user-role" className="text-sm font-medium">Rôle:</Label>
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les rôles</SelectItem>
                        <SelectItem value="local_contact">Contact local</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {selectedTab === "videos" && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="video-status" className="text-sm font-medium">Statut:</Label>
                    <Select value={videoStatusFilter} onValueChange={setVideoStatusFilter}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                        <SelectItem value="flagged">Signalé</SelectItem>
                        <SelectItem value="removed">Masqué</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  

                </>
              )}

              {selectedTab === "comments" && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="comment-status" className="text-sm font-medium">Statut:</Label>
                  <Select value={commentStatusFilter} onValueChange={setCommentStatusFilter}>
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="flagged">Signalé</SelectItem>
                      <SelectItem value="removed">Supprimé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserStatusFilter("all")
                  setUserRoleFilter("all")
                  setVideoStatusFilter("all")
                  setCommentStatusFilter("all")
                  setSearchTerm("")
                }}
                className="ml-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        )}

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Utilisateur</TableHead>
                    <TableHead className="font-semibold">Rôle</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Dernière Activité</TableHead>
                    <TableHead className="font-semibold">Vidéos</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6}>Chargement...</TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6}>{error}</TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>Aucun utilisateur trouvé.</TableCell>
                    </TableRow>
                  ) : (
                                        filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://placehold.co/64x64?text=${user.name?.charAt(0) ?? "U"}`} />
                              <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === "local_contact"
                            ? "Contact Local"
                            : user.role === "coach"
                              ? "Entraîneur"
                              : "Administrateur"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status === "active" ? "Actif" : user.status === "pending" ? "En attente" : "Suspendu"}
                        </Badge>
                      </TableCell>
                        <TableCell>{user.last_login ? relativeTime(user.last_login) : '-'}</TableCell>
                        <TableCell>{user.videosUploaded ?? 0}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={() => handleViewProfile(user.id)}
                                className="cursor-pointer hover:bg-muted"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir Profil
                              </DropdownMenuItem>
                              {user.status !== "active" && (
                                <DropdownMenuItem 
                                  onClick={() => handleApprove(user.id)}
                                  className="cursor-pointer hover:bg-muted"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approuver
                                </DropdownMenuItem>
                              )}
                              {user.status === "active" && (
                                <DropdownMenuItem 
                                  onClick={() => handleSuspend(user.id)}
                                  className="text-red-600 hover:text-red-700 cursor-pointer"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspendre
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Vidéos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Titre</TableHead>
                    <TableHead className="font-semibold">Athlète</TableHead>
                    <TableHead className="font-semibold">Téléchargé par</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Vues</TableHead>
                    <TableHead className="font-semibold">Signalements</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingVideos ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loading />
                      </TableCell>
                    </TableRow>
                  ) : errorVideos ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-red-500">
                        {errorVideos}
                      </TableCell>
                    </TableRow>
                  ) : filteredVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "Aucune vidéo trouvée avec ces critères de recherche." : "Aucune vidéo disponible."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVideos.map((video) => (
                    <TableRow key={video.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{video.title}</TableCell>
                      <TableCell>
                        <div className="whitespace-pre-line text-sm">
                          {video.athlete}
                        </div>
                      </TableCell>
                      <TableCell>{video.uploader}</TableCell>
                      <TableCell>{video.uploadDate ? formatDate(video.uploadDate) : '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(video.status)}>
                          {video.status === "published"
                            ? "Publié"
                            : video.status === "pending"
                              ? "En attente"
                              : video.status === "flagged"
                                ? "Signalé"
                                : video.status === "removed"
                                  ? "Masqué"
                                  : "Inconnu"}
                        </Badge>
                      </TableCell>
                      <TableCell>{video.views}</TableCell>
                      <TableCell>{video.reports > 0 && <Badge variant="destructive">{video.reports}</Badge>}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={() => handleViewVideo(video.id)}
                                className="cursor-pointer hover:bg-muted"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir Vidéo
                              </DropdownMenuItem>
                              {video.status === "removed" ? (
                                <DropdownMenuItem 
                                  className="text-green-600 hover:text-green-700 cursor-pointer" 
                                  onClick={() => handleRestoreVideo(video.id)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restaurer
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  {video.status !== "published" && (
                                    <DropdownMenuItem 
                                      onClick={() => handlePublishVideo(video.id)}
                                      className="cursor-pointer hover:bg-muted"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Publier
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="text-red-600 hover:text-red-700 cursor-pointer" 
                                    onClick={() => handleDeleteVideo(video.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Masquer
                                  </DropdownMenuItem>
                                </>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Modération des Commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading />
                </div>
              ) : commentsError ? (
                <div className="text-center py-12">
                  <p className="text-red-500">{commentsError}</p>
                </div>
              ) : filteredComments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {comments.length === 0 ? "Aucun commentaire disponible." : "Aucun commentaire trouvé avec ces critères de filtrage."}
                  </p>
                  {commentsError && (
                    <p className="text-red-500 mt-2">Erreur: {commentsError}</p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Auteur</TableHead>
                      <TableHead className="font-semibold">Commentaire</TableHead>
                      <TableHead className="font-semibold">Vidéo</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Signalements</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map((comment) => (
                      <TableRow key={comment.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>{comment.author_name || comment.author?.name || 'Utilisateur inconnu'}</TableCell>
                        <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                        <TableCell>{comment.video_title || 'Vidéo inconnue'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(comment.status)}>
                            {comment.status === "approved"
                              ? "Approuvé"
                              : comment.status === "flagged"
                                ? "Signalé"
                                : comment.status === "removed"
                                  ? "Supprimé"
                                  : comment.status === "published"
                                    ? "Publié"
                                    : "Inconnu"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {comment.report_count > 0 && <Badge variant="destructive">{comment.report_count}</Badge>}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {comment.status !== "approved" && (
                                <DropdownMenuItem 
                                  onClick={() => handleApproveComment(comment.id)}
                                  className="cursor-pointer hover:bg-muted"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approuver
                                </DropdownMenuItem>
                              )}
                              {comment.status !== "removed" && (
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteComment(comment.id)} 
                                  className="text-red-600 hover:text-red-700 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>


      <UserProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={selectedUser}
        loading={profileLoading}
        error={profileError}
        tab={profileTab}
        setTab={setProfileTab}
        onChange={(u) => setSelectedUser(u)}
        onSave={handleSaveProfile}
      />



      {/* Video Preview Modal */}
      <Dialog open={showVideoModal} onOpenChange={handleCloseVideoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pt-2 pb-2">
            <DialogTitle>Détails de la vidéo</DialogTitle>
          </DialogHeader>
          
          {videoLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : videoError ? (
            <div className="text-center py-12">
              <p className="text-red-500">{videoError}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowVideoModal(false)}
              >
                Fermer
              </Button>
            </div>
          ) : selectedVideo ? (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {selectedVideo.file_path ? (
                  <video
                    src={`http://localhost:8000/${selectedVideo.file_path}`}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                    autoPlay={false}
                    muted={false}
                    playsInline
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Video error:', e);
                      const videoElement = e.target as HTMLVideoElement;
                      console.error('Video element:', videoElement);
                      console.error('Video src:', videoElement?.src);
                      setVideoError("Erreur lors du chargement de la vidéo. Vérifiez que le fichier existe sur le serveur.");
                    }}
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <p>Aucune vidéo disponible</p>
                  </div>
                )}
              </div>

              {/* Video Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{selectedVideo.title}</h3>
                    {selectedVideo.description && (
                      <p className="text-muted-foreground">{selectedVideo.description}</p>
                    )}
                  </div>

                  {/* Athletes Information */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Athlètes
                    </h4>
                    <div className="space-y-1">
                      {selectedVideo.athleteRight_name && selectedVideo.athleteLeft_name ? (
                        // Check if both athletes exist and if they're the same person
                        selectedVideo.athleteRight_id === selectedVideo.athleteLeft_id ? (
                          // Same athlete
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Athlète</Badge>
                            <span>{selectedVideo.athleteRight_name}</span>
                          </div>
                        ) : (
                          // Different athletes - show both with Right/Left labels
                          <>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Droite</Badge>
                              <span>{selectedVideo.athleteRight_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Gauche</Badge>
                              <span>{selectedVideo.athleteLeft_name}</span>
                            </div>
                          </>
                        )
                      ) : (
                        // Only one athlete exists
                        <>
                          {selectedVideo.athleteRight_name && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Athlète</Badge>
                              <span>{selectedVideo.athleteRight_name}</span>
                            </div>
                          )}
                          {selectedVideo.athleteLeft_name && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Athlète</Badge>
                              <span>{selectedVideo.athleteLeft_name}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Competition Information */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Compétition
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nom:</strong> {selectedVideo.competition_name || 'Non spécifié'}</p>
                      <p><strong>Date:</strong> {selectedVideo.competition_date ? formatDate(selectedVideo.competition_date) : 'Non spécifiée'}</p>
                      {selectedVideo.score && (
                        <p><strong>Score:</strong> {selectedVideo.score}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Weapon Information */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sword className="h-4 w-4" />
                      Arme
                    </h4>
                    <Badge className={getStatusColor(selectedVideo.weapon_type)}>
                      {selectedVideo.weapon_type === 'foil' ? 'Fleuret' : 
                       selectedVideo.weapon_type === 'epee' ? 'Épée' : 
                       selectedVideo.weapon_type === 'sabre' ? 'Sabre' : 
                       selectedVideo.weapon_type}
                    </Badge>
                  </div>

                  {/* Upload Information */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Informations de téléchargement
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Téléchargé par:</strong> {selectedVideo.uploader_name || 'Utilisateur inconnu'}</p>
                      <p><strong>Date:</strong> {selectedVideo.created_at ? formatDate(selectedVideo.created_at) : 'Non spécifiée'}</p>
                      <div className="flex items-center gap-2">
                        <strong>Statut:</strong> 
                        <Badge className={getStatusColor(selectedVideo.status)}>
                          {selectedVideo.status === "published" ? "Publié" : 
                           selectedVideo.status === "pending" ? "En attente" : 
                           selectedVideo.status === "flagged" ? "Signalé" : 
                           selectedVideo.status === "removed" ? "Masqué" : 
                           "Inconnu"}
                        </Badge>
                      </div>
                      <p><strong>Vues:</strong> {selectedVideo.view_count || 0}</p>
                      {selectedVideo.file_size && (
                        <p><strong>Taille:</strong> {(selectedVideo.file_size / 1024 / 1024).toFixed(2)} MB</p>
                      )}
                    </div>
                  </div>


                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

