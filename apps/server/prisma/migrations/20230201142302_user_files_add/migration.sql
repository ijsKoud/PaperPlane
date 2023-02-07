-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Url_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Domain" ("domain") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT NOT NULL,
    "password" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "File_domain_fkey" FOREIGN KEY ("domain") REFERENCES "Domain" ("domain") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
