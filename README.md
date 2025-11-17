# Quiz Tournament Platform

A modern, interactive quiz platform featuring worldcup-style tournaments with a stunning 2026-style UI. Users can create custom quizzes, play tournaments, and vote for their favorites in head-to-head matchups.

## Features

### Core Functionality
- **Worldcup Tournament System**: Bracket-style elimination tournaments where users choose between pairs
- **Quiz Discovery**: Browse, search, and filter quizzes by category, popularity, and recency
- **Quiz Creation**: Multi-step wizard for creating custom tournaments with items and images
- **User Authentication**: Secure email/password authentication with JWT sessions
- **Real-time Stats**: Track play counts, views, wins/losses for each item

### UI/UX Highlights
- **2026-Style Design**: Modern glassmorphism, gradients, and smooth animations
- **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- **Framer Motion**: Smooth page transitions and interactive animations
- **Dark Mode**: Beautiful dark theme with neon accents
- **Skeleton Loaders**: Smooth loading states throughout the app

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide Icons** for beautiful icons

### Backend
- **Next.js API Routes** (Route Handlers)
- **PostgreSQL** database
- **Prisma ORM** for database access
- **bcrypt** for password hashing
- **JWT** for session management

### Authentication
- Custom JWT-based authentication
- HttpOnly cookies for security
- Protected routes middleware
- Session persistence

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uwuwu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example env file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your database:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/quiz_tournament?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**

   Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

   Run migrations (create the database schema):
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   │   └── auth/         # Authentication endpoints
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── create-game/      # Quiz creation wizard (TODO)
│   │   ├── worldcup/[slug]/  # Play quiz page (TODO)
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── layout/           # Layout components (Navbar, Footer)
│   │   ├── quiz/             # Quiz-related components
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── prisma.ts         # Prisma client singleton
│   │   └── utils.ts          # Utility functions
│   └── middleware.ts         # Next.js middleware for auth
├── .env                      # Environment variables
├── .env.example              # Example environment variables
└── package.json              # Dependencies
```

## Database Schema

### Core Models

**Users**
- Authentication and profile data
- Role-based access (user, moderator, admin)
- Preferences (language, NSFW filter)

**Quizzes**
- Title, description, cover image
- Creator, category, language
- Visibility settings (public, unlisted, private)
- Play counts and statistics

**Quiz Items**
- Individual items in a quiz
- Name, description, image
- Order index for display

**Game Sessions**
- Track individual play sessions
- Store final winner
- Anonymous play support

**Matches**
- Individual head-to-head matchups
- Round and match tracking
- Winner selection

**Item Stats**
- Win/loss counts per item
- Match participation
- Champion count (finals wins)

**Reports**
- User-submitted content reports
- Moderation system
- Status tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Quizzes (TODO)
- `GET /api/quizzes` - List quizzes with filters
- `GET /api/quizzes/[id]` - Get quiz details
- `POST /api/quizzes` - Create new quiz (protected)
- `PUT /api/quizzes/[id]` - Update quiz (protected)
- `DELETE /api/quizzes/[id]` - Delete quiz (protected)

### Game Sessions (TODO)
- `POST /api/sessions` - Start new game session
- `POST /api/sessions/[id]/match` - Submit match result
- `GET /api/sessions/[id]` - Get session details

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js 16 setup with TypeScript
- [x] Prisma schema design
- [x] Authentication system
- [x] UI component library
- [x] Home page with discovery
- [x] Login/Register pages

### Phase 2: Core Features (Next)
- [ ] Create game wizard
- [ ] Worldcup game logic
- [ ] Game session management
- [ ] Item statistics tracking
- [ ] User profiles

### Phase 3: Enhanced Features
- [ ] Real database integration with quiz API
- [ ] Image upload (Cloudinary/S3)
- [ ] Advanced search functionality
- [ ] Category management
- [ ] NSFW filtering
- [ ] Report system

### Phase 4: Social Features
- [ ] Comments on quizzes
- [ ] Favorites/bookmarks
- [ ] User follows
- [ ] Leaderboards
- [ ] Achievements

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev    # Create and apply migrations
npx prisma generate  # Generate Prisma Client
```

## Design System

### Colors
- **Primary**: Purple (`#a855f7`)
- **Accent**: Cyan (`#22d3ee`)
- **Background**: Dark gradient
- **Card**: Glassmorphism with blur

### Typography
- **Font**: Inter (system sans-serif fallback)
- **Headings**: Bold, large with gradient text option
- **Body**: Regular, good contrast

### Effects
- **Glassmorphism**: `backdrop-blur` with semi-transparent backgrounds
- **Gradients**: Linear gradients from primary to accent
- **Glow**: Box shadows with primary color
- **Animations**: Smooth transitions with Framer Motion

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**Note**: This is an "inspired by" clone built for educational purposes. It does not copy branding, logos, or exact wording from the original platform.
