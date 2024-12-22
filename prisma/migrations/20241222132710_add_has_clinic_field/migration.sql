/*
  Warnings:

  - A unique constraint covering the columns `[hasClinic]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hasClinic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_hasClinic_key" ON "users"("hasClinic");
