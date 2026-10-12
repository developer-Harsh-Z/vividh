# Runbook

How to set up the accounts, deploy, back up, hand over and move to college servers. Create every account with a **club `@ltsu.ac.in` address**, not a personal one, so the club keeps it after handover.

## Environment variables

All are listed with comments in [`.env.example`](../.env.example).

| Variable | Required | Notes |
| --- | --- | --- |
| `APP_URL` | yes | Public URL, e.g. `https://vividh.example.in` |
| `DATABASE_URL` | yes | PostgreSQL connection string (use Neon's **pooled** string) |
| `SESSION_SECRET` | yes | 32+ random bytes: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | yes | OAuth client (below) |
| `ALLOWED_DOMAIN` | yes | `ltsu.ac.in` |
| `USET_SUFFIX` | yes | `.uset@ltsu.ac.in` |
| `OWNER_EMAILS` | yes | Comma-separated; these become owners on first sign-in, and may sign in even from outside `ALLOWED_DOMAIN` (useful during setup; switch to the President's and Faculty Coordinator's LTSU addresses before launch) |
| `S3_ENDPOINT` / `S3_BUCKET` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` / `S3_REGION` | yes | R2 or MinIO |
| `S3_PUBLIC_ENDPOINT` | optional | Storage address browsers use, when it differs from the server's (Docker on college servers) |
| `DRIVE_SA_EMAIL` / `DRIVE_SA_KEY` | for Drive | Service account (below) |
| `DRIVE_UPLOAD_FOLDER_ID` | optional | Club folder for phone-upload originals; if unset, originals stay in the bucket |
| `CRON_SECRET` | yes | Random string; the retry cron sends it |
| `DEV_LOGIN` | dev only | `1` enables the no-Google login. Ignored in production |

## One-time account setup

### Google sign-in

1. Create a project in Google Cloud Console, ideally inside the `ltsu.ac.in` organisation.
2. Set up the OAuth consent screen. Choose **Internal** if the project is in the LTSU organisation (no Google review needed); otherwise choose External with only the `openid email profile` scopes.
3. Create an OAuth client of type *Web application*. Authorised redirect URI: `<APP_URL>/auth/callback` (add `http://localhost:3000/auth/callback` for development).

### Google Drive (import and originals)

1. In the same project, enable the **Google Drive API**.
2. Create a service account and a JSON key. Put `client_email` in `DRIVE_SA_EMAIL` and `private_key` in `DRIVE_SA_KEY` (keep the `\n` line breaks).
3. Share each event folder (or the whole parent folder) with the service account email as *Viewer*.
4. For phone-upload originals, create a folder inside a **Shared Drive** (service accounts have no storage of their own, so a normal My Drive folder won't work), add the service account as *Content manager*, and put the folder's ID in `DRIVE_UPLOAD_FOLDER_ID`.

### Database (Neon)

Create a project in the region nearest India (Singapore). Copy the **pooled** connection string into `DATABASE_URL`. Then run `npx prisma migrate deploy` once from your machine or CI.

Make the activity log append-only by running this as the database owner, replacing `app_user` with the role the app connects as:

```sql
REVOKE UPDATE, DELETE, TRUNCATE ON "ActivityLog" FROM app_user;
```

### Storage (Cloudflare R2)

1. Create a bucket, e.g. `vividh-media`, and keep it **private**.
2. Create an R2 API token with read and write access to that bucket. The endpoint is `https://<account-id>.r2.cloudflarestorage.com` and the region is `auto`.
3. Add a CORS rule so browsers can upload directly:

```json
[{ "AllowedOrigins": ["https://YOUR-DOMAIN"], "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
```

### Hosting (Vercel)

Import the GitHub repo, set the environment variables, and deploy. The build command is the default (`npm run build`).

### Cloudflare in front of the site

- Point the domain's DNS through Cloudflare (proxied).
- Cache rule: if the request has **no** `vs` cookie and the path starts with `/`, `/events`, `/team` or `/media`, then cache eligible, with an edge TTL of 60 seconds for pages (media uses the app's own headers).
- Rate-limit rules: `/auth/*` at 10 requests per minute per IP; `/removal` and `/join` POSTs at 5 per minute.
- Turn on Bot Fight Mode.

### Retry cron (GitHub Actions)

In the repo, add the secrets `APP_URL` and `CRON_SECRET`. The workflow `.github/workflows/jobs.yml` then calls `/api/jobs` every 15 minutes.

## Deploying

Merging to `master` runs CI (type check, unit checks, build, Docker image). Vercel deploys `master` automatically. Run any new migrations with `npx prisma migrate deploy` **before** the deploy that needs them.

Rollback: in Vercel, "Promote" the previous deployment. Database migrations should be additive (add columns, don't rename) so a rollback still works.

## Backups

- Neon keeps point-in-time history; check how far back your plan goes.
- Weekly: `pg_dump "$DATABASE_URL" > vividh-$(date +%F).sql`, stored in the club Drive.
- Originals already live in Drive. The bucket holds only derived copies, which can be rebuilt.
- Once a term, restore a dump into a scratch database and open the site against it.

## Handover (each year)

On the console's **Admin → Overview** page, check:

- [ ] The new President signs in and is made an owner by an existing owner.
- [ ] The Faculty Coordinator is still an owner.
- [ ] Outgoing office-bearers' admin access is removed.
- [ ] GitHub organisation, Vercel, Neon, Cloudflare and Google Cloud are all owned by the club account, and the new President has access.
- [ ] The pending media queue and open removal requests are empty.
- [ ] Last backup is less than a week old.

## Moving to college servers

1. Ask IT for: two VMs (4 vCPU, 8 GB RAM) or a Kubernetes namespace, 500 GB of disk, a subdomain with SSL, and outbound internet access (Google sign-in and Drive).
2. Clone the repo on the server, create `.env` with real secrets (set `S3_PUBLIC_ENDPOINT` to the public storage address and `APP_URL` to the new domain), and run `docker compose --profile full up -d`. This starts PostgreSQL, MinIO, runs migrations, then starts the app.
3. Copy the data: `pg_dump` from Neon and `psql` into the new database; `rclone sync r2:vividh-media minio:vividh-media`.
4. Cut over: pause uploads (set the event list to archived for an hour), do a final sync, point DNS at the new servers, and sign in to check.
5. Keep the cloud copy read-only for 30 days, then delete it.
