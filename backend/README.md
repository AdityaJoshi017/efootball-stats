# Efootball-Stats Backend API

A Node.js/TypeScript backend API for managing football player statistics with automatic calculation of performance metrics.

## Features

- ✅ Player CRUD operations with image upload
- ✅ Automatic calculation of derived stats (g+a, g per 90, a per 90, g+a per 90, etc.)
- ✅ Match-level performance tracking
- ✅ Admin authentication for protected endpoints
- ✅ SQLite database (easily upgradeable to PostgreSQL)
- ✅ File upload support for player images

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Sequelize
- **Authentication**: Token-based admin auth

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd backend
npm install
cp .env.template .env
```

### Configuration

Edit `.env` file:

```env
PORT=8000
NODE_ENV=development
DATABASE_PATH=./data.db
ADMIN_TOKEN=your-secret-admin-token
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Seeding the Database

```bash
npm run seed
```

## API Endpoints

### Base URL
```
http://localhost:8000
```

### Public Endpoints

#### Health Check
```http
GET /health
```

#### List All Players
```http
GET /api/players
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "lionel messi",
    "team": "barcelona",
    "position": "CF",
    "age": 34,
    "cardType": "epic-big time",
    "apps": 1426,
    "goal": 1002,
    "assists": 445,
    "image": "/1.jpg",
    "createdAt": "2026-08-10T17:00:00.000Z",
    "updatedAt": "2026-08-10T17:00:00.000Z",
    "stats": {
      "apps": 1426,
      "goals": 1002,
      "assists": 445,
      "gPlusA": 1447,
      "gPm": 0.702665,
      "aPm": 0.312062,
      "gAPm": 1.014727,
      "xG90": 0.632,
      "xA90": 0.265,
      "dribbles": 3565,
      "keyPasses": 1335,
      "defensiveActions": 1711,
      "progressivePasses": 4991,
      "shotCreatingActions": 3618,
      "goalCreatingActions": 1736
    }
  }
]
```

#### Get Single Player
```http
GET /api/players/:id
```

**Response:**
```json
{
  "player": { /* player object */ },
  "matches": [ /* array of match objects */ ],
  "stats": { /* calculated stats object */ }
}
```

#### Get Player Matches
```http
GET /api/players/:id/matches
```

### Admin-Protected Endpoints

All admin endpoints require the `x-admin-token` header:
```http
x-admin-token: your-secret-admin-token
```

#### Create Player
```http
POST /api/players
Content-Type: multipart/form-data
x-admin-token: your-secret-admin-token
```

**Form Data:**
- `name` (string, required)
- `team` (string)
- `position` (string)
- `age` (number, required)
- `cardType` (string, required)
- `apps` (number)
- `goal` (number)
- `assists` (number)
- `image` (file, optional)

**Response:**
```json
{
  "player": { /* created player object */ },
  "stats": { /* auto-calculated stats */ }
}
```

#### Update Player
```http
PUT /api/players/:id
Content-Type: multipart/form-data
x-admin-token: your-secret-admin-token
```

Same form data as create player.

#### Delete Player
```http
DELETE /api/players/:id
x-admin-token: your-secret-admin-token
```

#### Add Match
```http
POST /api/players/:id/matches
Content-Type: application/json
x-admin-token: your-secret-admin-token
```

**Request Body:**
```json
{
  "matchDate": "2026-08-10",
  "minutesPlayed": 90,
  "goals": 2,
  "assists": 1,
  "shots": 5,
  "passesCompleted": 45,
  "passesAttempted": 50,
  "xG": 1.5,
  "xA": 0.8
}
```

**Response:**
```json
{
  "match": { /* created match object */ },
  "stats": { /* recalculated stats based on all matches */ }
}
```

#### Update Match
```http
PUT /api/matches/:id
Content-Type: application/json
x-admin-token: your-secret-admin-token
```

Same request body as add match.

#### Delete Match
```http
DELETE /api/matches/:id
x-admin-token: your-secret-admin-token
```

## Auto-Calculated Statistics

The backend automatically calculates the following statistics:

### Basic Stats
- `gPlusA`: Goals + Assists
- `gPm`: Goals per match (goals / apps)
- `aPm`: Assists per match (assists / apps)
- `gAPm`: Goals + Assists per match ((goals + assists) / apps)

