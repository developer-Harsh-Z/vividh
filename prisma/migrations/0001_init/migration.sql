-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'member', 'admin', 'owner');

-- CreateEnum
CREATE TYPE "Team" AS ENUM ('leadership', 'ideation', 'writing', 'creative', 'video', 'editing');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('active', 'alumni', 'removed');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('full', 'name', 'hidden');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('workshop', 'fest', 'seminar', 'competition', 'other');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('public', 'members');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('image', 'video', 'link');

-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('upload', 'drive');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('uploading', 'processing', 'pending', 'approved', 'rejected', 'removed', 'failed');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('submitted', 'shortlisted', 'interview', 'accepted', 'rejected', 'waitlisted');

-- CreateEnum
CREATE TYPE "RemovalStatus" AS ENUM ('open', 'done', 'declined');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'student',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'active',
    "visibility" "Visibility" NOT NULL DEFAULT 'name',
    "batch" INTEGER,
    "joinedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftOn" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberTeam" (
    "memberId" TEXT NOT NULL,
    "team" "Team" NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Member',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MemberTeam_pkey" PRIMARY KEY ("memberId","team")
);

-- CreateTable
CREATE TABLE "SkillTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SkillTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL DEFAULT '',
    "type" "EventType" NOT NULL DEFAULT 'other',
    "description" TEXT NOT NULL DEFAULT '',
    "coverId" TEXT,
    "driveFolderId" TEXT,
    "visibility" "EventVisibility" NOT NULL DEFAULT 'members',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCredit" (
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "contribution" TEXT NOT NULL DEFAULT 'coverage',

    CONSTRAINT "EventCredit_pkey" PRIMARY KEY ("eventId","memberId")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "source" "MediaSource" NOT NULL DEFAULT 'upload',
    "driveFileId" TEXT,
    "mime" TEXT,
    "originalKey" TEXT,
    "displayKey" TEXT,
    "thumbKey" TEXT,
    "url" TEXT,
    "caption" TEXT NOT NULL DEFAULT '',
    "altText" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[],
    "status" "MediaStatus" NOT NULL DEFAULT 'uploading',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "sizeBytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadInvite" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentWindow" (
    "id" TEXT NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "teams" "Team"[],
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitmentWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "windowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "branch" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "choice1" "Team" NOT NULL,
    "choice2" "Team",
    "portfolio" TEXT,
    "taskLink" TEXT,
    "why" TEXT NOT NULL,
    "status" "AppStatus" NOT NULL DEFAULT 'submitted',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemovalRequest" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RemovalStatus" NOT NULL DEFAULT 'open',
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RemovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MemberToSkillTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberToSkillTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SkillTag_name_key" ON "SkillTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Media_status_updatedAt_idx" ON "Media"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Media_eventId_status_idx" ON "Media"("eventId", "status");

-- CreateIndex
CREATE INDEX "Media_uploaderId_idx" ON "Media"("uploaderId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_eventId_driveFileId_key" ON "Media"("eventId", "driveFileId");

-- CreateIndex
CREATE INDEX "UploadInvite_email_idx" ON "UploadInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UploadInvite_eventId_email_key" ON "UploadInvite"("eventId", "email");

-- CreateIndex
CREATE INDEX "Application_windowId_status_idx" ON "Application"("windowId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_windowId_userId_key" ON "Application"("windowId", "userId");

-- CreateIndex
CREATE INDEX "ActivityLog_at_idx" ON "ActivityLog"("at");

-- CreateIndex
CREATE INDEX "RemovalRequest_status_idx" ON "RemovalRequest"("status");

-- CreateIndex
CREATE INDEX "_MemberToSkillTag_B_index" ON "_MemberToSkillTag"("B");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberTeam" ADD CONSTRAINT "MemberTeam_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCredit" ADD CONSTRAINT "EventCredit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCredit" ADD CONSTRAINT "EventCredit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadInvite" ADD CONSTRAINT "UploadInvite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_windowId_fkey" FOREIGN KEY ("windowId") REFERENCES "RecruitmentWindow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemovalRequest" ADD CONSTRAINT "RemovalRequest_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToSkillTag" ADD CONSTRAINT "_MemberToSkillTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToSkillTag" ADD CONSTRAINT "_MemberToSkillTag_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

