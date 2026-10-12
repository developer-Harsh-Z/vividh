# VIVIDH

The website of **VIVIDH (विविध)**, the social media club of the University School of Engineering and Technology (USET), Lamrin Tech Skills University.

It has a public showcase (team, events, albums, recruitment), a portal where members and invited students upload event media, and an admin console for running the club.

## Quick start

Requirements: Node 24, plus Docker for the local database and storage. (No Docker? Point `DATABASE_URL` at any PostgreSQL 16, such as a free Neon database.)

```bash
cp .env.example .env          # defaults work for local dev
docker compose up -d db minio # PostgreSQL + S3-compatible storage
npm install
npm run db:migrate            # create tables
npm run db:seed               # sample events, members and tags
npm run dev                   # http://localhost:3000
```

With `DEV_LOGIN=1` in `.env`, the login page lets you sign in as any `@ltsu.ac.in` address without Google. This works only in development.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run check` | Type-check and run the unit checks (this also runs in CI) |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Load sample data (dev only) |

## Layout

```
docs/            PRD, architecture, design system, decisions, runbook
prisma/          database schema, migrations, seed
public/          logo and static files
src/app/         pages, server actions and API routes (Next.js App Router)
  page.tsx, events/, team/, join/, removal/   public pages
  portal/        signed-in pages: dashboard, upload, profile, search
  admin/         admin console (all writes in admin/actions.ts)
  auth/          Google sign-in routes
  media/         permission-checked photo and video delivery
  api/           health check and the retry cron
src/lib/         database, auth, storage, Drive, image processing, form helpers, rules
src/components/  shared components (motion, theme, lightbox, uploader)
public/home, public/teams   stand-in photos from the design mockup: replace with real ones
```

## Docs

- [Product requirements](docs/PRD.md) (a living copy also exists as a shared doc)
- [Architecture](docs/ARCHITECTURE.md): how the system fits together and scales
- [Design system](docs/DESIGN.md): type, color, motion, components
- [Decisions](docs/DECISIONS.md): what we chose and why
- [Runbook](docs/RUNBOOK.md): accounts, deployment, backups, handover, moving to college servers
- [Contributing](CONTRIBUTING.md)
