-- CreateEnum
CREATE TYPE "appointmentstatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "clinictype" AS ENUM ('GENERAL_PRACTICE', 'DENTAL_CLINIC', 'PEDIATRIC_CLINIC', 'ORTHOPEDIC_CLINIC', 'MENTAL_HEALTH_CLINIC', 'CARDIOLOGY_CLINIC', 'DERMATOLOGY_CLINIC', 'SPECIALIST_CLINIC');

-- CreateEnum
CREATE TYPE "dayofweek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "patienttype" AS ENUM ('EXISTING', 'NEW');

-- CreateEnum
CREATE TYPE "practitionertype" AS ENUM ('GENERAL_PRACTITIONER', 'SPECIALIST', 'PHYSICIAN', 'SURGEON', 'DENTIST');

-- CreateEnum
CREATE TYPE "specialization" AS ENUM ('CARDIOLOGIST', 'DERMATOLOGIST', 'NEUROLOGIST', 'ORTHOPEDIC_SURGEON', 'PEDIATRICIAN', 'GENERAL_PRACTITIONER', 'GYNECOLOGIST', 'RADIOLOGIST', 'PSYCHIATRIST', 'ENDOCRINOLOGIST', 'RHEUMATOLOGIST', 'ONCOLOGIST', 'NEPHROLOGIST', 'DIETITIAN', 'DIABETES_EDUCATOR', 'PODIATRIST', 'PHYSIOTHERAPIST', 'OCCUPATIONAL_THERAPIST', 'PSYCHOLOGIST', 'EXERCISE_PHYSIOLOGIST', 'NCS_EMG_SPECIALIST');

-- CreateTable
CREATE TABLE "alembic_version" (
    "version_num" VARCHAR(32) NOT NULL,

    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" VARCHAR NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "clinic_context" TEXT,
    "opening_time" TIME(6),
    "closing_time" TIME(6),
    "clinic_type" "clinictype"[],
    "days_opened" "dayofweek"[],
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_appointments" (
    "id" BIGSERIAL NOT NULL,
    "patient_id" BIGINT NOT NULL,
    "clinic_id" BIGINT NOT NULL,
    "practitioner_id" BIGINT,
    "appointment_start_datetime" TIMESTAMPTZ(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "appointmentstatus" NOT NULL,
    "appointment_context" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" BIGSERIAL NOT NULL,
    "clinic_id" BIGINT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "patient_type" "patienttype" NOT NULL,
    "medicare_number" VARCHAR,
    "medicare_expiry" DATE,
    "email" TEXT NOT NULL,
    "phone" VARCHAR,
    "patient_context" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practitioner_availability" (
    "id" BIGSERIAL NOT NULL,
    "practitioner_id" BIGINT NOT NULL,
    "clinic_id" BIGINT NOT NULL,
    "day_of_week" "dayofweek",
    "date" DATE,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "is_available" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practitioner_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practitioners" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,
    "clinic_id" BIGINT NOT NULL,
    "practitioner_type" "practitionertype" NOT NULL,
    "specialization" "specialization"[],
    "bio" TEXT,
    "practitioner_image_url" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practitioners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "hasClinic" BOOLEAN NOT NULL,
    "clinic_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_medicare_number_key" ON "patients"("medicare_number");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "patient_appointments" ADD CONSTRAINT "patient_appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_appointments" ADD CONSTRAINT "patient_appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_appointments" ADD CONSTRAINT "patient_appointments_practitioner_id_fkey" FOREIGN KEY ("practitioner_id") REFERENCES "practitioners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practitioner_availability" ADD CONSTRAINT "practitioner_availability_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practitioner_availability" ADD CONSTRAINT "practitioner_availability_practitioner_id_fkey" FOREIGN KEY ("practitioner_id") REFERENCES "practitioners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "practitioners" ADD CONSTRAINT "practitioners_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
