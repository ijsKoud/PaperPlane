/*
  Warnings:

  - You are about to drop the column `domainDomain` on the `Token` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "domain" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Token_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Domain" ("domain") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("date", "domain", "name", "token") SELECT "date", "domain", "name", "token" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
