/*
  Warnings:

  - A unique constraint covering the columns `[practitioner_id,day_of_week]` on the table `practitioner_availability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[practitioner_id,date]` on the table `practitioner_availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "practitioner_availability_practitioner_id_day_of_week_key" ON "practitioner_availability"("practitioner_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "practitioner_availability_practitioner_id_date_key" ON "practitioner_availability"("practitioner_id", "date");
