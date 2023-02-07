/*
  Warnings:

  - You are about to drop the column `sign_up` on the `Domain` table. All the data in the column will be lost.
  - Added the required column `disabled` to the `Domain` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domain" (
    "domain" TEXT NOT NULL PRIMARY KEY,
    "disabled" BOOLEAN NOT NULL,
    "password" TEXT,
    "two_factor_secret" TEXT,
    "backup_codes" TEXT NOT NULL DEFAULT 'paperplane-cdn',
    "max_storage" TEXT NOT NULL DEFAULT '0 B',
    "max_upload_size" TEXT NOT NULL DEFAULT '0 B',
    "extensions_list" TEXT NOT NULL DEFAULT '',
    "extensions_mode" TEXT NOT NULL DEFAULT 'block'
);
INSERT INTO "new_Domain" ("domain") SELECT "domain" FROM "Domain";
DROP TABLE "Domain";
ALTER TABLE "new_Domain" RENAME TO "Domain";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
