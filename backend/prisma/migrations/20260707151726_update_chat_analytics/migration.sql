/*
  Warnings:

  - You are about to drop the column `completionTokens` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `promptTokens` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `totalTokens` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatAnalytics" ADD COLUMN     "citationsReturned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "embeddingTime" INTEGER,
ADD COLUMN     "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "llmTime" INTEGER,
ADD COLUMN     "retrievalTime" INTEGER,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "completionTokens",
DROP COLUMN "promptTokens",
DROP COLUMN "totalTokens";

-- CreateIndex
CREATE INDEX "ChatAnalytics_createdAt_idx" ON "ChatAnalytics"("createdAt");

-- CreateIndex
CREATE INDEX "ChatAnalytics_sessionId_idx" ON "ChatAnalytics"("sessionId");

-- CreateIndex
CREATE INDEX "ChatAnalytics_userId_idx" ON "ChatAnalytics"("userId");

-- CreateIndex
CREATE INDEX "ChatAnalytics_answerFound_idx" ON "ChatAnalytics"("answerFound");
