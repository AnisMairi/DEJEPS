# Youth Fencing Platform

A comprehensive web platform designed for youth fencing video management and athlete development. This application provides coaches, administrators, and local contacts with tools to manage athletes, upload and analyze competition videos, and track performance metrics.

## 🏗️ Project Overview

The Youth Fencing Platform is built with modern web technologies to provide a seamless experience for managing youth fencing activities. It features role-based access control, video management capabilities, and comprehensive athlete tracking.

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based access control** with three user types:
  - **Local Contact**: Basic access to view athletes and videos
  - **Coach**: Enhanced access to manage athletes and upload videos
  - **Administrator**: Full platform management capabilities
- Secure authentication system with session management
- Protected routes based on user roles

### 👥 Athlete Management
- **Comprehensive athlete profiles** with detailed information
- **Advanced filtering** by weapon type, skill level, age group, and region
- **Search functionality** to quickly find specific athletes
- **Performance tracking** with rankings and recent activity
- **Club and coach associations**

### 🎥 Video Management
- **Video upload and storage** for competition footage
- **Advanced video filtering** by weapon, competition type, and tags
- **Public and private video visibility** settings
- **Video analytics** with view counts and comments
- **Real-time search and filtering** capabilities

### 📊 Dashboard & Analytics
- **Role-based dashboard content** tailored to user permissions
- **Performance statistics** and key metrics
- **Recent activity tracking**
- **Quick access to main features**

### 🎨 User Interface
- **Modern, responsive design** using Tailwind CSS
- **Dark/Light theme support** with system preference detection
- **Accessible components** built with Radix UI primitives
- **Mobile-friendly interface** with responsive layouts

### 🔧 Administrative Tools
- **Platform management interface** for administrators
- **User management capabilities**
- **System configuration options**

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3.4.17** - Utility-first CSS framework

### UI Components
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful, customizable icons
- **Tailwind CSS Animate** - Animation utilities

### Form & Validation
- **React Hook Form** - Performant forms with minimal re-renders
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation resolvers

### Additional Libraries
- **date-fns** - Date utility library
- **recharts** - Composable charting library
- **sonner** - Toast notifications
- **next-themes** - Theme management
- **react-dropzone** - File upload handling

## 📁 Project Structure

```
fencing-federation-frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Administrative interface
│   ├── athletes/          # Athlete management pages
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Authentication pages
│   ├── messages/          # Messaging system
│   ├── notifications/     # Notification center
│   ├── videos/            # Video management pages
│   ├── gdpr/              # GDPR compliance pages
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── admin/            # Administrative components
│   ├── athlete/          # Athlete-related components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared components
│   ├── dashboard/        # Dashboard components
│   ├── evaluation/       # Evaluation components
│   ├── gdpr/             # GDPR components
│   ├── layout/           # Layout components
│   ├── messaging/        # Messaging components
│   ├── notifications/    # Notification components
│   ├── ui/               # shadcn/ui components
│   ├── video/            # Video-related components
│   └── theme-provider.tsx # Theme context provider
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth-context.tsx  # Authentication context
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── Configuration files
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** or **pnpm** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fencing-federation-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Static production build (output in `out/`)
- `npm run preview` - Serve the `out` folder locally (after build)
- `npm run lint` - Run ESLint for code quality checks

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory for environment-specific configuration:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=your_api_url_here
```

### Tailwind CSS Configuration
The project uses a custom Tailwind configuration with:
- CSS variables for theming
- Custom color palette
- Animation utilities
- Responsive design utilities

### shadcn/ui Configuration
The project is configured with shadcn/ui components using:
- TypeScript support
- Tailwind CSS integration
- Lucide React icons
- Custom component aliases

## 🎨 Theming

The application supports both light and dark themes with:
- **System preference detection**
- **Manual theme switching**
- **CSS variables** for consistent theming
- **Smooth transitions** between themes

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop computers** (1024px and above)
- **Tablets** (768px - 1023px)
- **Mobile devices** (below 768px)

## 🔒 Security Features

- **Role-based access control** (RBAC)
- **Protected routes** with authentication checks
- **Session management** with localStorage
- **Input validation** with Zod schemas
- **XSS protection** through React's built-in security

## 🧪 Testing

The project includes configuration for:
- **TypeScript** type checking
- **ESLint** code quality checks
- **Next.js** built-in testing capabilities

## 📦 Deployment (Cloudflare Pages)

This app is built as a **static export** (`next.config` uses `output: "export"`). There is no Node server: deploy the `out` folder as static assets.

1. **Build:** `pnpm build` (or `npm run build`)
2. **Output directory:** `out`
3. **Cloudflare Dashboard:** Workers & Pages → Create → Connect your Git repository (or upload `out`).
4. **Build settings:** Framework preset can be “None” or Next.js with custom output — set **Build command** to `pnpm install && pnpm build` and **Build output directory** to `out`.

Optional: after a local build, preview with `pnpm preview` (serves the `out` folder on port 3000).

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style Guidelines
- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Write **descriptive commit messages**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the inline code comments
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub Discussions for general questions

## 🔮 Roadmap

### Planned Features
- [ ] **Real-time messaging** between users
- [ ] **Advanced video analytics** with performance metrics
- [ ] **Mobile application** for iOS and Android
- [ ] **Integration with fencing federations** APIs
- [ ] **Advanced reporting** and analytics dashboard
- [ ] **Multi-language support** (French, English, Spanish)

### Technical Improvements
- [ ] **Unit and integration tests** with Jest and Testing Library
- [ ] **Performance optimization** with Next.js Image optimization
- [ ] **PWA capabilities** for offline functionality
- [ ] **Advanced caching** strategies
- [ ] **API rate limiting** and security enhancements

---

**Built with ❤️ for the fencing community** 