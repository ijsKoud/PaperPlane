-- CreateTable
CREATE TABLE "Pastebin" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "highlight" TEXT NOT NULL,
    "password" TEXT,
    "authSecret" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("id", "domain"),
    CONSTRAINT "Pastebin_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Domain" ("domain") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pastebin_path_key" ON "Pastebin"("path");
