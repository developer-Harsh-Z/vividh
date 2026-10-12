# VIVIDH Club Website: Product Requirements Document

*VIVIDH: The Social Media Club, University School of Engineering and Technology (USET)*

**Owner:** Founder and President, VIVIDH · **Status:** Draft v0.1 · **Date:** October 10, 2026

## 1. Overview

VIVIDH (विविध, "diverse") is the social media club of USET. Members run the department's social presence (Instagram: lamrin\_uset), build campaigns about the department, cover USET events live, and produce videos, posters and banners. The club has six working groups: Leadership (President, Vice President, Treasurer), Ideation, Content Writing, Creative Making, Videography and Photography, and Editing. Recruitment runs once a year and whenever the club needs new members.

This document defines the requirements for a club website that presents VIVIDH, manages its people and media, and runs its recruitment.

## 2. Problem Statement

- Event photos and videos are scattered across personal phones, chats and drives, so they are hard to find and easy to lose.
- Member information, roles and achievements are tracked informally, and knowledge is lost when office-bearers change.
- Recruitment depends on ad hoc forms and messages, with no single place to review applicants.
- The club has no home that shows its work and its people beyond social media feeds.

## 3. Goals and Non-Goals

### Goals

- Give the club a recognisable home that reflects its identity and shows its work.
- Make event media easy to upload, organise by event, browse and search.
- Give the president and admins one place to manage members, applications and content.
- Recognise member contributions through a clear badge system.
- Show the club's reach honestly through live metrics.

### Non-Goals (Version 1)

- Automatic posting to social platforms or analytics pulled from them.
- Student login with college email and single sign-on.
- Hosting long-form video (clips are stored, long videos are linked).
- Payments, fee collection or treasury accounting.
- A native mobile app.

## 4. Users and Roles

- **Visitor:** anyone viewing the public showcase. Can browse the team, events, achievements and counters, and see recruitment status.
- **Member:** an active club member. Can upload media, edit their own profile and view all albums.
- **Student contributor:** a USET student invited to upload event media. Can upload and browse, but has no profile or admin access.
- **Admin:** President, Vice President and designated office-bearers. Can manage members, approve media, run recruitment and award badges.
- **Owner:** the President. Has every admin right, and can grant or remove admin access.

## 5. Scope and Phasing

- **Phase 1, Members-only portal:** all features in this document, available to signed-in members and invited students. This is what the current platform supports.
- **Phase 2, Public showcase:** a public page presenting approved highlights (team, events, achievements, counters, recruitment call), kept in sync from the portal.
- **Phase 3, Hosted site (optional):** a fully public site with student login, storage the club controls and a custom domain, if the club outgrows Phase 1.

## 6. Feature Requirements

### 6.1 Team Management

**User story:** As a visitor or member, I want to see who is on each team and what they are good at, so I can find the right person and get to know the club.

**Requirements**

- Display members as cards grouped by team: Leadership, Ideation, Content Writing, Creative Making, Videography and Photography, Editing.
- Clicking a card opens a profile with photo, name, role, team, short bio, skill tags, badges earned, events covered and social links (Instagram or LinkedIn only).
- Skill tags (for example Reels, Photography, Copywriting, Poster Design) are clickable and filter the team view.
- Members can edit their own bio, photo, skills and links. Role and team changes are admin-only.
- Members with Alumni status appear in a separate Alumni section.
- Photos and names are shown publicly only with the member's consent.

**Acceptance criteria**

- Filtering by a skill tag shows only members with that tag, and clearing the filter restores the full list.
- A member can update their own profile but cannot change their role or badges.

### 6.2 Event Showcase

**User story:** As a visitor or member, I want to browse past and upcoming USET events and see how the club covered them.

**Requirements**

- Gallery grid of events with cover image, title, date, type and a photo count.
- Filter chips for event type (workshop, fest, seminar, achievement, other) and year, with text search by event name.
- Each event has its own page with description, album, "covered by" list linking to member profiles, and links to related reels or videos.
- Upcoming events appear in a short strip with date and venue.
- Admins create, edit, archive and delete events.

