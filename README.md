# Seekers

A closed, invite-only community platform for vetted business professionals. Members can discover each other in a curated directory, make trusted referrals, list their businesses, browse a knowledge hub, attend community events, and engage with exclusive initiatives — all within a tight-knit, high-trust network.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Database & Auth | Supabase (PostgreSQL + GoTrue) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |
| Email | Resend (transactional emails) |

---

## Features

- **Invite-only onboarding** — members join via a personal invite code; admin approves each application
- **Member directory** — searchable, filterable directory of verified professionals with public profiles
- **Business listings** — members can list their business with a catalogue, bio, social links, and an enquiry form
- **Referrals** — structured referral flow (Initiated → Accepted → Contacted → In Progress → Closed) with optional fee tracking
- **Community hub**
  - Events (with RSVP)
  - Knowledge posts (share articles/guides, mark as helpful)
  - Initiatives (charitable/community drives with donate/contact links)
- **Leaderboard** — ranks members by referrals sent and received
- **Spotlight** — admin-curated featured business shown on the home feed
- **Admin panel** — approve members, manage businesses, review flagged content
- **PWA-ready** — web app manifest + mobile-optimised layout

---

## Project Structure

```
seekers_final/
├── app/                        # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/          # Authenticated routes (home, directory, community, etc.)
│   │   │   ├── admin/          # Admin panel
│   │   │   ├── auth/           # Sign-in, callback
│   │   │   ├── api/            # API routes (enquiry, referrals, knowledge reactions, etc.)
│   │   │   ├── onboarding/     # New-member onboarding flow
│   │   │   ├── join/           # Invite code redemption
│   │   │   └── business/       # Public business profile pages
│   │   ├── components/         # Shared UI components
│   │   └── lib/                # Supabase clients, auth helpers, utilities
│   └── .env.local              # Environment variables (see below)
├── supabase/
│   ├── migrations/             # SQL schema migrations
│   ├── seed_demo.sql           # Demo data seed (10 members, 8 businesses, events, etc.)
│   └── seed_demo_teardown.sql  # Removes all demo data cleanly
└── vercel.json                 # Vercel deployment config
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (or use the credentials already in `.env.local`)

### Install & run locally

```bash
cd app
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Base URL of the app |
| `SUPABASE_DB_PASSWORD` | Postgres password for direct DB access |
| `CRON_SECRET` | Secret to authenticate scheduled job requests |
| `WS_LEAD_ENCRYPTION_KEY` | AES key for lead data encryption |

---

## Database

Schema lives in `supabase/migrations/`. Key tables:

| Table | Purpose |
|---|---|
| `profiles` | Member profiles (linked to `auth.users`) |
| `business_profiles` | Business listings |
| `catalogue_items` | Products/services per business |
| `referrals` | Referral records between members and businesses |
| `events` / `event_rsvps` | Community events and attendance |
| `initiatives` | Charitable / community drives |
| `knowledge_posts` / `knowledge_reactions` | Knowledge hub posts and helpful reactions |
| `spotlights` | Admin-curated featured content |
| `reviews` | Member reviews of businesses |
| `categories` | Business categories |

### Seed demo data

```bash
# Connect to Supabase and run:
psql "host=db.<project>.supabase.co port=5432 dbname=postgres user=postgres sslmode=require" \
  -f supabase/seed_demo.sql

# To remove all demo data:
psql "..." -f supabase/seed_demo_teardown.sql
```

---

## Deployment

The app is configured for Vercel. Push to `main` and Vercel will auto-deploy. Set the same environment variables in the Vercel dashboard for production.

---

## Admin Access

After seeding demo data, sign in with any of the seeded member emails (format `member1@seekers.demo` through `member10@seekers.demo`, password `Seekers#1234@`). The first seeded member (`member1`) has admin privileges.
