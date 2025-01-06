import React from "react";
import Image from "next/image";
import AppointmentForm from "@/components/forms/AppointmentForm";

interface SearchParamProps {
  params: Promise<{ clinicId: string; appointmentId: string }>;
}

// ✅ Fetch Clinic Details from Server
const fetchClinicById = async (clinicId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clinics/${clinicId}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Failed to fetch clinic details");
  return response.json();
};

// ✅ Fetch Appointment Details from Server
const fetchAppointmentById = async (appointmentId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/${appointmentId}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Failed to fetch appointment details");
  return response.json();
};

// ✅ Main Component
const UpdateAppointmentPage = async ({ params }: SearchParamProps) => {
  const { clinicId, appointmentId } = await params;

  try {
    if (!clinicId || !appointmentId) {
      throw new Error("Missing clinicId or appointmentId");
    }

    // ✅ Fetch data from APIs
    const { clinic } = await fetchClinicById(clinicId);
    const { appointment } = await fetchAppointmentById(appointmentId);

    if (!clinic) {
      return (
        <div className="flex items-center justify-center h-screen text-red-500">
          ❌ Clinic not found.
        </div>
      );
    }

    if (!appointment) {
      return (
        <div className="flex items-center justify-center h-screen text-red-500">
          ❌ Appointment not found.
        </div>
      );
    }

    return (
      <div className="flex h-screen max-h-screen">
        {/* Main Section */}
        <section className="remove-scrollbar container">
          <div className="sub-container max-w-[860px] flex-1 justify-between">
            {/* Header Image */}
            <Image
              src="/assets/icons/logo-full.svg"
              height={1000}
              width={1000}
              alt="Clinic"
              className="mb-12 h-10 w-fit"
            />

            {/* Appointment Form */}
            <AppointmentForm
              type="edit"
              clinicId={clinic.id}
              appointmentId={appointment.id}
              appointment={{
                ...appointment,
                patient: appointment.patient,
              }}
              onClose={(updatedData) => {
                // Handle the close action, e.g., refresh data or navigate
                console.log("Appointment updated:", updatedData);
              }}
            />

            {/* Footer */}
            <p className="copyright py-12">© 2024 Onset</p>
          </div>
        </section>

        {/* Side Image */}
        <Image
          src="/assets/images/appointment-img.png"
          alt="appointment"
          height={1000}
          width={1000}
          className="side-img max-w-[390px] bg-bottom"
        />
      </div>
    );
  } catch (error: Error | unknown) {
    console.error(
      "❌ Error loading appointment page:",
      error instanceof Error ? error.message : error,
    );
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        ❌{" "}
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading the appointment page."}
      </div>
    );
  }
};

export default UpdateAppointmentPage;
