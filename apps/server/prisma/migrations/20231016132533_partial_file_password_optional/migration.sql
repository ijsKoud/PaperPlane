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
    "password" TEXT,
    CONSTRAINT "PartialFile_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Domain" ("domain") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartialFile" ("date", "domain", "file_name", "id", "mime_type", "password", "path", "visible") SELECT "date", "domain", "file_name", "id", "mime_type", "password", "path", "visible" FROM "PartialFile";
DROP TABLE "PartialFile";
ALTER TABLE "new_PartialFile" RENAME TO "PartialFile";
CREATE UNIQUE INDEX "PartialFile_path_key" ON "PartialFile"("path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
