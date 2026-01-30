"use client";

import type { ChangeEvent } from "react";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  notes: string;
}

interface ContactFormFieldsProps {
  formData: ContactFormData;
  onChange: (field: keyof ContactFormData, value: string) => void;
}

const INPUT_CLASS_NAME =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30";

export function ContactFormFields({
  formData,
  onChange,
}: ContactFormFieldsProps) {
  function handleChange(field: keyof ContactFormData) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(field, event.target.value);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="First name *"
        value={formData.firstName}
        onChange={handleChange("firstName")}
        required
        className={INPUT_CLASS_NAME}
      />
      <input
        type="text"
        placeholder="Last name *"
        value={formData.lastName}
        onChange={handleChange("lastName")}
        required
        className={INPUT_CLASS_NAME}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange("email")}
        className={INPUT_CLASS_NAME}
      />
      <input
        type="text"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange("company")}
        className={INPUT_CLASS_NAME}
      />
      <input
        type="text"
        placeholder="Job title"
        value={formData.jobTitle}
        onChange={handleChange("jobTitle")}
        className={INPUT_CLASS_NAME}
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange("phone")}
        className={INPUT_CLASS_NAME}
      />
      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange("notes")}
        rows={3}
        className={INPUT_CLASS_NAME}
      />
    </div>
  );
}
