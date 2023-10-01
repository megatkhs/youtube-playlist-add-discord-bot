/*
  Warnings:

  - You are about to drop the column `startedAt` on the `Playlist` table. All the data in the column will be lost.
  - Added the required column `targetMonth` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "startedAt",
ADD COLUMN     "targetMonth" TEXT NOT NULL;
