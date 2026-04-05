"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Video,
  User,
  MessageSquare,
  Star,
  Settings,
  X,
  Check,
  Clock,
  AlertCircle,
  Trophy,
  Upload,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Notification {
  id: string
  type: "video" | "athlete" | "comment" | "evaluation" | "system" | "achievement"
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: "low" | "medium" | "high"
  actionUrl?: string
  metadata?: {
    athleteName?: string
    videoTitle?: string
    evaluatorName?: string
  }
}

interface NotificationSettings {
  newVideos: boolean
  newAthletes: boolean
  newComments: boolean
  newEvaluations: boolean
  systemUpdates: boolean
  achievements: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  digestFrequency: "immediate" | "daily" | "weekly"
}

export function NotificationSystem() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    newVideos: true,
    newAthletes: true,
    newComments: true,
    newEvaluations: true,
    systemUpdates: true,
    achievements: true,
    emailNotifications: true,
    pushNotifications: false,
    digestFrequency: "daily",
  })
  const [activeTab, setActiveTab] = useState("notifications")

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "video",
        title: "Nouvelle vidéo téléchargée",
        message: "Marie Dubois a téléchargé une nouvelle vidéo: 'Championnat Régional Final'",
        timestamp: "il y a 5 min",
        isRead: false,
        priority: "medium",
        actionUrl: "/videos/1",
        metadata: {
          athleteName: "Marie Dubois",
          videoTitle: "Championnat Régional Final",
        },
      },
      {
        id: "2",
        type: "evaluation",
        title: "Nouvelle évaluation",
        message: "Master Laurent a évalué Marie Dubois avec une note de 86/100",
        timestamp: "il y a 1h",
        isRead: false,
        priority: "high",
        actionUrl: "/athletes/1/evaluations",
        metadata: {
          athleteName: "Marie Dubois",
          evaluatorName: "Master Laurent",
        },
      },
      {
        id: "3",
        type: "comment",
        title: "Nouveau commentaire",
        message: "Coach Martin a commenté la vidéo 'Entraînement Technique'",
        timestamp: "il y a 2h",
        isRead: true,
        priority: "low",
        actionUrl: "/videos/2#comments",
      },
      {
        id: "4",
        type: "athlete",
        title: "Nouvel athlète inscrit",
        message: "Jean Nouveau s'est inscrit et attend l'approbation",
        timestamp: "il y a 3h",
        isRead: false,
        priority: "medium",
        actionUrl: "/admin/users",
        metadata: {
          athleteName: "Jean Nouveau",
        },
      },
      {
        id: "5",
        type: "achievement",
        title: "Nouveau record personnel",
        message: "Marie Dubois a atteint son meilleur score d'évaluation: 86/100",
        timestamp: "il y a 1 jour",
        isRead: true,
        priority: "medium",
        actionUrl: "/athletes/1",
        metadata: {
          athleteName: "Marie Dubois",
        },
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "athlete":
        return <User className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "evaluation":
        return <Star className="h-4 w-4" />
      case "achievement":
        return <Trophy className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-error/40 bg-error/10"
      case "medium":
        return "border-warning/40 bg-warning/10"
      case "low":
      default:
        return "border-info/40 bg-info/10"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Gérez vos notifications et préférences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Tout marquer lu
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune notification pour le moment</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.isRead ? "bg-background" : getPriorityColor(notification.priority)
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                              <Badge variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'medium' ? 'warning' : 'info'} className="text-xs">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{notification.timestamp}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Types de Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span>Nouvelles vidéos</span>
                    </div>
                    <Switch
                      checked={settings.newVideos}
                      onCheckedChange={(checked) => updateSetting("newVideos", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Nouveaux athlètes</span>
                    </div>
                    <Switch
                      checked={settings.newAthletes}
                      onCheckedChange={(checked) => updateSetting("newAthletes", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>Nouveaux commentaires</span>
                    </div>
                    <Switch
                      checked={settings.newComments}
                      onCheckedChange={(checked) => updateSetting("newComments", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>Nouvelles évaluations</span>
                    </div>
                    <Switch
                      checked={settings.newEvaluations}
                      onCheckedChange={(checked) => updateSetting("newEvaluations", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>Réussites et records</span>
                    </div>
                    <Switch
                      checked={settings.achievements}
                      onCheckedChange={(checked) => updateSetting("achievements", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Mises à jour système</span>
                    </div>
                    <Switch
                      checked={settings.systemUpdates}
                      onCheckedChange={(checked) => updateSetting("systemUpdates", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Méthodes de Livraison</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Notifications par email</span>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notifications push</span>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Fréquence des Résumés</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="immediate"
                      checked={settings.digestFrequency === "immediate"}
                      onChange={(e) => updateSetting("digestFrequency", e.target.value)}
                    />
                    <span>Immédiat</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={settings.digestFrequency === "daily"}
                      onChange={(e) => updateSetting("digestFrequency", e.target.value)}
                    />
                    <span>Résumé quotidien</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={settings.digestFrequency === "weekly"}
                      onChange={(e) => updateSetting("digestFrequency", e.target.value)}
                    />
                    <span>Résumé hebdomadaire</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications Personnalisées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configurez des alertes personnalisées basées sur des critères spécifiques.
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Créer une Alerte Personnalisée
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
