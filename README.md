# Sportz - Sports Match & Commentary Backend

## Introduction
Sportz is a high-performance backend application designed to manage and broadcast live sports matches and real-time commentary. 

**Note:** This is purely a backend project. It exposes robust REST APIs and a WebSocket server, making it fully ready for any frontend application (React, Vue, mobile apps, etc.) to be built on top of it.

## Key Features
* **Real-time WebSockets (`ws`)**: A highly optimized WebSocket server allows clients to subscribe to specific match updates, providing instantaneous delivery of new commentary and match creation events to the connected clients.
* **Advanced Security & Rate Limiting**: Integrated with **Arcjet** (`@arcjet/node`) to provide powerful HTTP and WebSocket security. It features:
  * Bot detection (allowing only verified search engines, previews, and tools).
  * Sliding window rate limiting to prevent abuse and DDoS attacks.
  * Attack shielding (currently configurable between `DRY_RUN` and `LIVE` modes).
* **Robust Data Layer**: Uses **Drizzle ORM** with **PostgreSQL** for type-safe database queries and migrations. The schema handles everything from match scheduling and scoring to detailed, granular commentary logs.
* **Strict Payload Validation**: Request payloads and query parameters are rigorously validated using **Zod**, ensuring data integrity and informative error handling.
* **Application Performance Monitoring (APM)**: Comes pre-configured with **ManageEngine APM Insight** (`apminsight`) to track performance bottlenecks, request tracing, and overall service health.
* **Cross-Origin Ready**: Pre-configured CORS policies to seamlessly support local development (e.g., frontend running on port 3000) and production deployments.

## Tech Stack
* **Runtime / Framework**: Node.js, Express.js
* **Database & ORM**: PostgreSQL, Drizzle ORM
* **Real-time**: `ws` (WebSockets)
* **Security**: Arcjet
* **Validation**: Zod
* **Monitoring**: APM Insight

## Getting Started

### Prerequisites
- Node.js (or Bun, as `bun.lock` is present)
- PostgreSQL Database
- Arcjet API Key

### Installation

1. Install the dependencies:
```bash
npm install
```

2. Environment Configuration:
Ensure you have a `.env` file at the root of your project. Required variables include:
```env
PORT=8000
HOST=0.0.0.0
ARCJET_KEY=your_arcjet_api_key
ARCJET_MODE=DRY_RUN # Switch to LIVE in production
# Database URL depending on your drizzle config
```

3. Database Migrations:
Use Drizzle to generate and apply your database schema:
```bash
npm run db:generate
npm run db:migrate
```

4. Start the Development Server:
```bash
npm run dev
```
- **HTTP API Server**: `http://localhost:8000`
- **WebSocket Server**: `ws://localhost:8000/ws`

## API Endpoints

### Matches (`/matches`)
* `GET /` - List recent matches (supports pagination via `limit` query).
* `POST /` - Create a new match. Automatically calculates match status and broadcasts `match_created` via WebSockets.

### Commentary (`/matches/:id/commentary`)
* `GET /` - Retrieve commentary timeline for a specific match ID.
* `POST /` - Add a new commentary event (e.g., goals, fouls). Automatically broadcasts the event to all WebSocket clients subscribed to this match.

## WebSocket Protocol
To interact with the real-time server, connect your client to `ws://localhost:8000/ws`.

**Messages you can send:**
* Subscribe to a match: `{"type": "subscribe", "matchId": 1}`
* Unsubscribe from a match: `{"type": "unsubscribe", "matchId": 1}`

**Messages you will receive:**
* Connection Welcome: `{"type": "welcome"}`
* Live Commentary (when subscribed): `{"type": "commentary", "data": {...}}`
* New Match Notifications (global): `{"type": "match_created", "data": {...}}`
