import { Dispatch, SetStateAction, useRef, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/common/loading"
import { CheckCircle, Info, X } from "lucide-react"

interface User {
  id: number | string
  email: string
  name: string
  role: "local_contact" | "coach" | "administrator"
  phone?: string
  club_name?: string
  bio?: string
  status: "active" | "suspended" | "pending"
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
  last_login?: string
  is_email_verified?: boolean
  gdpr_consent?: boolean
  gdpr_consent_date?: string | null
}

interface UserProfileModalProps {
  open: boolean
  onClose: () => void
  user: User | null
  loading: boolean
  error: string | null
  tab: 'profil' | 'details' | 'activity'
  setTab: Dispatch<SetStateAction<'profil' | 'details' | 'activity'>>
  onChange: (user: User) => void
  onSave: () => void
}

const roleLabels = {
  administrator: "Administrateur",
  coach: "Entraîneur",
  local_contact: "Contact Local",
}

const roleColors = {
  administrator: "bg-purple-100 text-purple-800",
  coach: "bg-blue-100 text-blue-800",
  local_contact: "bg-green-100 text-green-800",
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
}

// Helper to format dates
function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

export function UserProfileModal({
  open,
  onClose,
  user,
  loading,
  error,
  tab,
  setTab,
  onChange,
  onSave,
}: UserProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [localTab, setLocalTab] = useState(tab)
  const [tabAnim, setTabAnim] = useState<'fade-in' | 'fade-out'>('fade-in')
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!user) return
    const errors: { [key: string]: string } = {}
    if (!user.name || user.name.trim() === "") errors.name = "Le nom est requis."
    if (!user.email || user.email.trim() === "") errors.email = "L'email est requis."
    setFieldErrors(errors)
  }, [user])

  useEffect(() => {
    if (tab !== localTab) {
      setTabAnim('fade-out')
      setTimeout(() => {
        setLocalTab(tab)
        setTabAnim('fade-in')
      }, 180)
    }
  }, [tab, localTab])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [open])

  if (!open) return null

  const modalContent = (
    <>
      {/* Backdrop that covers the entire viewport */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        style={{ 
          zIndex: 99999, 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100vh',
          position: 'fixed'
        }} 
      />
      
      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ zIndex: 100000 }} role="dialog" aria-modal="true">
      <div ref={modalRef} className="relative w-full max-w-3xl rounded-2xl shadow-2xl bg-background overflow-hidden animate-fade-in">
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Banner with name only */}
        <div className="bg-gray-900 h-24 w-full flex items-end justify-center relative">
          <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">{user?.name}</h2>
        </div>

        {/* Info section below banner */}
        <div className="flex px-8 pt-4 pb-2 items-end gap-4">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage src={user?.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">{user?.name?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 pb-2">
            
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            {user?.club_name && <p className="text-muted-foreground text-sm">{user.club_name}</p>}
            {user?.last_login && (
              <p className="text-muted-foreground text-xs">Dernière activité : {formatDate(user.last_login)}</p>
            )}
            
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <Badge className={`${roleColors[user.role]} text-xs`}>{roleLabels[user.role]}</Badge>
                  <Badge className={`${statusColors[user.status]} text-xs`}>{user.status === "active" ? "Actif" : user.status === "pending" ? "En attente" : "Suspendu"}</Badge>
                </>
              )}
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
              onClick={onSave}
              disabled={loading || Object.keys(fieldErrors).length > 0}
            >
              {loading ? <Loading /> : <>Sauvegarder <CheckCircle size={16} className="inline ml-1" /></>}
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium border hover:bg-muted"
              onClick={onClose}
            >
              Annuler
            </button>
          </div>
        </div>

        <div className="px-8 mt-6 mb-6 py-4">
          <div className="flex space-x-4 border-b pb-2 mb-6">
            {["profil", "details", "activity"].map((t) => (
              <button
                key={t}
                className={`capitalize px-4 py-2 font-medium rounded-t ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setTab(t as any)}
              >
                {t === 'profil' ? 'Profil' : t === 'details' ? 'Détails' : 'Activité'}
              </button>
            ))}
          </div>

          <div className={`transition-opacity duration-200 ${tabAnim === 'fade-in' ? 'opacity-100' : 'opacity-0'}`}>
            {loading ? (
              <div className="py-12"><Loading /></div>
            ) : error ? (
              <div className="text-red-600 py-8 text-center">{error}</div>
            ) : user && localTab === 'profil' ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary ${fieldErrors.name && touched.name ? 'border-red-500' : ''}`}
                    value={user.name || ''}
                    onChange={e => onChange({ ...user, name: e.target.value })}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  />
                  {fieldErrors.name && touched.name && <div className="text-red-500 text-xs mt-1">{fieldErrors.name}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={user.phone || ''}
                    onChange={e => onChange({ ...user, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Club</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={user.club_name || ''}
                    onChange={e => onChange({ ...user, club_name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary min-h-[60px]"
                    value={user.bio || ''}
                    onChange={e => onChange({ ...user, bio: e.target.value })}
                  />
                </div>
              </div>
            ) : user && localTab === 'details' ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium mb-1">Email vérifié:</p>
                  <Badge variant={user.is_email_verified ? 'default' : 'destructive'}>
                    {user.is_email_verified ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Créé le:</p>
                  <span>{formatDate(user.created_at)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Mis à jour le:</p>
                  <span>{formatDate(user.updated_at)}</span>
                </div>
              </div>
            ) : user && localTab === 'activity' ? (
              <div>
                <p className="text-sm font-medium mb-1">Dernière connexion:</p>
                <span>{formatDate(user.last_login)}</span>
              </div>
            ) : null}
          </div>
        </div>
              </div>
      </div>
      </>
    )

  return createPortal(modalContent, document.body)
  }
