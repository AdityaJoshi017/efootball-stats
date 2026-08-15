# eFootball Stats - Complete Developer Guide

## 🎯 Project Overview

eFootball Stats is a full-stack football player statistics application that allows users to:
- Browse, search, and filter football player cards
- Compare player statistics
- Track leaderboards
- Add new players with automatic stat calculations
- Update player statistics in real-time
- Delete players (admin only)

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14.2.35 (React framework)
- TypeScript
- Tailwind CSS (styling)
- shadcn/ui (UI components)

**Backend:**
- Node.js with Express
- TypeScript
- Sequelize ORM
- PostgreSQL (Neon for production, SQLite for local)

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: Neon (PostgreSQL hosting)

### Project Structure

```
efootball-stats/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   │   └── add-player/    # Add new player form
│   ├── compare/           # Player comparison page
│   ├── page.tsx           # Landing page
│   ├── players/           # Player pages
│   │   ├── [id]/         # Individual player details
│   │   └── page.tsx      # Player listing
│   └── stats-update/     # Update player statistics
├── backend/              # Express backend
│   ├── src/
│   │   ├── controllers/  # API route handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models.ts     # Database models
│   │   ├── app.ts        # Express app setup
│   │   ├── server.ts     # Server entry point
│   │   └── db.ts         # Database connection
│   ├── api/              # Serverless entry (Vercel backup)
│   └── package.json
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── player-image.tsx # Player image component
├── lib/                 # Utility libraries
│   ├── api.ts           # API client
│   ├── imgur.ts         # Imgur integration
│   ├── players-data.ts  # Fallback hardcoded data
│   └── use-players.ts   # React hook for player data
└── public/              # Static assets (images)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- PostgreSQL (for production) or SQLite (for local)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/AdityaJoshi017/efootball-stats.git
cd efootball-stats
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Set up environment variables**

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ADMIN_TOKEN=dev-secret-token-change-in-production
NEXT_PUBLIC_IMGUR_CLIENT_ID=your-imgur-client-id
```

**Backend (backend/.env):**
```env
PORT=8000
DATABASE_URL=sqlite:./database.sqlite
ADMIN_TOKEN=dev-secret-token-change-in-production
CORS_ORIGIN=http://localhost:3000
```

5. **Start the backend**
```bash
cd backend
npm run dev
```

