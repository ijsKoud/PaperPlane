-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT '',
    "password" TEXT,
    "authSecret" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("id", "domain"),
    CONSTRAINT "File_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Domain" ("domain") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_File" ("authSecret", "date", "domain", "id", "password", "path", "size", "views", "visible") SELECT "authSecret", "date", "domain", "id", "password", "path", "size", "views", "visible" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
