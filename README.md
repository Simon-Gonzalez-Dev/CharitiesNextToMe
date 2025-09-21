# CharitiesNextToMe

A modern, full-stack web application that connects Canadians with local charitable organizations through an interactive social platform. Built with Next.js 14, Supabase, and TypeScript, featuring real-time authentication, interactive maps, and social engagement features.

## 🚀 Features

### Core Functionality
- 🔐 **Secure Authentication** - Email/password and OAuth integration with Supabase Auth
- 🗺️ **Interactive Map View** - Geolocation-based charity discovery
- 🔍 **Advanced Search & Filtering** - Find charities by location, category, and keywords
- 👥 **Social Features** - Follow, like, and engage with charitable organizations
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark Mode Support** - User preference-based theme switching

### Technical Features
- ⚡ **Server-Side Rendering** - Next.js 14 with App Router
- 🔄 **Real-time Updates** - Supabase real-time subscriptions
- 🛡️ **Row Level Security** - Database-level security policies
- 📊 **Data Visualization** - Interactive charts and analytics
- 🎨 **Modern UI Components** - shadcn/ui component library
- 🔧 **Type Safety** - Full TypeScript implementation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3+
- **UI Library**: React 18.2+
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context + Custom Hooks

### Backend & Database
- **Backend-as-a-Service**: Supabase
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (for file uploads)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **CSS Processing**: PostCSS with Autoprefixer
- **Build Tool**: Next.js built-in bundler

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or yarn/pnpm)
- **Git** for version control
- **Supabase Account** - [Create one here](https://supabase.com)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/charities-next-to-me.git
cd charities-next-to-me
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For production deployments
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Setup

Run the database migrations in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration script from `supabase/migrations/sql_on_database`

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Architecture

### Directory Structure

```
charities-next-to-me/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── signin/              # Sign-in page
│   │   └── signup/              # Sign-up page
│   ├── feed/                    # Social feed page
│   ├── map/                     # Interactive map view
│   ├── profile/                 # User profile pages
│   ├── search/                  # Charity search page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── auth/                    # Authentication components
│   │   ├── auth-forms.tsx       # Sign-in/Sign-up forms
│   │   └── user-dropdown.tsx    # User menu dropdown
│   ├── navigation/              # Navigation components
│   │   └── nav-menu.tsx         # Main navigation menu
│   ├── ui/                      # UI component library
│   │   └── button.tsx           # Button component
│   └── navigation.tsx           # Navigation wrapper
├── lib/                         # Utility libraries
│   ├── context/                 # React Context providers
│   │   └── auth-context.tsx     # Authentication context
│   ├── supabase/                # Supabase configuration
│   │   └── client.ts            # Supabase client setup
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.ts              # Authentication types
│   │   └── supabase.ts          # Supabase types
│   └── utils.ts                 # Utility functions
├── public/                      # Static assets
├── styles/                      # Additional stylesheets
├── supabase/                    # Database configuration
│   └── migrations/              # Database migration files
│       └── sql_on_database      # Initial schema
├── .env.local                   # Environment variables (gitignored)
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.js            # PostCSS configuration
└── package.json                 # Dependencies and scripts
```

### Database Schema

#### Tables

**profiles**
- `id` (UUID, Primary Key) - References auth.users
- `email` (TEXT, Unique) - User email address
- `full_name` (TEXT) - User's display name
- `avatar_url` (TEXT) - Profile picture URL
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

**user_settings**
- `user_id` (UUID, Primary Key) - References auth.users
- `theme` (TEXT) - User's theme preference (light/dark)
- `notifications_enabled` (BOOLEAN) - Notification settings
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

#### Security Policies

- **Row Level Security (RLS)** enabled on all tables
- **Public read access** for profiles
- **User-specific access** for settings and profile updates
- **Automatic profile creation** via database triggers

### Authentication Flow

1. **User Registration**: Email/password signup with profile creation
2. **User Login**: Email/password authentication
3. **Session Management**: Automatic session refresh and persistence
4. **Profile Management**: User profile and settings updates
5. **Logout**: Secure session termination

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (if using Supabase CLI)
supabase start       # Start local Supabase
supabase db reset    # Reset local database
supabase gen types   # Generate TypeScript types
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting (if configured)
- **Import Organization**: Absolute imports with `@/` alias

### Component Guidelines

- Use functional components with TypeScript
- Implement proper error boundaries
- Follow accessibility best practices
- Use Tailwind CSS for styling
- Leverage shadcn/ui components when possible

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- **Netlify**: Compatible with Next.js static export
- **Railway**: Full-stack deployment with database
- **DigitalOcean**: VPS deployment with Docker

### Environment Variables

Ensure all required environment variables are set in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Type checking
npm run type-check
```

### Test Coverage

- Component unit tests with React Testing Library
- Integration tests for authentication flows
- E2E tests for critical user journeys

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/session` - Get current session

### Database Operations

All database operations are handled through Supabase client:

```typescript
// Example: Fetch user profile
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.io/) - Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

For support, email support@charitiesnexttome.com or join our Discord community.

---

**Built with ❤️ for the Canadian charitable community** 