**Acceptance criteria**

- Combining a type filter and a year filter shows only events matching both.
- Every event page lists the members credited with covering it.

### 6.3 Media Uploads and Albums

**User story:** As a member or invited student, I want to upload photos and short videos from an event so the club has one shared archive.

**Requirements**

- Upload one or many images and short video clips to a chosen event. Accepted: common image formats and MP4/WebM video, with a 20 MB limit per file.
- Longer videos are added as links (for example YouTube or Drive) with a title and caption.
- Each upload records uploader, event, date, caption and tags.
- All uploads start as **Pending** and appear in albums only after an admin approves them. Admins can reject with a reason.
- Uploaders can see the status of their own uploads and delete them before approval.
- Albums show images by event with a lightbox viewer, previous and next navigation and caption display.

**Acceptance criteria**

- A newly uploaded file is not visible to anyone except the uploader and admins until approved.
- Files over the size limit are rejected with a clear message.

### 6.4 Image Search

**User story:** As a member, I want to find a photo quickly without scrolling through every album.

**Requirements**

- Search across caption, tags, event name, uploader name and date range.
- Results appear as a grid with filters for event, team that covered it and media type (photo or video).
- Uploaders can add and edit tags. Admins can edit tags on any item.
- *Optional enhancement:* automatic tag suggestions on upload (for example "trophy", "group photo", "stage"), accepted or edited by the uploader. This requires one-time permission from the viewer.

**Acceptance criteria**

- Searching for a tag returns every approved item carrying that tag and nothing pending.
- An empty result shows a helpful message and suggestions to broaden the search.

### 6.5 Recruitment System

**User story:** As a student, I want to apply to join VIVIDH easily. As an admin, I want to review applicants in one place.

**Requirements**

- **Recruitment window:** admins set Open or Closed with start and end dates. When closed, the page shows the next expected window and a "Notify me" option.
- **Application form (multi-step):** basic details (name, year, branch, contact), first and second team preference, portfolio or sample link, and a short "why you" answer. Teams such as Editing or Creative can add a small task (for example a 15-second edit).
- **Review:** admins see applications in a list with filters by team, status and date, and can add notes.
- **Statuses:** Submitted, Shortlisted, Interview, Accepted, Rejected, Waitlisted.
- **Accepting an applicant** creates a member record in the chosen team with one action.
- Duplicate applications from the same person in one window are flagged.

**Acceptance criteria**

- The form cannot be submitted when the window is closed.
- Accepting an application creates exactly one member with the team and role the admin selected.

### 6.6 Achievement Badges

**User story:** As a member, I want my contributions recognised. As an admin, I want a fair, transparent system.

**Requirements**

- Badge catalogue with name, icon, description and clear criteria. Starter set: First Cover, Event Veteran (10 events), Reel Master, Campaign Lead, Viral Post, Mentor, Newcomer of the Year.
- Admins award and revoke badges, with an optional note and date. Awards are manual in Version 1.
- Badges appear on member profiles and in a Hall of Fame section highlighting recent awards.
- Admins can add, edit and retire badge types.

**Acceptance criteria**

- A badge shows the date it was awarded and who awarded it.
- Revoking a badge removes it from the profile and the Hall of Fame.

### 6.7 Social Proof Counters

**User story:** As a visitor, I want to see at a glance how active and far-reaching the club is.

**Requirements**

- Animated counters on the home page: events covered, posts published, active members, campaigns run, and followers or reach.
- Numbers animate once when scrolled into view and show the final value immediately for users who prefer reduced motion.
- Values are entered by admins in one settings screen. Where possible, events covered and active members are calculated from stored data.
- Only real, verifiable numbers are published.

**Acceptance criteria**

- Counters never show a stale placeholder value after the admin updates a metric.

### 6.8 Admin Console

**User story:** As an admin, I want one place to run the club.

**Requirements**

