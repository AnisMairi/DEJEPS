// Liste des utilisateurs de démo pour la page admin - Basés sur DEMO_USERS

export interface DemoUserListItem {
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

export const DEMO_USERS_LIST: DemoUserListItem[] = [
  {
    id: "2",
    name: "Coach Principal",
    email: "coach@federation.fr",
    role: "coach",
    status: "active",
    joinDate: "2023-01-15",
    lastActive: new Date().toISOString(),
    videosUploaded: 45,
    phone: "01 23 45 67 89",
    club_name: "Fédération Française d'Escrime",
    bio: "Coach principal de la fédération, spécialisé dans la détection de jeunes talents.",
    avatar_url: "https://placehold.co/200x200?text=CP",
    last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
    created_at: "2023-01-15T10:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Contact Local",
    email: "contact@federation.fr",
    role: "local_contact",
    status: "active",
    joinDate: "2023-02-20",
    lastActive: new Date().toISOString(),
    videosUploaded: 28,
    phone: "01 98 76 54 32",
    club_name: "Cercle d'Escrime de Paris",
    bio: "Contact local pour la région Île-de-France, chargé de la collecte de vidéos.",
    avatar_url: "https://placehold.co/200x200?text=CL",
    last_login: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Il y a 5h
    created_at: "2023-02-20T14:30:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Marie Laurent",
    email: "marie.laurent@federation.fr",
    role: "coach",
    status: "active",
    joinDate: "2023-03-10",
    lastActive: new Date().toISOString(),
    videosUploaded: 32,
    phone: "04 12 34 56 78",
    club_name: "AS Escrime Lyon",
    bio: "Coach régional spécialisée en fleuret, experte en analyse technique.",
    avatar_url: "https://placehold.co/200x200?text=ML",
    last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 jour
    created_at: "2023-03-10T09:15:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Pierre Moreau",
    email: "pierre.moreau@federation.fr",
    role: "coach",
    status: "active",
    joinDate: "2023-04-05",
    lastActive: new Date().toISOString(),
    videosUploaded: 19,
    phone: "04 91 23 45 67",
    club_name: "Cercle d'Escrime Marseille",
    bio: "Coach spécialisé en sabre, formateur de jeunes talents prometteurs.",
    avatar_url: "https://placehold.co/200x200?text=PM",
    last_login: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Il y a 3h
    created_at: "2023-04-05T11:20:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Sophie Bernard",
    email: "sophie.bernard@federation.fr",
    role: "coach",
    status: "active",
    joinDate: "2023-05-12",
    lastActive: new Date().toISOString(),
    videosUploaded: 24,
    phone: "05 61 23 45 67",
    club_name: "AS Escrime Toulouse",
    bio: "Coach régional, experte en épée et détection de talents.",
    avatar_url: "https://placehold.co/200x200?text=SB",
    last_login: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Il y a 12h
    created_at: "2023-05-12T16:45:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Antoine Martin",
    email: "antoine.martin@federation.fr",
    role: "coach",
    status: "active",
    joinDate: "2023-06-18",
    lastActive: new Date().toISOString(),
    videosUploaded: 15,
    phone: "05 56 78 90 12",
    club_name: "Cercle d'Escrime Bordeaux",
    bio: "Coach régional Nouvelle-Aquitaine, spécialisé en fleuret.",
    avatar_url: "https://placehold.co/200x200?text=AM",
    last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
    created_at: "2023-06-18T10:30:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Claire Petit",
    email: "claire.petit@federation.fr",
    role: "local_contact",
    status: "active",
    joinDate: "2023-07-22",
    lastActive: new Date().toISOString(),
    videosUploaded: 12,
    phone: "04 93 12 34 56",
    club_name: "Club Escrime Nice",
    bio: "Contact local pour la région PACA, collecte de vidéos de compétitions.",
    avatar_url: "https://placehold.co/200x200?text=CP",
    last_login: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Il y a 6h
    created_at: "2023-07-22T14:15:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "9",
    name: "Paul Durand",
    email: "paul.durand@federation.fr",
    role: "coach",
    status: "active",
    joinDate: "2023-08-30",
    lastActive: new Date().toISOString(),
    videosUploaded: 8,
    phone: "03 20 12 34 56",
    club_name: "Club Escrime Lille",
    bio: "Nouveau coach régional, en formation pour la détection de talents.",
    avatar_url: "https://placehold.co/200x200?text=PD",
    last_login: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 4 jours
    created_at: "2023-08-30T09:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Anne Muller",
    email: "anne.muller@federation.fr",
    role: "local_contact",
    status: "pending",
    joinDate: "2024-01-10",
    lastActive: new Date().toISOString(),
    videosUploaded: 0,
    phone: "03 88 12 34 56",
    club_name: "Cercle d'Escrime Strasbourg",
    bio: "Nouveau contact local en attente de validation.",
    avatar_url: "https://placehold.co/200x200?text=AM",
    last_login: null,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Jean Dupont",
    email: "jean.dupont@federation.fr",
    role: "coach",
    status: "active",
    joinDate: "2023-09-15",
    lastActive: new Date().toISOString(),
    videosUploaded: 21,
    phone: "01 45 67 89 01",
    club_name: "Cercle d'Escrime de Paris",
    bio: "Coach expérimenté, spécialisé dans l'entraînement des jeunes.",
    avatar_url: "https://placehold.co/200x200?text=JD",
    last_login: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Il y a 1h
    created_at: "2023-09-15T13:20:00Z",
    updated_at: new Date().toISOString(),
  },
]

