"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Flag, MessageSquare, Video, AlertTriangle } from "lucide-react"
import { Report } from "@/hooks/use-report-api"

interface ReportDetailsModalProps {
  open: boolean
  onClose: () => void
  report: Report | null
  loading?: boolean
}

export function ReportDetailsModal({ open, onClose, report, loading = false }: ReportDetailsModalProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "resolved":
        return "Résolu"
      case "dismissed":
        return "Rejeté"
      default:
        return status
    }
  }

  const getContentTypeIcon = (type: string) => {
    return type === "video" ? <Video className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />
  }

  const getContentTypeText = (type: string) => {
    return type === "video" ? "Vidéo" : "Commentaire"
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du signalement</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du signalement</DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun signalement sélectionné</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Détails du signalement #{report.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getContentTypeIcon(report.reported_content_type)}
              <span className="font-medium">
                {getContentTypeText(report.reported_content_type)} signalé
              </span>
            </div>
            <Badge className={getStatusColor(report.status)}>
              {getStatusText(report.status)}
            </Badge>
          </div>

          <Separator />

          {/* Content Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contenu signalé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID du contenu</p>
                <p className="font-mono text-sm">{report.reported_content_id}</p>
              </div>
              {report.reported_content_title && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Titre</p>
                  <p className="text-sm">{report.reported_content_title}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reporter Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Signaleur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID utilisateur</p>
                <p className="font-mono text-sm">{report.reporter_id}</p>
              </div>
              {report.reporter_name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-sm">{report.reporter_name}</p>
                </div>
              )}
              {report.reporter_email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{report.reporter_email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Raison du signalement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Raison</p>
                <Badge variant="outline" className="text-sm">
                  {report.reason}
                </Badge>
              </div>
              {report.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{report.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informations temporelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                <p className="text-sm">{formatDate(report.created_at)}</p>
              </div>
              {report.updated_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dernière modification</p>
                  <p className="text-sm">{formatDate(report.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 