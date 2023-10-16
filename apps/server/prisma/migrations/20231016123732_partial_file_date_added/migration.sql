-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PartialFile" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_PartialFile" ("domain", "file_name", "id", "mime_type", "password", "path", "visible") SELECT "domain", "file_name", "id", "mime_type", "password", "path", "visible" FROM "PartialFile";
DROP TABLE "PartialFile";
ALTER TABLE "new_PartialFile" RENAME TO "PartialFile";
CREATE UNIQUE INDEX "PartialFile_path_key" ON "PartialFile"("path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
