# Vercel Deployment Guide

This backend is configured for deployment on Vercel as a serverless function.

## Step-by-Step Deployment

### 1. Push Backend to GitHub
The backend code is already in the main repository at `D:\efootball-stats\efootball-stats\backend`.

### 2. Create Vercel Project
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository (AdityaJoshi017/efootball-stats)
4. **Important**: Set "Root Directory" to `backend`
5. Click "Deploy"

### 3. Set Up Vercel Postgres Database (Recommended)
1. After deploying the backend, go to your Vercel project dashboard
2. Click on the "Storage" tab in the left sidebar
3. Click "Create Database"
4. Select "Postgres" (Vercel Postgres)
5. Choose a region (select same region as your function for best performance)
6. Click "Create"

Vercel will automatically:
- Create a PostgreSQL database
- Add the `POSTGRES_URL` environment variable to your project
- Handle database management and backups

### 4. Configure Environment Variables
Go to your Vercel project → Settings → Environment Variables and add:

**Required Variables:**
- `ADMIN_TOKEN`: Your secure admin token (e.g., `your-secure-admin-token-123`)
- `CORS_ORIGIN`: Your frontend URL (e.g., `https://efootball-stats-six.vercel.app`)

**Database Variables (auto-added by Vercel Postgres):**
- `POSTGRES_URL`: Automatically added by Vercel Postgres
- `POSTGRES_PRISMA_URL`: Also added automatically

**Note:** The backend is configured to use `POSTGRES_URL` as `DATABASE_URL` automatically.

### 5. Install PostgreSQL Dependency
The backend needs the `pg` package for PostgreSQL support. Run:

```bash
cd backend
npm install pg
```

Then commit and push the updated `package.json`.

### 6. Import Your Existing Data
To migrate your existing SQLite data to Vercel Postgres:

1. Export your local SQLite data:
```bash
cd backend
npm run import-players
```

2. Or use the seed script to populate the database:
```bash
npm run seed
```

The backend will automatically create tables on first deployment.

### 7. Test the Backend
After deployment, test your backend:
- Visit `https://your-backend-url.vercel.app/health`
- Visit `https://your-backend-url.vercel.app/api/players`

### 8. Update Frontend Environment Variables
1. Go to your frontend Vercel project (efootball-stats-six)
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_API_URL`: Your backend Vercel URL (e.g., `https://your-backend-url.vercel.app`)
   - `NEXT_PUBLIC_ADMIN_TOKEN`: Same as backend ADMIN_TOKEN
   - `NEXT_PUBLIC_IMGUR_CLIENT_ID`: Your Imgur client ID (optional, for image uploads)
4. Redeploy frontend

### 9. Imgur Setup (Optional but Recommended)
For image uploads via Imgur:

1. Go to https://imgur.com/register
2. Register for a free account
3. Go to https://api.imgur.com/oauth2/addclient
4. Fill in:
   - Application name: "efootball-stats"
   - Application type: "Anonymous usage without user authorization"
   - Authorization callback URL: `https://your-frontend-url.vercel.app`
5. Click "Submit"
6. Copy the "Client ID"
7. Add to frontend environment variables: `NEXT_PUBLIC_IMGUR_CLIENT_ID`

## Current Configuration

- **Runtime**: Node.js serverless function
- **Entry Point**: `api/index.ts`
- **Routes**: All routes handled by Express app
- **Image Handling**: Accepts image URLs + Imgur upload
- **Database**: SQLite (local) / PostgreSQL (Vercel Postgres)
- **Build**: TypeScript compilation
- **Start**: Serverless function handler

## Notes

- The backend will automatically handle database initialization
- Vercel Postgres handles backups and scaling automatically
- Serverless functions may have execution time limits (up to 60 seconds on Hobby plan)
- Monitor Vercel logs for any runtime issues
- Environment variables changes require redeployment

## Troubleshooting

**Database connection issues:**
- Ensure `POSTGRES_URL` is set in environment variables
- Check Vercel logs for connection errors
- Verify database region matches function region

**CORS issues:**
- Ensure `CORS_ORIGIN` matches your frontend URL exactly
- Include protocol (https://) and no trailing slash

**Image upload issues:**
- Ensure Imgur client ID is set
- Check image file size (max 10MB)
- Verify network connectivity