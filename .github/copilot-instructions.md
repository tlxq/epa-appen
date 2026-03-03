# Copilot Instructions

## Project Overview

EPA Appen is a React Native/Expo mobile app for EPA (Swedish moped-car) enthusiasts, paired with a Node.js/Express backend. Users register via invite-only, authenticate with JWT, and can browse gas stations/friends on a map. Car data is looked up via the NHTSA public API.

## Repository Structure

```
epa-appen/
├── backend/    # Express 5 API (Node.js ESM, Neon PostgreSQL)
└── mobile/     # React Native + Expo Router app (TypeScript)
```

## Commands

### Backend (`backend/`)
```bash
npm run dev     # nodemon (development)
npm start       # node src/server.js (production)
```

### Mobile (`mobile/`)
```bash
npx expo start          # start dev server (Expo Go / simulator)
npx expo start --ios    # iOS simulator
npx expo start --android
npx expo start -c       # clear cache and start
npm run lint            # expo lint (ESLint + Prettier via eslint-config-expo)
```

## Architecture

### Auth Flow
1. `mobile/app/index.tsx` redirects immediately to `/(auth)/login`
2. On successful login, JWT is stored in `AsyncStorage` under key `'jwt'`
3. The backend returns `{ token, user: { role } }` — the mobile app routes to `/(admin)/home` or `/(user)/home` based on `role`
4. Protected backend routes use `auth` middleware (Bearer JWT); admin routes additionally use `adminAuth`
5. Registration is invite-only: an admin POSTs to `/api/auth/invite` → email is sent via Resend → user registers with the token from the invite link

### Backend
- **Runtime**: Node.js with `"type": "module"` — all imports use ESM (`import`/`export`), file extensions required (`.js`)
- **Database**: Neon serverless PostgreSQL; accessed via tagged template literals: `` sql`SELECT ...` `` (never string concatenation)
- **Route layout**: `src/routes/` registers handlers, business logic lives in `src/services/`, auth in `src/middleware/`
- **Image uploads**: Multer buffers files in memory → uploaded to Cloudinary under `epa-appen/avatars/`, 3 MB limit
- **Port**: 5001 by default (`process.env.PORT`)

### Mobile
- **Routing**: Expo Router (file-based). Route groups: `(auth)`, `(admin)`, `(user)` with `(user)/(tabs)` for bottom tabs (home, map, profile)
- **API URL**: All fetch calls use `process.env.EXPO_PUBLIC_API_URL`, defaulting to `https://api.ttdevs.com`
- **JWT**: Stored/read from AsyncStorage key `'jwt'`; sent as `Authorization: Bearer <token>` header
- **Global state**: `CarProvider` (Context API) wraps the entire app in `app/_layout.tsx`; car data also persisted to AsyncStorage key `'myCar'`
- **Feature modules**: `mobile/features/<feature>/` each contain `components/`, `hooks/`, `services/`, `types.ts` — keep new features in this structure
- **Car lookup**: Uses the public NHTSA API (`https://vpic.nhtsa.dot.gov/api/vehicles`) — not the backend

## Key Conventions

- **Language**: UI strings and backend error messages are in **Swedish** (e.g., `'Fel inloggning'`, `'Användare hittades inte'`)
- **Backend errors**: Throw plain objects `{ status: number, message: string }` from services; routes catch and forward as `res.status(e.status || 500).json({ error: e.message })`
- **DB queries**: Always use the `` sql`...` `` tagged template from `src/config/db.js` — never raw string interpolation
- **TypeScript**: Only used in the mobile app; backend is plain JavaScript ESM
- **Styles**: React Native `StyleSheet.create()` inline per-file; no shared style library

## Environment Variables

### Backend (`.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token TTL (default `24h`) |
| `CLOUDINARY_*` | Cloudinary credentials |
| `RESEND_API_KEY` | Resend email service key |
| `FRONTEND_URL` | Allowed CORS origin |

### Mobile (`.env`)
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL (default: `https://api.ttdevs.com`) |

## Utility Scripts

- `backend/scripts/createAdmin.js` — seed an admin user directly
- `backend/scripts/createUser.js` — seed a regular user directly
