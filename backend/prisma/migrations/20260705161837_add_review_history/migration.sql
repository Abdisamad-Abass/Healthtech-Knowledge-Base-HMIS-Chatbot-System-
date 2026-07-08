/*
  Warnings:

  - A unique constraint covering the columns `[articleId,userId]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ArticleStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "ArticleStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "ArticleStatus" ADD VALUE 'APPROVED';
ALTER TYPE "ArticleStatus" ADD VALUE 'REJECTED';
ALTER TYPE "ArticleStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lastStatus" "ArticleStatus",
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "reviewComments" TEXT,
ADD COLUMN     "reviewStartedAt" TIMESTAMP(3),
ADD COLUMN     "reviewerId" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ReviewHistory" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_articleId_userId_key" ON "Feedback"("articleId", "userId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHistory" ADD CONSTRAINT "ReviewHistory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHistory" ADD CONSTRAINT "ReviewHistory_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
