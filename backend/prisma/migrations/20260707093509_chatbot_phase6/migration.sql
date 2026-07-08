/*
  Warnings:

  - You are about to drop the column `sources` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "sources",
ADD COLUMN     "citations" JSONB,
ADD COLUMN     "completionTokens" INTEGER,
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "promptTokens" INTEGER,
ADD COLUMN     "responseTime" INTEGER,
ADD COLUMN     "totalTokens" INTEGER;

-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalMessages" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UnansweredQuestion" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "similarity" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ChatAnalytics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "question" TEXT NOT NULL,
    "answerFound" BOOLEAN NOT NULL,
    "articlesRetrieved" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleEmbedding_articleId_idx" ON "ArticleEmbedding"("articleId");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");

-- CreateIndex
CREATE INDEX "ChatSession_lastMessageAt_idx" ON "ChatSession"("lastMessageAt");

-- CreateIndex
CREATE INDEX "SearchLog_query_idx" ON "SearchLog"("query");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "UnansweredQuestion_resolved_idx" ON "UnansweredQuestion"("resolved");

-- CreateIndex
CREATE INDEX "UnansweredQuestion_askedAt_idx" ON "UnansweredQuestion"("askedAt");
