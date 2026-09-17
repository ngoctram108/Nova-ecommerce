-- AlterTable: Add localized product fields (safe, additive only)
ALTER TABLE "Product" ADD COLUMN "nameVi" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "nameEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "descriptionVi" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "descriptionEn" TEXT NOT NULL DEFAULT '';

-- Backfill: Copy existing name/description into Vietnamese fields
UPDATE "Product" SET "nameVi" = "name", "descriptionVi" = "description" WHERE "nameVi" = '';
