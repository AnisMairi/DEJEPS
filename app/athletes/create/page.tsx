"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Save, UserPlus, Upload, X, Camera } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAthleteApi } from "@/hooks/use-athlete-api"

export default function CreateAthletePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    
    // Fencing Information
    weapon: "",
    skillLevel: "",
    club: "",
    coach: "",
    region: "",
    
    // Additional Information
    emergencyContact: "",
    emergencyPhone: "",
    medicalNotes: "",
    notes: "",
  })

  // Tutor information for minors
  const [tutorInfo, setTutorInfo] = useState({
    tutorFirstName: "",
    tutorLastName: "",
    tutorEmail: "",
    tutorPhone: "",
    tutorRelationship: "",
    tutorAddress: "",
    tutorOccupation: "",
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { createAthlete, uploadAthleteAvatar } = useAthleteApi();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner un fichier image (JPEG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop grand",
          description: "Veuillez sélectionner un fichier image plus petit que 5MB",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) return 0
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return Math.max(0, age) // Ensure age is not negative
  }

  // Check if athlete is a minor (under 18)
  const isMinor = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) < 18 : false

  const handleTutorInputChange = (field: string, value: string) => {
    setTutorInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Map form fields to API schema
      const athletePayload: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        weapon: formData.weapon,
        skill_level: formData.skillLevel,
        club: formData.club || undefined,
        coach: formData.coach || undefined,
        region: formData.region || undefined,
        emergency_contact: formData.emergencyContact || undefined,
        emergency_phone: formData.emergencyPhone || undefined,
        medical_notes: formData.medicalNotes || undefined,
        notes: formData.notes || undefined,
      };
      // Add tutor info if minor
      if (isMinor) {
        athletePayload.tutor = {
          first_name: tutorInfo.tutorFirstName,
          last_name: tutorInfo.tutorLastName,
          email: tutorInfo.tutorEmail,
          phone: tutorInfo.tutorPhone,
          tutor_relationship: tutorInfo.tutorRelationship,
          address: tutorInfo.tutorAddress || undefined,
          occupation: tutorInfo.tutorOccupation || undefined,
        };
      }
      // Create athlete
      const created = await createAthlete(athletePayload);
      // Upload avatar if present
      if (avatarFile && created?.id) {
        await uploadAthleteAvatar(created.id, avatarFile);
      }
      toast({
        title: "Succès!",
        description: "L'athlète a été ajouté avec succès.",
      });
      router.push("/athletes");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Échec de l'ajout de l'athlète. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/athletes">
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Ajouter un nouvel athlète</h1>
              <p className="text-muted-foreground">
                Entrez les informations de l'athlète pour les ajouter à la plateforme
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <Label className="text-base font-medium">Photo de profil</Label>
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                      <AvatarImage src={avatarPreview} alt="Profile preview" />
                      <AvatarFallback className="text-lg">
                        {formData.firstName && formData.lastName 
                          ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
                          : <Camera className="h-8 w-8" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeAvatar}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {avatarPreview ? "Changer la photo" : "Télécharger la photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      JPG, PNG jusqu'à 5MB
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Entrez le prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Entrez le nom"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Sexe *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le sexe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="athlète@exemple.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fencing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de la sabre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weapon">Arme *</Label>
                    <Select value={formData.weapon} onValueChange={(value) => handleInputChange("weapon", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'arme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="foil">Fleuret</SelectItem>
                        <SelectItem value="sabre">Sabre</SelectItem>
                        <SelectItem value="épée">Épée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skillLevel">Niveau de compétence *</Label>
                    <Select value={formData.skillLevel} onValueChange={(value) => handleInputChange("skillLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le niveau de compétence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="club">Club</Label>
                    <Input
                      id="club"
                      value={formData.club}
                      onChange={(e) => handleInputChange("club", e.target.value)}
                      placeholder="Entrez le nom du club"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coach">Entraîneur</Label>
                    <Input
                      id="coach"
                      value={formData.coach}
                      onChange={(e) => handleInputChange("coach", e.target.value)}
                      placeholder="Entrez le nom de l'entraîneur"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
                  <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paris">Paris</SelectItem>
                      <SelectItem value="lyon">Lyon</SelectItem>
                      <SelectItem value="marseille">Marseille</SelectItem>
                      <SelectItem value="toulouse">Toulouse</SelectItem>
                      <SelectItem value="bordeaux">Bordeaux</SelectItem>
                      <SelectItem value="nice">Nice</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact d'urgence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Nom du contact d'urgence</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Nom du parent ou de l'aide juridique"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Téléphone d'urgence</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                      placeholder="Téléphone du contact d'urgence"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tutor Information - Only show for minors */}
            {isMinor && (
              <Card className="border-orange-800 ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <UserPlus className="h-5 w-5" />
                    Informations du tuteur/gardien légal
                    <span className="text-sm font-normal text-orange-600">
                      (Requis pour les athlètes de moins de 18 ans)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tutorFirstName">Prénom du tuteur *</Label>
                      <Input
                        id="tutorFirstName"
                        value={tutorInfo.tutorFirstName}
                        onChange={(e) => handleTutorInputChange("tutorFirstName", e.target.value)}
                        placeholder="Entrez le prénom du tuteur"
                        required={isMinor}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tutorLastName">Nom du tuteur *</Label>
                      <Input
                        id="tutorLastName"
                        value={tutorInfo.tutorLastName}
                        onChange={(e) => handleTutorInputChange("tutorLastName", e.target.value)}
                        placeholder="Entrez le nom du tuteur"
                        required={isMinor}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tutorEmail">Email du tuteur *</Label>
                      <Input
                        id="tutorEmail"
                        type="email"
                        value={tutorInfo.tutorEmail}
                        onChange={(e) => handleTutorInputChange("tutorEmail", e.target.value)}
                        placeholder="tuteur@exemple.com"
                        required={isMinor}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tutorPhone">Téléphone du tuteur *</Label>
                      <Input
                        id="tutorPhone"
                        type="tel"
                        value={tutorInfo.tutorPhone}
                        onChange={(e) => handleTutorInputChange("tutorPhone", e.target.value)}
                        placeholder="+33 1 23 45 67 89"
                        required={isMinor}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tutorRelationship">Relation avec l'athlète *</Label>
                      <Select 
                        value={tutorInfo.tutorRelationship} 
                        onValueChange={(value) => handleTutorInputChange("tutorRelationship", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la relation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="legal-guardian">Gardien légal</SelectItem>
                          <SelectItem value="grandparent">Grand-parent</SelectItem>
                          <SelectItem value="uncle-aunt">Tante/Oncle</SelectItem>
                          <SelectItem value="sibling">Frère/Soeur (18+)</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tutorOccupation">Occupation du tuteur</Label>
                      <Input
                        id="tutorOccupation"
                        value={tutorInfo.tutorOccupation}
                        onChange={(e) => handleTutorInputChange("tutorOccupation", e.target.value)}
                        placeholder="Entrez l'occupation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tutorAddress">Adresse du tuteur</Label>
                    <Textarea
                      id="tutorAddress"
                      value={tutorInfo.tutorAddress}
                      onChange={(e) => handleTutorInputChange("tutorAddress", e.target.value)}
                      placeholder="Entrez l'adresse complète"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations supplémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalNotes">Notes médicales</Label>
                  <Textarea
                    id="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={(e) => handleInputChange("medicalNotes", e.target.value)}
                    placeholder="Toute condition médicale, allergie ou exigence particulière..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes supplémentaires</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Toute information supplémentaire sur l'athlète..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/athletes">Annuler</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Ajout de l'athlète..." : "Ajouter l'athlète"}
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  )
} 