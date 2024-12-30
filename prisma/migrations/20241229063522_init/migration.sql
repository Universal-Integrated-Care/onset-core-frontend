/*
  Warnings:

  - A unique constraint covering the columns `[practitioner_id,date,start_time,end_time]` on the table `practitioner_availability` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "practitioner_availability_practitioner_id_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "practitioner_availability_practitioner_id_date_start_time_e_key" ON "practitioner_availability"("practitioner_id", "date", "start_time", "end_time");
