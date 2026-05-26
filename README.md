# Botanica 🌿

A personal plant care companion with AI-powered identification, health diagnostics, and watering reminders.

## Features

- **AI Plant Identification** — Upload photos and Claude identifies species, care requirements, toxicity, and more
- **Health Diagnostics** — Photo-based health checks with diagnosis, treatment recommendations, and urgency scoring
- **Watering Reminders** — Daily cron job creates notifications for due/overdue plants
- **Plant Journal** — Chronological timeline of care events, notes, and photos
- **Rooms View** — Organise plants by location with overdue alerts per room
- **Propagation Guides** — AI-generated step-by-step propagation instructions per species
- **Seasonal Tips** — Monthly care advice from Claude on the dashboard
- **In-app Notifications** — Bell icon with unread count, quick "mark watered" action
- **Browser Push Notifications** — Optional, requires VAPID keys

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Node.js, Express |
| Database | SQLite via better-sqlite3 |
| AI | Anthropic Claude API (vision) |
| Auth | JWT (30-day tokens) |
| Scheduling | node-cron (daily 08:00) |
| File uploads | multer, local disk |

## Quick Start

### 1. Clone & install

```bash
cd botanica
npm run install:all
```

### 2. Configure environment

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...    # Required for AI features
JWT_SECRET=some-long-random-string
PORT=3001

# Optional — browser push notifications
# Generate with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:your@email.com
```

### 3. Seed the database (optional but recommended)

Creates a demo user with 4 example plants:

```bash
npm run seed
```

Demo credentials: `demo@botanica.app` / `demo1234`

### 4. Start the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
botanica/
├── client/              # React + Vite frontend
│   └── src/
│       ├── api/         # Axios client
│       ├── components/  # Shared UI components
│       ├── context/     # Auth context
│       └── pages/       # Route-level pages
└── server/              # Express backend
    ├── middleware/      # JWT auth middleware
    ├── routes/          # API route handlers
    ├── services/        # Claude AI + cron jobs
    ├── uploads/         # Uploaded images (gitignored)
    ├── database.js      # SQLite schema + init
    ├── index.js         # Server entry point
    └── seed.js          # Demo data seed script
```

## API Routes

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in, receive JWT
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/profile` — Update name / password

### Plants
- `GET /api/plants` — List plants (supports `?room=&difficulty=&sort=`)
- `POST /api/plants/identify` — AI identify from uploaded photos
- `POST /api/plants` — Save plant to collection
- `GET /api/plants/:id` — Plant detail + photos + latest health check
- `PUT /api/plants/:id` — Update plant details
- `DELETE /api/plants/:id` — Delete plant
- `POST /api/plants/:id/water` — Mark as watered
- `POST /api/plants/:id/photos` — Add photos
- `DELETE /api/plants/:id/photos/:photoId` — Remove photo
- `POST /api/plants/:id/health-check` — Run AI health check
- `GET /api/plants/:id/health-checks` — Health check history
- `POST /api/plants/:id/propagate` — Generate propagation guide

### Journal
- `GET /api/journal/:plantId` — Get journal entries
- `POST /api/journal/:plantId` — Add manual entry

### Notifications
- `GET /api/notifications` — List notifications + unread count
- `PUT /api/notifications/:id/read` — Mark one as read
- `PUT /api/notifications/read-all` — Mark all as read
- `DELETE /api/notifications/:id` — Delete notification

### Other
- `GET /api/rooms` — Plants grouped by room with overdue counts
- `GET /api/dashboard` — Stats, water-today list, seasonal tip

## Notes

- Images are stored in `server/uploads/` and served as static files
- The SQLite database file is at `server/botanica.db`
- The cron job runs at 08:00 daily (server time) — to test immediately, restart the server
- Plant identification works best with clear, well-lit photos of a single plant
- Without an Anthropic API key, AI features will return errors (the rest of the app functions normally)
