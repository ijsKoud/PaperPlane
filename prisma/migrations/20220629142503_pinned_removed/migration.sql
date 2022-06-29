/*
  Warnings:

  - You are about to drop the column `pinned` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `pinned` on the `Url` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "size" BIGINT NOT NULL,
    "password" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_File" ("date", "id", "password", "path", "size", "views", "visible") SELECT "date", "id", "password", "path", "size", "views", "visible" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
CREATE TABLE "new_Url" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Url" ("date", "id", "url", "visible", "visits") SELECT "date", "id", "url", "visible", "visits" FROM "Url";
DROP TABLE "Url";
ALTER TABLE "new_Url" RENAME TO "Url";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
