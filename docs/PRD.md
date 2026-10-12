# VIVIDH Club Website — PRD v1.0

Oct 10, 2026 · @HarshVardhanSingh

## Summary and decisions

VIVIDH builds its own website from scratch: a public showcase plus a members' portal in one Next.js app. It's built and piloted on the cloud now, then pitched to the club and the college and moved onto college servers. It is designed from day one for 20,000 users with 2,000 online at once and 99.9% uptime, using only open standards so the move needs no rewrite. Every student and staff member has an @ltsu.ac.in Google account, so sign-in limited to that domain covers everyone. The build and pilot run on free tiers only (₹0 a month), and the college's existing event folders in Google Drive feed straight into the archive. Version 1 covers six areas: team, events, media archive, recruitment, admin console and activity log.

| # | Decision | Chosen | Why | Rejected |
| --- | --- | --- | --- | --- |
| D1 | Platform | Custom web app, built by student devs | The club owns its data, public pages and login, and the code passes from batch to batch | claude.ai artifacts (no public access), no-code builders (vendor lock-in, paid tiers) |
| D2 | Hosting | Free cloud tiers during the build and pilot (₹0 a month), then college servers as soon as it's ready | No money needed to start; the college takes over once the site is proven | Paid cloud, or waiting for college IT before building |
| D3 | Stack | Next.js + PostgreSQL + Prisma + Auth.js; a Docker image is built on every merge | One language (TypeScript); the same code runs serverless now and in containers on college servers | Separate frontend and API (twice the work), Firebase (cannot be self-hosted) |
| D4 | Login | Google sign-in for @ltsu.ac.in accounts only, checked on the server. USET students are recognised by addresses ending in .uset@ltsu.ac.in | No passwords stored; the domain proves the person belongs to LTSU, and the suffix proves they're in USET | Any Google account, email magic links |
| D5 | Public vs. private | Showcase pages are public and served from the CDN cache; the portal needs sign-in | Visitors see the club; media and personal data stay private until approved | Fully private, or fully public |
| D6 | Who uploads | Members, plus USET students invited to a specific event | Wide enough to collect coverage, narrow enough to moderate | Any student (heavy moderation), members only (loses coverage) |
| D7 | Moderation | Every upload or import is pending until an admin approves it | Protects student privacy and the club's name | Post first, remove later |
| D8 | Media storage | Full-size originals stay in Google Drive (the college's existing event folders, or a club Shared Drive). The site keeps only small display copies and thumbnails, in S3-compatible storage | Uses the storage the college already has, keeps the site within free tiers, and doesn't change how the college works | Copying every original onto the site |
| D9 | Video | Clips up to 50 MB stored; longer videos linked (YouTube or Drive) | Keeps storage and bandwidth predictable | Hosting full videos |
| D10 | Recruitment | Built in, open to signed-in USET students during a window | College login lets anyone apply; accepting an applicant creates a member | External Google Form (data in two places) |
| D11 | Ownership and handover | Two owners: the President and the Faculty Coordinator. Club-owned GitHub organisation and cloud accounts, registered to a club @ltsu.ac.in address. Formal handover each year | The Faculty Coordinator provides continuity across batches of students | One owner (the President) |
| D12 | v1 scope | Six areas; badges, counters and calendar in v1.1 | Ship a complete smaller site rather than half-finish a bigger one | Everything in v1 |
| D13 | Scale target | Designed and load-tested for 20,000 users, 2,000 at once and 99.9% uptime on college servers. The free tiers carry the pilot | The design is the same at both sizes; only the hardware changes | Sizing for the club alone |
| D14 | Portability | Open standards only: containers, PostgreSQL, S3 API, OpenID Connect. No features that only work on one vendor | Moving to college servers is a config change, not a rewrite | Vendor-only services (Vercel KV or Blob, Firebase) |
| D15 | Background jobs | Jobs table in PostgreSQL; a serverless function processes each job, and a scheduled GitHub Action retries failed ones every 15 minutes. On college servers, a long-running worker | No extra service to run, and free | Redis or RabbitMQ (one more moving part) |
| D16 | Drive import | Admins paste an event's Drive folder link; the site imports its photos as Pending, linking each one back to its original | Matches how the college already stores event media, so there's no double work | Asking people to upload everything again |

## Background, problems and goals

VIVIDH (विविध, "diverse") is the social media club of USET. It runs the department's Instagram (lamrin\_uset), covers events live, and produces videos, posters and campaigns. It has six teams: Leadership, Ideation, Content Writing, Creative Making, Videography and Photography, and Editing. Recruitment runs once a year, and again whenever the club needs people.

**Problems**

- Event photos and videos are spread across personal phones, chats and drives, so they get lost.
- Members, roles and contributions are tracked informally, and the knowledge leaves with each outgoing batch.
- Recruitment runs on ad hoc forms and DMs, with no single list to review.
- The club has no home beyond its Instagram feed.

**Goals for v1**

1. A public home that shows who VIVIDH is and what it has done.
2. One archive for event media that members can upload to, browse and search.
3. Recruitment from application to acceptance in one place.
4. A console that lets the next president take over in one meeting.

**Non-goals for v1**

- Posting to Instagram, or pulling analytics from it.
- Hosting long videos.
- Payments, fees or treasury.
- A native mobile app (the site works on phones instead).
- Badges, counters, the content calendar and coverage requests (planned for v1.1).

## Users and permissions

There are five roles. Each one adds to the role above it, except a Contributor, who uploads only to the events they're invited to. Roles are stored on the user record, and the server checks them on every request, not just in the interface.

| Role | Who | How they get it |
| --- | --- | --- |
| Visitor | Anyone, not signed in | Default |
| Student | Anyone signed in with an @ltsu.ac.in account | First sign-in |
| Contributor | A student invited to upload for one event | An admin invites them; the invite expires 14 days after the event |
| Member | An active club member | An admin accepts their application or adds them |
| Admin | Office-bearers chosen by the owners | An owner grants it |
| Owner | The President and the Faculty Coordinator (minimum two) | An existing owner grants it; the last owner cannot remove themselves |

| Action | Visitor | Student | Contributor | Member | Admin | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| View public team, events and approved albums | Yes | Yes | Yes | Yes | Yes | Yes |
| Apply during an open recruitment window |  | Yes | Yes |  |  |  |
| Upload media to an event |  |  | Invited event only | Any event | Any event | Any event |
| See and delete own pending uploads |  |  | Yes | Yes | Yes | Yes |
| Search the full archive, including member-only albums |  |  |  | Yes | Yes | Yes |
| Edit own profile (bio, photo, skills, links, visibility) |  |  |  | Yes | Yes | Yes |
| Approve or reject media, edit any tags |  |  |  |  | Yes | Yes |
| Manage members, events, recruitment |  |  |  |  | Yes | Yes |
| Grant or remove admin and owner |  |  |  |  |  | Yes |

## Brainstorm: what made the cut

Seventeen feature ideas were scored on their impact for the club and the effort to build them. The nine in the top half are v1; the rest wait until the archive and recruitment are proven.

*(Diagram: feature brainstorm · impact vs. effort — see the [living PRD](https://claude.ai/code/artifact/4786db62-76a0-435e-a544-b9df04b7947a).)*

Badges and counters only mean something once the site holds real data, so they move to v1.1 rather than shipping with nothing behind them. AI tagging and Instagram sync need outside APIs and upkeep the club can't guarantee from batch to batch.

## v1 feature requirements

Version 1 has six feature areas, each with acceptance criteria a tester can check. "Admin" below also covers Owner.

### F1. Public showcase

- Home page: club intro, the six teams, recent event albums, and recruitment status (open with a deadline, or closed with the next expected month).
- Pages: Home, Team, Events, Event detail, Join, About. Each has a shareable URL and Open Graph preview tags so links look good on Instagram and WhatsApp.
- Only approved media from events an admin marked **Public** appears on public pages.
- Black-and-white theme taken from the club logo, with light and dark modes that follow the system setting and can be toggled.

*Acceptance:* a signed-out visitor sees no pending media, no members-only album and no contact details.

### F2. Team and profiles

- Member cards grouped by team, each with photo, name, role and team. Clicking a card opens the profile: bio, skill tags, events covered and links (Instagram, LinkedIn, portfolio).
- Skill tags come from a list admins maintain, so tags stay consistent (no "reels" next to "Reels"). Clicking a tag filters the team page.
- A member can belong to more than one team, with one marked as primary.
- Members edit their own bio, photo, skills and links. Only admins change role, team or status.
- **Public visibility is a choice each member makes:** a full card, name only, or hidden. The default is name only until the member opts in.
- An Alumni section lists former members by batch year.

*Acceptance:* filtering by a tag shows only members with that tag, and clearing it restores the full list. A member cannot change their own role through the interface or the API.

### F3. Events

- Event fields: title, date, venue, type (workshop, fest, seminar, competition, other), description, cover image and visibility (Public or Members-only).
- The events grid filters by type and year and searches by title. Upcoming and past are worked out from the date, never stored.
- The event page shows the album, a "covered by" list linking to member profiles, and related reel and video links.
- Admins create, edit and archive events. An event with media cannot be deleted, only archived.

*Acceptance:* combining a type filter and a year filter shows only events that match both.

### F4. Media archive

- Upload many files at once from a phone or desktop, choosing the event. Accepted: JPEG, PNG, WebP and HEIC (converted to JPEG) up to 25 MB, and MP4/MOV clips up to 50 MB. Longer videos are added as a YouTube or Drive link.
- Phone uploads go to the club Shared Drive as originals. The site keeps only a display copy and a thumbnail, strips GPS location data, and records uploader, event, time, caption, tags and alt text.
- **Import from Google Drive:** an admin pastes an event's Drive folder link. The site reads the folder with the admin's own Google permission, makes display copies of every photo, and links each one back to its Drive original. Re-importing the same folder skips files it already has.
- Every upload or import starts as **Pending**. Admins approve or reject it from a queue, with a reason when rejecting. Uploaders see the status of their own files.
- Uploaders can delete their own files while pending. After approval, they can ask an admin to remove one.
- Albums use a lightbox with swipe and arrow-key navigation, captions, and a "full size" button for members that opens the Drive original.
- **Search** (members): by caption, tag, event, uploader and event date range, with filters for media type and team.
- Anyone shown in a photo (signed in or not) can request its removal through a link on every photo. Admins must act within 72 hours.

*Acceptance:* a pending file cannot be reached by URL by anyone except its uploader and admins. A file over the limit is rejected before it uploads, with a message naming the limit. Search never returns pending or rejected items.

### F5. Recruitment

- Admins open a window with start and end dates and choose which teams are hiring.
- Multi-step form for signed-in USET students (addresses ending in .uset@ltsu.ac.in; admins can allow others case by case): name, year, branch and phone (prefilled from the college account where possible), first and second team choice, a portfolio link, and "why VIVIDH" in 150 words or fewer. A team can add one task prompt (for example "edit a 15-second reel"), answered with a link.
- One application per student per window: a resubmission edits the existing one until the deadline.
- Applicants see their own status. Admins review a filterable list, add private notes and set the status: Submitted, Shortlisted, Interview, Accepted, Rejected or Waitlisted.
- **Accept** creates or updates the member record (team and role chosen by the admin) in one step. Bulk status changes and a CSV export are available.

*Acceptance:* the form cannot be submitted outside the window, including by calling the API directly. Accepting an applicant twice does not create two members.

### F6. Admin console and activity log

- Sections: Members, Applications, Media queue, Events, Skill tags, Admins (owners only).
- Members can be added, edited, retired to Alumni or removed. A removed member drops off every public page, but their event credits are kept, shown as "former member".
- Every create, update and delete by an admin is written to an activity log (actor, action, target, before and after values, time). The log cannot be edited and is kept for 3 years.
- Handover checklist page: owners listed, admins listed, last backup date, and pending queue counts.

*Acceptance:* a non-admin gets a 403 from every admin route and API. Every admin change appears in the log within one second.

### Coming in v1.1

- **Badges:** a catalogue with written criteria; admins award and revoke them with a note, and the history keeps revoked awards.
- **Counters:** events covered and active members calculated from data; other figures entered by admins with a source and date.
- **Coverage requests** from societies and faculty, and a **content calendar**.

## Architecture and stack

The site runs as stateless app containers behind a CDN, with a managed PostgreSQL database and object storage. The app keeps nothing on its own disk or in its own memory, so handling more users means adding copies, not rewriting code. Each part has an open-source equivalent that runs on college servers.

*(Diagram: system architecture · one app, four services — see the [living PRD](https://claude.ai/code/artifact/4786db62-76a0-435e-a544-b9df04b7947a).)*

Public pages and approved images are served from Cloudflare's cache, so most visitor traffic never reaches the app. Photo and video bytes go from the phone straight to storage, and the worker processes them in the background.

| Layer | Build and pilot (free tiers) | College servers | Why this choice |
| --- | --- | --- | --- |
| Edge | Cloudflare free plan: DNS, CDN, firewall, rate limits | Cloudflare in front of the college subdomain, or Nginx with caching | Absorbs traffic spikes and attacks before they reach the app |
| App | Vercel Hobby (serverless, scales on its own) | The same code as a Docker image (Next.js standalone build) on Docker Swarm or Kubernetes | Free with no card now; a container later. CI builds the image on every merge so it never goes stale |
| Background jobs | Serverless function per job, plus a GitHub Actions schedule that retries every 15 minutes | A long-running worker container | Free now; one jobs table in both setups |
| Database | Neon free tier (PostgreSQL, pooled connections) | PostgreSQL 16 with a streaming replica and PgBouncer | Standard Postgres; move it with `pg_dump` and restore |
| Display images | Cloudflare R2 free tier (S3 API, 10 GB) | MinIO (S3 API) | About 25,000 photos fit in 10 GB as display copies; only the endpoint and keys change at the move |
| Originals | Google Drive: the college's event folders or a club Shared Drive on @ltsu.ac.in | Same | Already where the college keeps them; no storage cost |
| Auth | Auth.js with Google; the server checks the account's hosted domain is ltsu.ac.in | Same, or LTSU's own SSO through OpenID Connect | No passwords stored |
| Monitoring | Sentry free plan, a free uptime monitor, Vercel logs | Same, or the college's monitoring tools | Problems are found before users report them |
| Code and CI | Club GitHub organisation, GitHub Actions | Same pipeline, new deploy target | The repo outlives every batch of devs |
| UI | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui | Same | Accessible components, easy black-and-white theme |

*Cost during the build and pilot:* ₹0. Free-tier limits change often, so check each one at sign-up; some (Cloudflare R2, for example) may ask for a card even on the free plan. Free tiers comfortably carry the pilot with a few hundred users. The full 20,000-user target is load-tested once the site is on college servers.

## System design for scale

The site is sized for 20,000 users with 2,000 online at once, and must stay up through recruitment day and fest album drops. No system "never goes down", so the real target is 99.9% monthly uptime (about 43 minutes of downtime a month at most). When something does fail, the site degrades gracefully instead of going dark.

### Capacity targets

These are planning assumptions, to be checked against real usage after the pilot.

| Measure | Target |
| --- | --- |
| Registered users | 20,000 (every USET student and staff member, plus alumni) |
| Online at once, at peak | 2,000 |
| Requests at the edge, at peak | 3,000 per second (90% or more answered from the CDN cache) |
| Requests reaching the app, at peak | 300 per second |
| API response time | 95% of requests under 500 ms |
| Public page load on 4G | Largest Contentful Paint under 2.5 s |
| Upload burst after a fest | 5,000 files (about 25 GB) in one hour |
| Storage growth | About 100 GB a year |
| Database size | Under 5 GB after 3 years |
| Uptime | 99.9% a month |
| Data loss if the database fails | 15 minutes of changes at most (recovery point) |
| Recovery time | Back up within 1 hour |

### How each part scales

| Part | How it scales | When it reaches its limit |
| --- | --- | --- |
| Edge (Cloudflare) | Public pages cached for 60 seconds and refreshed in the background; images cached permanently under content-hashed file names | Effectively no limit at this size |
| App containers | Add copies automatically (about 80 requests at a time per copy, 1 to 20 copies). Kept at a minimum of 2 during recruitment and fests to avoid cold starts. Sessions live in signed cookies, so any copy can serve any user | Raise the copy limit; the database becomes the limit first |
| Database | Connection pooler (5 connections per app copy, 100 in total). An index on every filter and sort column. Full-text search with GIN and trigram indexes | Add a read replica above 70% CPU. Move search to Meilisearch above about 1 million media items |
| Storage | Upload URLs that expire after 15 minutes, with file type and size enforced in the URL's policy | Effectively no limit; cost grows by GB stored |
| Worker | Queue absorbs bursts; 4 jobs at a time per copy, 0 to 5 copies; 3 retries with increasing delays, then the job is set aside as failed | Add worker copies |
| Abuse protection | Rate limits: 10 sign-ins per minute per IP address, 300 uploads per hour per user, 5 application saves per minute per user. Bot protection on public forms | Tighten the rules in Cloudflare without redeploying |

### Upload pipeline

*(Diagram: upload pipeline · six steps — see the [living PRD](https://claude.ai/code/artifact/4786db62-76a0-435e-a544-b9df04b7947a).)*

The app only handles small requests (steps 1, 2, 4 and 6). That's why a fest upload burst of 25 GB doesn't slow the site for anyone else.

### When something fails

| Failure | What users see | Recovery |
| --- | --- | --- |
| One app copy crashes | Nothing | Traffic moves to healthy copies; the crashed one restarts automatically |
| A bad release | Nothing, if health checks catch it; otherwise errors for a few minutes | New releases take traffic only after passing health checks; one-click rollback to the previous image |
| Database outage | Public pages still load from the cache; sign-in, uploads and applications show a maintenance notice | Managed failover, or point-in-time restore (15-minute recovery point, 1-hour recovery time) |
| Worker backlog or crash | Uploads show "processing" for longer; nothing is lost | Jobs wait in the queue; the worker scales up or restarts and picks them up |
| Storage outage | Uploads retry automatically from the phone | Resumes when storage is back |
| Traffic spike or attack | Possibly a short challenge page | CDN, rate limits, and Cloudflare's "Under Attack" mode |
| Accidental delete by an admin | Item disappears | Soft delete plus the activity log let an admin restore it; point-in-time restore as a last resort |

### Load testing

The repo includes k6 load-test scripts. Before launch, and before every recruitment window, they simulate at once: 2,000 visitors browsing public pages, 500 students applying, and 200 members uploading. The run passes if 95% of API calls finish under 500 ms, under 0.1% of requests fail, and the database never runs out of connections.

### Moving to college servers

1. **Pitch:** show the club and the college the live site, pilot numbers (uptime, uploads, applications) and this document.
2. **Ask IT for:** two or more VMs (about 4 vCPU and 8 GB RAM each) or a Kubernetes namespace, 500 GB of storage, a subdomain with SSL, and outbound internet access for Google sign-in. This is a starting estimate, to be confirmed with IT.
3. **Deploy** the same Docker images there, with PostgreSQL, PgBouncer and MinIO.
4. **Copy the data:** `pg_dump` and restore for the database, `rclone` from R2 to MinIO for files.
5. **Cut over:** pause uploads for about 2 hours, run a final sync, point the domain at the college servers, and run the load tests. Keep the cloud copy read-only for 30 days as a fallback.

## Data model

Thirteen tables in PostgreSQL, managed with Prisma migrations. Every table has `id`, `created_at` and `updated_at`. Statuses are database enums, and records are soft-deleted wherever history matters.

| Table | Key fields | Notes |
| --- | --- | --- |
| User | email (unique), name, avatar, role (student, member, admin, owner), last\_login | One row per Google account. Created on first sign-in. |
| Member | user\_id, display\_name, photo, bio, links, status (active, alumni, removed), visibility (full, name, hidden), joined\_on, left\_on | Profile layer for club members, kept separate from login. |
| MemberTeam | member\_id, team, role\_title, is\_primary | Many-to-many. Team is an enum of the six teams. |
| SkillTag / MemberSkill | name (unique) / member\_id, tag\_id | Admin-curated list. |
| Event | title, slug, date, venue, type, description, cover\_media\_id, drive\_folder\_url, visibility (public, members), archived\_at | Upcoming or past is worked out from the date. |
| EventCredit | event\_id, member\_id, contribution (photo, video, writing, design, editing) | The "covered by" list. Kept when a member is removed. |
| Media | event\_id, uploader\_id, kind (image, video, link), source (upload, drive), drive\_file\_id, storage\_key, thumb\_key, url, caption, alt\_text, tags\[\], status (pending, approved, rejected, removed), reviewed\_by, reviewed\_at, reject\_reason, size\_bytes | Files are never served straight from storage, only through a route that checks permissions. |
| UploadInvite | event\_id, email, invited\_by, expires\_at | What makes a student a Contributor for one event. |
| RecruitmentWindow / Application | opens\_at, closes\_at, teams\[\] / window\_id, user\_id, answers (JSON), choice\_1, choice\_2, links, status, notes | Application has a unique constraint on (window\_id, user\_id). |
| ActivityLog | actor\_id, action, target\_type, target\_id, before (JSON), after (JSON), at | Insert-only; the app's database user has no UPDATE or DELETE rights on it. |
| RemovalRequest | media\_id, requester\_email, reason, status, resolved\_by | Can be filed by anyone, signed in or not. |

## Non-functional requirements

Privacy comes first, because the archive is full of photos of students who never agreed to appear in it.

| Area | Requirement |
| --- | --- |
| Consent | Members choose their own public visibility, with "name only" as the default. A removal-request link appears on every photo, and requests are handled within 72 hours. GPS data is stripped from every upload. Public albums are reviewed by an admin, not just auto-approved. |
| Personal data | Phone numbers and application answers are visible to admins only. Application data is deleted 12 months after its window closes. Data is handled in line with India's DPDP Act 2023. |
| Security | Google sign-in limited to the college domain (checked on the server, not only in the sign-in prompt). Role checks on every API route. Uploads are type-checked by content, not file extension. Rate limits on upload and apply. HTTPS only. Secrets kept in environment variables, never committed to the repo. |
| Accessibility | WCAG 2.2 AA: contrast of 4.5:1 or more, full keyboard navigation, visible focus, alt text required for public images, and reduced-motion support. |
| Mobile | Every flow works on a 360 px wide phone. Upload works on a slow 4G connection, with per-file progress and retry. |
| Performance | Public pages load in under 2.5 s (Largest Contentful Paint) on 4G. Grids use 400 px thumbnails, and full size loads only in the lightbox. Images are lazy-loaded. |
| Reliability and backups | Point-in-time restore for the database (15-minute recovery point), plus a nightly dump and a weekly file sync to a second provider, keeping 30 days of copies. A restore is tested once each term. See System design for scale. |
| Maintainability | TypeScript throughout, one repo, a README with one-command local setup (`docker compose up`), seed data, and CI that runs lint, type checks and tests on every pull request. |
| Observability | Sentry error tracking, structured logs, a health check endpoint, and an uptime monitor that alerts the dev lead. Storage use and the monthly cloud bill appear on the admin handover page, with budget alerts at 50% and 80%. |

## Roadmap, metrics and risks

The plan is to launch v1 on 22 March 2027, about 20 weeks of part-time work by 3 to 4 student devs, leaving room for December exams. These dates are a first plan; adjust them once the dev team is confirmed.

*(Diagram: roadmap · setup to v1.1 — see the [living PRD](https://claude.ai/code/artifact/4786db62-76a0-435e-a544-b9df04b7947a).)*

Each milestone ends with a demo to the club's admins. The pitch to the club and the college uses real pilot numbers, and the move to college servers is planned for May and June 2027, outside the exam season.

### Success metrics (first full term after launch)

| Metric | Target |
| --- | --- |
| Events with an approved album within 7 days | 80% |
| Active uploaders per term | 15 or more |
| Media items in the pending queue for over 72 hours | 0 |
| Applications received through the site in the first window | 100% (no side forms) |
| Applications given a status within 14 days of the window closing | 100% |
| Time for an admin to add, retire or move a member | Under 1 minute |
| Handover: new president fully set up | Within 1 meeting, using the checklist |

### Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| The college declines to host the site, or its servers can't run containers | High | The site keeps running on the cloud, and the pitch asks the college or the club to cover about ₹1,500 a month. Fallback: the same containers run on a single ₹500/month VPS. |
| Student devs graduate mid-project | High | Two devs on every area, PRs reviewed, README and seed data kept up to date, repo owned by a club GitHub organisation. |
| A private or embarrassing photo goes public | Medium | Approval required for everything, GPS stripped, removal link on every photo with a 72-hour response, members-only albums by default. |
| The cloud bill grows unexpectedly | Medium | Budget alerts at 50% and 80%, a cap on the number of app copies, size limits, resizing on upload, long videos linked. |
| Admin queue backs up and uploads go stale | Medium | Pending counts shown on the admin home page, two or more admins, metric tracked. |
| Lockout after a handover | Low | At least two owners, enforced in code. Credentials and recovery steps kept in the handover doc held by the faculty coordinator. |

### Open questions

- [x] Who pays for the cloud during the build? Nobody: free tiers only, and the site moves to college servers as soon as it's ready (D2).
- [x] Which email domains to allow? @ltsu.ac.in for sign-in; addresses ending in .uset@ltsu.ac.in identify USET students (D4).
- [x] Who is the second owner? The Faculty Coordinator (D11).
- [ ] Which office-bearers besides the President are admins for 2026–27 (Vice President, team leads)? Owner: President.
- [ ] Can the club get edit or view access to the college's event folders on Drive, or a club Shared Drive on @ltsu.ac.in? Owner: Faculty Coordinator, by 24 Oct.
- [ ] Does the department need to sign off on public use of student photos? Owner: President, ask the Faculty Coordinator.
- [ ] Should alumni keep their sign-in after graduation, once they lose their college email?
