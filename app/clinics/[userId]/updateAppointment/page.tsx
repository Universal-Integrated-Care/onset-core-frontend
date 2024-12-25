import React from "react";
import Image from "next/image";
import { getUser } from "@/lib/actions/user.action";
import { patient } from "@/lib/actions/Appointment.action";

import AppointmentForm from "@/components/forms/AppointmentForm";

interface SearchParamProps {
  params: { userId: string };
}
const updateAppointment = async ({ params }: SearchParamProps) => {
  const { userId } = await params;
  const user = await getUser(userId);

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container ">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="Clinic"
            className="mb-12 h-10 w-fit"
          />
          <AppointmentForm type="update" user={user} patient={patient} />
          <p className="copyright py-12">© 2024 Onset</p>
        </div>
      </section>
      <Image
        src="/assets/images/appointment-img.png"
        alt="appointment"
        height={1000}
        width={1000}
        className="side-img max-w-[390px] bg-bottom"
      ></Image>
    </div>
  );
};

export default updateAppointment;
