// constants.ts
export const GenderOptions = ["MALE", "FEMALE", "OTHER"];

// Appointment statuses
export const appointmentStatus = ["SCHEDULED", "CANCELLED", "PENDING"];

// Clinic types
export const clinicType = [
  { value: "GENERAL_PRACTICE", label: "General Practice" },
  { value: "DENTAL_CLINIC", label: "Dental Clinic" },
  { value: "PEDIATRIC_CLINIC", label: "Pediatric Clinic" },
  { value: "ORTHOPEDIC_CLINIC", label: "Orthopedic Clinic" },
  { value: "MENTAL_HEALTH_CLINIC", label: "Mental Health Clinic" },
  { value: "CARDIOLOGY_CLINIC", label: "Cardiology Clinic" },
  { value: "DERMATOLOGY_CLINIC", label: "Dermatology Clinic" },
  { value: "SPECIALIST_CLINIC", label: "Specialist Clinic" },
];
// Days of the week
export const dayOfWeek = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

// Patient types
export const patientType = ["EXISTING", "NEW"];

// Practitioner types
export const practitionerType = [
  "GENERAL_PRACTITIONER",
  "SPECIALIST",
  "PHYSICIAN",
  "SURGEON",
  "DENTIST",
];

// Specializations
export const specialization = [
  "CARDIOLOGIST",
  "DERMATOLOGIST",
  "NEUROLOGIST",
  "ORTHOPEDIC_SURGEON",
  "PEDIATRICIAN",
  "GENERAL_PRACTITIONER",
  "GYNECOLOGIST",
  "RADIOLOGIST",
  "PSYCHIATRIST",
  "ENDOCRINOLOGIST",
  "RHEUMATOLOGIST",
  "ONCOLOGIST",
  "NEPHROLOGIST",
  "DIETITIAN",
  "DIABETES_EDUCATOR",
  "PODIATRIST",
  "PHYSIOTHERAPIST",
  "OCCUPATIONAL_THERAPIST",
  "PSYCHOLOGIST",
  "EXERCISE_PHYSIOLOGIST",
  "NCS_EMG_SPECIALIST",
];

export const ClinicFormDefaultValues = {
  name: "",
  phone: "",
  address: "",
  clinicWebsite: "",
  clinicType: clinicType[0].value, // Default to the first clinic type
  clinicInformation: [], // Empty array for file uploads
  daysOpened: dayOfWeek, // Default to all days
};
// Example usage in an application (you can remove this comment in your file)
// console.log("Appointment Statuses:", appointmentStatus);
// console.log("Clinic Types:", clinicType);

export const StatusIcon = {
  SCHEDULED: "/assets/icons/check.svg",
  PENDING: "/assets/icons/pending.svg",
  CANCELLED: "/assets/icons/cancelled.svg",
};
