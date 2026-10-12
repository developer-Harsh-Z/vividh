# Decisions

D1–D16 were settled in the [PRD](PRD.md). D17 onward were made while building, mostly to keep the code smaller. Each one notes when to revisit it.

## From the PRD

| # | Decision | Chosen |
| --- | --- | --- |
| D1 | Platform | Custom web app, built by student devs |
| D2 | Hosting | Free cloud tiers during the build and pilot, then college servers |
| D3 | Stack | Next.js + TypeScript + PostgreSQL + Prisma, shipped as a Docker image |
| D4 | Login | Google, `@ltsu.ac.in` only. USET students end in `.uset@ltsu.ac.in` |
| D5 | Public vs. private | Showcase pages public; portal needs sign-in |
| D6 | Who uploads | Members, plus students invited to a specific event |
| D7 | Moderation | Everything is pending until an admin approves it |
| D8 | Media storage | Originals in Google Drive; the site keeps display copies and thumbnails in S3-compatible storage |
| D9 | Video | Clips up to 50 MB; longer videos are links |
| D10 | Recruitment | Built in; USET students apply during a window |
| D11 | Ownership | Two owners minimum: the President and the Faculty Coordinator |
| D12 | v1 scope | Six areas; badges, counters and calendar in v1.1 |
| D13 | Scale | Designed for 20,000 users, 2,000 at once, 99.9% uptime |
| D14 | Portability | Open standards only: containers, PostgreSQL, S3 API, OAuth |
| D15 | Background jobs | Stored in PostgreSQL, retried by a scheduled GitHub Action |
| D16 | Drive import | Admins paste a Drive folder link; photos import as pending |

## Made while building

| # | Decision | Why | Revisit when |
| --- | --- | --- | --- |
| D17 | **Our own Google sign-in** (about 100 lines in `src/lib/auth.ts`) instead of Auth.js | Auth.js v5 is still in beta, and we need one provider plus a domain check. Sessions are an HMAC-signed cookie; the role is read from the database on every request, so revoking access takes effect immediately | We need a second login provider, or LTSU's own SSO (that's also OpenID Connect, so the same code mostly applies) |
| D18 | **Plain CSS with design tokens** instead of Tailwind and shadcn/ui | The design is already a token system (see [DESIGN.md](DESIGN.md)). Native `<dialog>`, `<details>` and form controls cover our needs, so there's no build step or component library | The UI grows past what one stylesheet keeps tidy |
| D19 | **The job queue is the `Media.status` column** (`processing` + `attempts`), not a separate jobs table | Image processing is the only background job. A cron route retries stuck items | A second kind of background job appears |
| D20 | **`aws4fetch` for storage** instead of the AWS SDK | We need signed GET/PUT/DELETE only; `aws4fetch` is about 10 KB and speaks the S3 API to R2 and MinIO alike | We need multipart uploads (files over 100 MB) |
| D21 | **Private bucket; media served through `/media/[id]/[size]`**, which checks permission and streams the file | A pending or members-only file can't be reached by guessing a URL. Public approved files are sent with cache headers, so the CDN absorbs repeat traffic | Bandwidth through the app becomes a cost problem; then serve public files from a public bucket |
| D22 | **Drive access through a service account** that the event folders are shared with | No sensitive Google scopes on every user's sign-in, and no Google app verification needed | The college wants per-user Drive permissions |
| D23 | **iPhone HEIC photos are converted by the phone**: the file picker only accepts JPEG, PNG, WebP, MP4 and MOV, so iOS sends JPEG | The `sharp` image library's prebuilt binaries can't decode HEIC | Desktop users need to upload HEIC files directly |
| D24 | **Profile photo comes from the member's Google account** | Saves a second upload flow in v1 | Members ask for custom photos |
| D25 | **Application form is one page with sections**, not multi-step | Same fields, less code, and works without JavaScript | Applicants drop off on the long form |
| D26 | **Public pages are dynamic; Cloudflare caches them** for signed-out visitors (cache rule in the [runbook](RUNBOOK.md)) | No cache-invalidation code in the app | Pages need instant updates after admin edits; then add `revalidatePath` |
| D27 | **Search uses case-insensitive `contains`** on caption, tags and event title | Enough for tens of thousands of items | Search gets slow; add `pg_trgm` indexes, then Meilisearch |
| D28 | **No ESLint**; the CI gate is the TypeScript check, unit checks and a production build | Fewer moving parts | The team grows past a handful of devs |
