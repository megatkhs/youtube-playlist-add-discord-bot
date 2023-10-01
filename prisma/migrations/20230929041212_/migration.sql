-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "cannelId" TEXT NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "startedAt" TEXT NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_guildId_key" ON "Server"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Server_cannelId_key" ON "Server"("cannelId");
