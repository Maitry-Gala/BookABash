# BookABash — Event Ticket Booking App

A simplified event ticket booking system with seat reservation, countdown timers, and booking confirmation.

---

## Tech Stack

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose  
**Frontend:** React, TypeScript, Tailwind CSS, Vite, Axios

---

## Getting Started

---

### Backend

```bash
cd backend
npm install
```

Create a `.env` file reference to env.exammple 

Seed the database with sample events:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file reference to env.exammple 

## Assumptions

* No payment flow — booking confirmation is the final step
* No seat categories (all seats are general not like gold,silver,platinum,etc)
* One active reservation per user per event at a time
* Events are created via seed script, not via API
* No email confirmation after booking

## Design Decisions

* MongoDB transactions for atomic seat locking — prevents double booking at DB level, not just application level
* TTL index on expiresAt — MongoDB auto-cleans expired reservation docs, no cron job needed
* Seats as individual documents — makes atomic status updates per seat simple and clean, easier to query grid state
* 410 vs 404 for expired reservations — more accurate HTTP semantics, frontend can handle them differently
* Zod + Mongoose validation both kept — Zod validates at request boundary, Mongoose is DB-level safety net
* seatNumbers array on Reservation — one reservation holds multiple seats, mirrors real-world booking flow like BookMyShow
* seedSeatsForEvent pattern — seats are created when event is created, not on demand, so seat grid is always ready
