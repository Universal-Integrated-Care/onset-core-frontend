/*
  Warnings:

  - The `opening_time` column on the `clinics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `closing_time` column on the `clinics` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "clinics" DROP COLUMN "opening_time",
ADD COLUMN     "opening_time" TIMESTAMPTZ(6),
DROP COLUMN "closing_time",
ADD COLUMN     "closing_time" TIMESTAMPTZ(6);
