# Electrician App

This app now uses Supabase for:

- Authentication (email/password + Google OAuth)
- Session handling (auto persisted and refreshed)
- Database-backed services, bookings, and profiles

## Setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Install dependencies:
   - `npm install`
4. Start app:
   - `npm run dev`

## Supabase Tables Expected

- `profiles` with columns: `id (uuid, pk)`, `email`, `full_name`, `avatar_url`
- `services` with columns: `id`, `name`, `description`, `category`, `keywords`
- `bookings` with columns:
  - `id`
  - `user_id` (fk to auth user)
  - `service_id` (fk to services)
  - `scheduled_at`
  - `notes`
  - `status`
  - `created_at`

## Project Structure

- `src/lib/supabaseClient.js` - single Supabase client instance
- `src/context/AuthProvider.jsx` - user/session/profile state
- `src/hooks/useAuth.js` - shared auth hook
- `src/services/*.js` - modular API/database operations
- `src/pages/*` - UI connected to services
