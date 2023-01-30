/*
  Warnings:

  - Added the required column `name` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "domain" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "domainDomain" TEXT,
    CONSTRAINT "Token_domainDomain_fkey" FOREIGN KEY ("domainDomain") REFERENCES "Domain" ("domain") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("date", "domain", "domainDomain", "token") SELECT "date", "domain", "domainDomain", "token" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
