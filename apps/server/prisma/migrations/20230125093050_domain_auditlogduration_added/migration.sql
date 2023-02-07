/*
  Warnings:

  - Added the required column `audit_log_duration` to the `Domain` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domain" (
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
INSERT INTO "new_Domain" ("backup_codes", "date", "disabled", "domain", "extensions_list", "extensions_mode", "max_storage", "max_upload_size", "password", "two_factor_secret") SELECT "backup_codes", "date", "disabled", "domain", "extensions_list", "extensions_mode", "max_storage", "max_upload_size", "password", "two_factor_secret" FROM "Domain";
DROP TABLE "Domain";
ALTER TABLE "new_Domain" RENAME TO "Domain";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
