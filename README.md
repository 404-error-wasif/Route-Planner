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
1. **Create database & seed**
   - Create a DB named `dhaka_routes` in MySQL.
   - Run the SQL files:
     ```bash
     mysql -u root -p < backend/sql/schema.sql
     mysql -u root -p dhaka_routes < backend/sql/seed.sql
     ```
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env   # update DB credentials (and optionally ORS key)
   npm i
   npm run dev
   ```
   Default runs on **http://localhost:4000**
3. **Frontend**
   ```bash
   cd ../frontend
   npm i
   npm run dev
   ```
   Open the shown URL (usually **http://localhost:5173**).

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
- When the API boots it ensures the demo `admin@example.com` / `admin123` and `user@example.com` / `user123` accounts exist (without overwriting custom passwords), so login keeps working even if a seed import fails halfway through.
- Private transport minute-price bands are editable under Admin → “Pricing”. Estimates show **min–max** cost.
- Blocks: mark segments blocked (with time window). The UI warns users and avoids recommending those segments in mixed routes.

---
Generated on 2025-10-06T13:52:56
