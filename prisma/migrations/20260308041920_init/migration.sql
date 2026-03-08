-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenisBarang" TEXT NOT NULL,
    "merkTipe" TEXT NOT NULL DEFAULT '',
    "nomorAsset" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'tersedia',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "yangMeminjamkan" TEXT NOT NULL,
    "namaPeminjam" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "tglPinjam" DATETIME NOT NULL,
    "targetTglKembali" DATETIME NOT NULL,
    "realTglKembali" DATETIME,
    "namaPengembalian" TEXT,
    "status" TEXT NOT NULL DEFAULT 'dipinjam',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_nomorAsset_key" ON "InventoryItem"("nomorAsset");