### Advanced Stats (Estimated)
- `xG90`: Expected goals per 90 minutes (gPm * 0.9)
- `xA90`: Expected assists per 90 minutes (aPm * 0.85)
- `dribbles`: Estimated dribbles (apps * 2.5)
- `keyPasses`: Estimated key passes (assists * 3)
- `defensiveActions`: Estimated defensive actions (apps * 1.2)
- `progressivePasses`: Estimated progressive passes (apps * 3.5)
- `shotCreatingActions`: Estimated shot-creating actions ((goals + assists) * 2.5)
- `goalCreatingActions`: Estimated goal-creating actions ((goals + assists) * 1.2)

When match-level data is available, the system uses actual match data instead of estimates for more accurate calculations.

## File Upload

- **Allowed formats**: JPEG, JPG, PNG, WebP
- **Max file size**: 5MB (configurable)
- **Storage**: Local filesystem (configurable for cloud storage)
- **URL format**: `/uploads/filename.ext`

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL DEFAULT 'N/A',
  position VARCHAR(255),
  age INTEGER NOT NULL,
  cardType VARCHAR(255) NOT NULL,
  apps INTEGER DEFAULT 0,
  goal INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  image VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### Matches Table
```sql
CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playerId INTEGER NOT NULL,
  matchDate DATETIME NOT NULL,
  minutesPlayed INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  passesCompleted INTEGER DEFAULT 0,
  passesAttempted INTEGER DEFAULT 0,
  xG FLOAT DEFAULT 0,
  xA FLOAT DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (playerId) REFERENCES players(id)
);
```

## Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/       # API route handlers
│   ├── middleware/       # Auth, upload middleware
│   ├── utils/           # Stats calculation utilities
│   ├── models.ts        # Database models
│   ├── db.ts            # Database connection
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── scripts/
│   └── seed.ts          # Database seeding script
├── uploads/             # File upload directory
├── package.json
├── tsconfig.json
└── .env.template
```

### Testing

Run the API test script:
```bash
node test-api.js
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change the default ADMIN_TOKEN** in production
2. **Use HTTPS** in production
3. **Implement proper authentication** (JWT/OAuth) instead of simple tokens
4. **Add rate limiting** for admin endpoints
5. **Validate and sanitize** all user inputs
6. **Use cloud storage** (S3, R2) for file uploads in production
7. **Implement proper RBAC** for multi-user scenarios
8. **Add request logging** and monitoring

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Change ADMIN_TOKEN to a strong secret
- [ ] Configure proper CORS origins
- [ ] Set up cloud storage for file uploads
- [ ] Enable HTTPS
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure database backups

### Docker Deployment

```bash
# Build
docker build -t efootball-stats-backend .

# Run
docker run -p 8000:8000 --env-file .env efootball-stats-backend
```

## Troubleshooting

### Database locked error
```bash
# Delete the database file and reseed
rm data.db
npm run seed
```

### Port already in use
```bash
# Change PORT in .env file
PORT=8001
```

### File upload not working
- Check `uploads/` directory permissions
- Verify `MAX_FILE_SIZE` in .env
- Check file format restrictions

## API Examples

### Using cURL

#### Get all players
```bash
curl http://localhost:8000/api/players
```

#### Add player (without image)
```bash
curl -X POST http://localhost:8000/api/players \
  -H "Content-Type: application/json" \
  -H "x-admin-token: dev-secret-token-change-in-production" \
  -d '{
    "name": "New Player",
    "team": "Team Name",
    "position": "CF",
    "age": 25,
    "cardType": "epic",
    "apps": 100,
    "goal": 50,
    "assists": 25
  }'
```

#### Add player with image
```bash
curl -X POST http://localhost:8000/api/players \
  -H "x-admin-token: dev-secret-token-change-in-production" \
  -F "name=New Player" \
  -F "team=Team Name" \
  -F "position=CF" \
  -F "age=25" \
  -F "cardType=epic" \
  -F "apps=100" \
  -F "goal=50" \
  -F "assists=25" \
  -F "image=@/path/to/image.jpg"
```

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
