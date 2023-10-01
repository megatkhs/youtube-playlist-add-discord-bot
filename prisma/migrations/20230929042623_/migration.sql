/*
  Warnings:

  - You are about to drop the column `serverId` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the `Server` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "serverId";

-- DropTable
DROP TABLE "Server";
