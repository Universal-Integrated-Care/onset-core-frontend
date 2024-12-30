/*
  Warnings:

  - Changed the type of `start_time` on the `practitioner_availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `practitioner_availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "practitioner_availability" DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIME(6) NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIME(6) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "practitioner_availability_practitioner_id_date_start_time_e_key" ON "practitioner_availability"("practitioner_id", "date", "start_time", "end_time");
