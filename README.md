# Dhaka Multi-Modal Route Planner
Build & run locally: **React (Vite) + Node/Express + MySQL + Leaflet (OpenStreetMap)**

## What it does
- Login (Admin or Regular) with live clock & role toggle
- Map of Dhaka (OpenStreetMap via Leaflet) with search for **From** and **To** and route display
- **Private transport** (rickshaw, cab, bike, car) time & cost estimates using OSRM (open routing) for shortest path
- **Public transport** (bus, train, metro) stored in MySQL by **Admin** with cost & average speed; users see suggestions for **time-efficient** and **cost-effective** routes
- Admin can:
  - See users, completed trips, and origin→destination stats
  - Add/Edit **Public Transport** routes (with stops and costs)
  - Configure **private transport** min/max per-minute price bands
  - **Block** routes (mark segments unusable) or open them in time windows

> ⚠️ Note: Public live routing is provided via the public OSRM API (no key). If you want more robust quotas, switch to OpenRouteService (set an API key in `.env` and the backend will prefer it).

## Prerequisites
- Node.js 18+
- MySQL 8+
- (Optional) Docker if you want to use `docker-compose`

## Quick start (no Docker)
1. **Install dependencies once**
   ```bash
   cd backend
   cp .env.example .env   # set DB_USER/DB_PASSWORD to match your MySQL login
   npm install
   ```
   ```bash
   cd ../frontend
   npm install
   ```
2. **Start services in separate terminals**
   ```bash
   # Terminal 1
   cd backend
   npm run dev
   ```
   ```bash
   # Terminal 2
   cd frontend
   npm run dev
   ```
   - API: **http://localhost:4000**
   - Web app: **http://localhost:5173** (Vite will print the exact URL)
   - First backend boot automatically creates the `dhaka_routes` schema (if missing), imports the full Dhaka public bus dataset, and refreshes the demo credentials.

### Fresh install checklist (recommended)
Follow these steps exactly on a clean machine to avoid the “Invalid credentials” popup:
1. Install **MySQL 8+** and ensure the service is running. Create a user with rights to create databases (or use `root`).
2. Install **Node.js 18 or newer**. (The project uses ES modules.)
3. In `backend/.env` set:
   ```env
   DB_HOST=localhost
   DB_USER=<your-mysql-user>
   DB_PASSWORD=<your-mysql-password>
   DB_NAME=dhaka_routes
   ```
   Leave `PRESERVE_CUSTOM_DEMO_PASSWORDS` unset unless you intentionally change the demo passwords.
4. From the repository root run the install commands shown above (`npm install` in both `backend/` and `frontend/`).
5. Start the backend (`npm run dev` inside `backend/`). Watch the console for the message `Database schema verified and seed data applied.`
6. (Optional) Confirm the data loaded:
   ```bash
   mysql -u <user> -p dhaka_routes -e "SELECT email, password_hash FROM users;"
   mysql -u <user> -p dhaka_routes -e "SELECT COUNT(*) FROM public_routes;"
   ```
   You should see the two demo emails and a count of **23** public routes (the 20 buses plus 3 legacy examples).
7. Start the frontend (`npm run dev` inside `frontend/`) and log in with:
   - Admin: `admin@example.com` / `admin123`
   - Regular: `user@example.com` / `user123`

If you ever reseed manually (`mysql < backend/sql/seed.sql`), restart the backend afterwards so it can refresh the hashes to the published defaults.

## Using Docker (optional)
- Edit the environment variables in `backend/.env.docker` if needed.
- Start everything:
  ```bash
  docker compose up -d --build
  ```
- App: `http://localhost:5173` | API: `http://localhost:4000` | phpMyAdmin: `http://localhost:8081`

## Demo Logins
- **Admin**: `admin@example.com` / `admin123`
- **Regular**: `user@example.com` / `user123`

## Notes
- Public transport data now seeds a curated set of Dhaka city bus lines (BRTC City Service, Tungipara Express, etc.) with geocoded stops so the planner can surface realistic public-route suggestions out of the box, and travel times use the actual stop-to-stop distances captured in that dataset. Extend or adjust them via Admin → “Public Transport Routes”.
- The backend skips any malformed stop geometry when computing public route metrics and falls back to the remaining valid segments, so reseeding or extending the dataset can never crash the suggestion API; invalid points are simply ignored when no finite lat/lon is present.
- When the API boots it now provisions the schema if needed, imports the Dhaka bus dataset, and ensures the demo `admin@example.com` / `admin123` and `user@example.com` / `user123` accounts exist. Password hashes are refreshed to those defaults on every start (set `PRESERVE_CUSTOM_DEMO_PASSWORDS=true` to opt out) so you can always sign in even on older databases.
- Private transport minute-price bands are editable under Admin → “Pricing”. Estimates show **min–max** cost.
- Blocks: mark segments blocked (with time window). The UI warns users and avoids recommending those segments in mixed routes.

---
Generated on 2025-10-06T13:52:56
