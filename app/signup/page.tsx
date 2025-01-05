import ClinicForm from "@/components/forms/ClinicForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen">
      {/*TO DO OTP VERIFICATION | PASSKEY MODEL */}
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496]">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="Clinic"
            className="mb-12 h-10 w-fit"
          />
          <ClinicForm />
          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-dark-600 xl:text-left">
              © 2024 Onset
            </p>
          </div>
        </div>
      </section>
      <Image
        src="/assets/images/onboarding-img.png"
        alt="Clinic"
        height={1000}
        width={1000}
        className="side-img max-w-[50%]"
      ></Image>
    </div>
  );
}
