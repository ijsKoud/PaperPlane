/*
  Warnings:

  - The primary key for the `Image` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT
);
INSERT INTO "new_Image" ("date", "id", "password", "path", "pinned", "views") SELECT "date", "id", "password", "path", "pinned", "views" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE INDEX "Image_id_path_idx" ON "Image"("id", "path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
