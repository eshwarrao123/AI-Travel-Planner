# Trao — AI Travel Planner

## Project Overview
Multi-user AI travel planner. Users register, log in, create trip plans with destination/days/budget/interests. Gemini AI generates day-by-day itinerary, budget estimate, hotel suggestions, and smart packing checklist.

## Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 + TypeScript | App Router, SSR, type safety |
| Styling | Tailwind CSS + Inline Styles | Rapid styling, no CSS conflicts |
| Backend | Node.js + Express | Lightweight, fast REST API |
| Database | MongoDB + Mongoose | Flexible schema for itinerary data |
| Auth | JWT + bcryptjs | Stateless, scalable authentication |
| AI | Google Gemini 2.5 Flash | Native JSON mode, fast generation |

## Local Setup
Backend:
```bash
cd backend
cp .env.example .env  # fill in your values
npm install
npm run dev
```

Frontend:
```bash
cd frontend
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Architecture
Client (Next.js) → JWT in headers → Express API → Auth Middleware → Controllers → Gemini API + MongoDB

All trip queries filter by userId — strict data isolation.

## Authentication & Authorization
- Passwords hashed with bcryptjs (saltRounds: 12)
- JWT signed with 7-day expiry
- Every protected route runs auth middleware
- Every DB query includes userId filter
- `getPublicTrip` strips userId from response

## AI Agent Design
- Model: Gemini 2.5 Flash (chosen for native JSON mode)
- `responseMimeType: "application/json"` forces structured output
- Exponential backoff: 5 retries (1s, 2s, 4s, 8s, 16s)
- Prompt specifies exact JSON schema matching MongoDB schema
- Separate endpoint for day regeneration with user feedback

## Creative Feature: AI Weather-Aware Packing Assistant
Problem: Travelers forget essential items suited to their destination climate and planned activities.
Solution: When generating a trip, the AI analyzes the destination, season, and activity types to create a smart packing checklist divided by category. Users can check items off and the state persists to MongoDB in real-time.

## Bonus Feature: Trip Share
Each trip has a public read-only URL (`/trip/[id]`) that requires no authentication. The userId field is stripped from the public response for privacy.

## Key Design Decisions
1. **userId isolation**: Every query filters by userId — not just "find by ID" but "find by ID AND userId"
2. **Sanitization**: Gemini responses sanitized before MongoDB save to handle unexpected category values
3. **Optimistic updates**: UI updates immediately on add/remove activity, then syncs with backend
4. **Inline styles**: Used to avoid Tailwind parsing conflicts with Next.js 16 Turbopack

## Known Limitations
- No real weather API (uses Gemini's climate knowledge)
- Share links are public — no password protection
- No pagination on trips list
- Packing list generated once at trip creation

## Deployed URLs
Frontend: [your-vercel-url]
Backend: [your-render-url]
