/*
  Warnings:

  - The required column `pathId` was added to the `Domain` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domain" (
    "pathId" TEXT NOT NULL,
    "domain" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled" BOOLEAN NOT NULL,
    "password" TEXT,
    "two_factor_secret" TEXT,
    "backup_codes" TEXT NOT NULL DEFAULT 'paperplane-cdn',
    "max_storage" TEXT NOT NULL DEFAULT '0 B',
    "max_upload_size" TEXT NOT NULL DEFAULT '0 B',
    "extensions_list" TEXT NOT NULL DEFAULT '',
    "extensions_mode" TEXT NOT NULL DEFAULT 'block',
    "audit_log_duration" TEXT NOT NULL
);
INSERT INTO "new_Domain" ("audit_log_duration", "backup_codes", "date", "disabled", "domain", "extensions_list", "extensions_mode", "max_storage", "max_upload_size", "password", "two_factor_secret") SELECT "audit_log_duration", "backup_codes", "date", "disabled", "domain", "extensions_list", "extensions_mode", "max_storage", "max_upload_size", "password", "two_factor_secret" FROM "Domain";
DROP TABLE "Domain";
ALTER TABLE "new_Domain" RENAME TO "Domain";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