- Visible only to admins and the owner.
- **Members:** add, edit, change team or role, retire (move to Alumni) and remove. Retiring and removing hide the member but keep their event credits and badge history.
- **Applications:** review, change status, accept (see 6.5).
- **Media approval:** queue of pending uploads with approve, reject and edit tags.
- **Events:** create, edit, archive, delete.
- **Badges:** manage the catalogue and award or revoke.
- **Metrics:** edit counter values.
- **Activity log:** record of who did what and when (for example member removed, media approved), supporting handover between office-bearers.
- Owner can grant and revoke admin access.

**Acceptance criteria**

- A non-admin cannot reach any admin screen or action.
- Every admin change appears in the activity log with the actor and timestamp.

### 6.9 Additional Features (Recommended)

- **Request coverage:** a form where any USET society or faculty member can ask the club to cover an event, which admins can accept and assign to a team.
- **Content calendar:** a simple calendar of upcoming events and planned campaigns.
- **Alumni wall:** former members with their teams and years.

## 7. Data Model (Summary)

- **Member:** name, photo, role, team, bio, skills, social links, status (Active, Alumni, Removed), join date, consent flag.
- **Event:** title, date, venue, type, description, cover image, covered-by members, status (Upcoming, Past, Archived).
- **Media:** file or link, type, event, uploader, caption, tags, status (Pending, Approved, Rejected), upload date.
- **Application:** applicant details, team preferences, links, answers, status, reviewer notes, recruitment window.
- **Recruitment window:** open and close dates, state, notes.
- **Badge:** name, icon, description, criteria, status.
- **Badge award:** member, badge, date, awarded by, note.
- **Metric:** name, value, last updated.
- **Activity log entry:** actor, action, target, timestamp.

## 8. Permissions Summary

- Visitors: read public showcase content only.
- Student contributors: upload media and view approved albums.
- Members: everything above, plus editing their own profile.
- Admins: manage members, applications, media, events, badges, metrics.
- Owner: all admin rights plus granting admin access.

## 9. Non-Functional Requirements

- **Privacy and consent:** photos of students are published only after approval, and members can ask for their photo or name to be removed. Contact details are never shown publicly.
- **Accessibility:** readable contrast, keyboard navigation, alt text for images and reduced-motion support.
- **Responsive design:** fully usable on phones, since most members will upload from them.
- **Theme:** black-and-white identity matching the club logo, with light and dark modes.
- **Performance:** albums load images progressively, and thumbnails are used in grids.
- **Content hygiene:** admins can remove any content quickly.

## 10. Platform Constraints

- Database and upload features are available only to signed-in claude.ai users in the owner's organization or invited as guests. A page using uploads cannot be fully public.
- Uploads are limited to 20 MB per file, so long videos must be linked.
- Storage has a per-artifact quota that must be monitored.
- Fully public student uploads with college login need a hosted solution (Phase 3).

## 11. Success Metrics

- Share of events from each term with an approved album within one week.
- Number of active uploaders per term.
- Recruitment applications received and share reviewed within two weeks.
- Time for an admin to add, retire or change a member (target: under one minute).
- Members with at least one badge.

## 12. Risks and Mitigations

- **Students without access:** if many contributors cannot sign in, uploads stall. Mitigation: start with members and a small invited group, and move to Phase 3 if needed.
- **Inappropriate or private content:** mitigated by mandatory approval and quick removal.
- **Admin turnover:** mitigated by the activity log and owner-controlled access.
- **Storage limits:** mitigated by size caps, thumbnails and linking long videos.
- **Unfair badges:** mitigated by published criteria and visible award history.

## 13. Open Questions

- Who may upload: only members, or any USET student? Do those students have claude.ai accounts?
- Which numbers can the club verify for the counters?
- Who besides the President should be an admin?
- Does the department need to approve public use of student photos?
- Should a custom domain be a goal?

## 14. Milestones

1. **Foundation:** identity, navigation, team profiles and admin member management.
2. **Media:** events, uploads, approval queue, albums and search.
3. **Recruitment and recognition:** application flow, badges and counters.
4. **Launch:** content entry, testing with a small group, then member rollout.
5. **Public showcase:** curated public page and review of Phase 3 needs.