6. **Start the frontend**
```bash
cd ..
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Health: http://localhost:8000/health

## 📊 Database Schema

### Players Table
```typescript
{
  id: number (primary key, auto-increment)
  name: string
  team: string
  position: string
  age: number
  cardType: string
  cardSlug: string (unique identifier for each card)
  displayName: string (formatted display name)
  apps: number (appearances)
  goal: number (total goals)
  assists: number (total assists)
  image: string (image path or URL)
  createdAt: Date
  updatedAt: Date
}
```

### Matches Table
```typescript
{
  id: number (primary key, auto-increment)
  playerId: number (foreign key to players)
  matchDate: Date
  minutesPlayed: number
  goals: number
  assists: number
  shots: number (optional)
  passesCompleted: number (optional)
  passesAttempted: number (optional)
  xG: number (expected goals, optional)
  xA: number (expected assists, optional)
  createdAt: Date
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /test` - Test endpoint
- `GET /api/players` - List all players
- `GET /api/players/:id` - Get single player
- `GET /api/players/:id/matches` - Get player matches

### Admin Endpoints (Requires ADMIN_TOKEN)
- `POST /api/players` - Create new player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player
- `POST /api/players/:id/matches` - Add match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

## 🖼️ Image Handling

### Image Storage Strategy

**Two approaches supported:**

1. **External Image URLs (Recommended)**
   - Use Imgur, Cloudinary, or any image hosting service
   - Store full URLs in database
   - No file management needed

2. **Frontend Public Folder**
   - Store images in `public/` folder
   - Use ID-based naming: `{id}.jpg`
   - Accessible via frontend URL
   - Example: `https://efootball-stats-six.vercel.app/52.jpg`

### Image URL Conversion

The backend automatically converts relative paths to full URLs:
- Input: `/52.jpg`
- Output: `https://efootball-stats-six.vercel.app/52.jpg`

This happens in the API responses, so the frontend just displays whatever URL is provided.

## 📈 Statistical Calculations

### Automatic Calculations

The system automatically calculates:
- **Goals + Assists**: Total attacking contributions
- **Goals per Match**: `goals / appearances`
- **Assists per Match**: `assists / appearances`
- **Goals + Assists per Match**: `(goals + assists) / appearances`

### Calculation Logic

```typescript
// From aggregate data (stored in player record)
const stats = {
  gPm: goal / apps,
  aPm: assists / apps,
  gAPm: (goal + assists) / apps
}

// From match data (detailed per-match performance)
const stats = {
  gPm: totalGoals / totalMatches,
  aPm: totalAssists / totalMatches,
  gAPm: (totalGoals + totalAssists) / totalMatches
}
```

## 🔐 Authentication

### Admin Token System

Simple token-based authentication for admin operations:
- Set `ADMIN_TOKEN` in environment variables
- Include token in request headers: `x-admin-token: your-token`
- Required for create, update, delete operations

## 🎨 Frontend Components

### Key Components

- **Player Card**: Displays player info with image
- **Player List**: Grid view of all players with filtering
- **Player Detail**: Full player statistics and matches
- **Comparison Tool**: Side-by-side player comparison
- **Leaderboards**: Top players by various metrics
- **Admin Forms**: Add/update/delete players

### State Management

- React hooks for local state
- Custom `usePlayers` hook for API data
- URL parameters for filtering and selection
- Fallback to hardcoded data if API unavailable

## 🚢 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Backend URL
   - `NEXT_PUBLIC_ADMIN_TOKEN`: Admin token
   - `NEXT_PUBLIC_IMGUR_CLIENT_ID`: Imgur client ID (optional)
3. Deploy automatically on push to main branch

### Backend (Render)

1. Connect GitHub repository to Render
2. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `ADMIN_TOKEN`: Admin token
   - `CORS_ORIGIN`: Frontend URL
4. Deploy automatically on push to main branch

### Database (Neon)

1. Create Neon account
2. Create PostgreSQL database
3. Copy connection string
4. Set as `DATABASE_URL` in Render environment

## 🔄 Data Import

### Import from Frontend Data

```bash
cd backend
$env:DATABASE_URL="postgresql://..." npm run import-players
```

This imports hardcoded player data from `lib/players-data.ts` into the database.

## 🐛 Troubleshooting

### Common Issues

**Backend not starting:**
- Check environment variables
- Verify database connection
- Check port availability

**Images not displaying:**
- Verify image URLs are accessible
- Check CORS configuration
- Ensure image paths are correct

**API calls failing:**
- Check CORS origin settings
- Verify admin token for protected routes
- Check network connectivity

## 📝 Development Workflow

1. **Make changes** to frontend or backend
2. **Test locally** with `npm run dev`
3. **Commit changes** with descriptive messages
4. **Push to GitHub**
5. **Auto-deploy** to Vercel (frontend) and Render (backend)
6. **Test deployed** versions

## 🎯 Key Features

### Player Management
- Multiple cards for same footballer (different teams/positions)
- Unique database IDs for each card
- Automatic stat calculations
- Image support via URLs or public folder

### User Features
- Search and filter players
- Compare statistics side-by-side
- View leaderboards
- Real-time stat updates

### Admin Features
- Add new players with image support
- Update player statistics
- Delete players
- Manage match data

## 🛠️ Technologies Used

### Frontend
- **Next.js**: React framework with SSR
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern UI components
- **Lucide React**: Icon library

### Backend
- **Express**: Web framework
- **TypeScript**: Type safety
- **Sequelize**: ORM for database operations
- **PostgreSQL**: Production database
- **SQLite**: Local development database
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### DevOps
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **Neon**: PostgreSQL hosting
- **Git**: Version control
- **GitHub**: Code repository

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

This project was developed with assistance from **Windsurf** and **Devin AI**. The codebase demonstrates modern full-stack development practices and can serve as a learning resource for developers.

## 📄 License

This project is open source and available for educational purposes.

---

**Built with ❤️ using Windsurf and Devin AI**