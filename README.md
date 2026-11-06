# Nexa Music

Nexa Music is a responsive React music-discovery app with a separate Express API. Search across songs, artists, and genres; browse categories; choose a mood; save liked tracks; and keep a queue in the selected mood.

## Requirements

- Node.js 20.19 or newer
- npm
- A YouTube Data API v3 key for live search and recommendations

## Run locally

1. Install dependencies from the project root:

   ```bash
   npm run install:all
   ```

2. Copy `backend/.env.example` to `backend/.env` and add your YouTube API key:

   ```env
   PORT=3000
   YOUTUBE_API_KEY=your_key_here
   SEARCH_REGION=IN
   CACHE_TTL_SECONDS=900
   FRONTEND_ORIGINS=http://localhost:5173
   ```

3. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`. The API health check is at `http://localhost:3000/api/health`.

The frontend uses the Vite `/api` proxy while developing. For separate hosting, set `VITE_API_BASE_URL` in `frontend/.env.local` to the backend URL and add the frontend origin to `FRONTEND_ORIGINS` in the backend environment.

## Production build

```bash
npm run build
npm start
```

The backend serves the built frontend from `frontend/dist` on the configured `PORT`.

## Deploy to Vercel (1-Click & Free Tier)

This app is configured to deploy directly to [Vercel](https://vercel.com) with both the React frontend and Express Serverless API together under a single URL!

1. Push this repository to your GitHub account: `https://github.com/Suvam760/spotify-clone`.
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **Add New…** → **Project** and import `spotify-clone`.
4. Vercel will automatically read `vercel.json`:
   - **Framework Preset**: Other
   - **Build Command**: `node scripts/build.js`
   - **Output Directory**: `frontend/dist`
5. Under **Environment Variables**, add:
   - `YOUTUBE_API_KEY` = *your YouTube API key*
6. Click **Deploy**. Vercel will build the frontend and deploy the Express API as a serverless function at `/api/*` on your free `https://your-project.vercel.app` domain.

## Deploy to Render (1-Click & Free Tier)

This app is configured to deploy as a unified service on [Render](https://render.com) (the backend serves both the API and the optimized frontend build).

### Option 1: Automatic Blueprint (Recommended)
1. Push this repository to your GitHub account.
2. In Render, click **New +** → **Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml` and configure the service.
4. Add your `YOUTUBE_API_KEY` when prompted and click **Apply**.

### Option 2: Manual Web Service
1. In Render, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `nexa-music` (or any name)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `YOUTUBE_API_KEY` = *your YouTube API key*
5. Click **Deploy Web Service**. Render will build and deploy your app with a free HTTPS URL.

## Music playback and mood matching

Search, trending categories, and mood mixes use the official YouTube Data API. Playback uses YouTube's visible embedded player; Nexa does not download or extract audio streams. The mood mix maps the selected vibe to a music search and Mood Autoplay advances within that queue. Liked songs and recent tracks are stored in the browser.

Keep API keys in `backend/.env`. Do not commit that file or put the key in frontend code.
