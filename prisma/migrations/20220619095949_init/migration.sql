-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "embedEnabled" BOOLEAN NOT NULL,
    "embedTitle" TEXT,
    "embedDescription" TEXT,
    "embedColour" TEXT
);

-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,

    PRIMARY KEY ("id", "path")
);
