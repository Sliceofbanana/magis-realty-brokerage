"use client";

import { SimpleForm, type FormField } from "@/components/public/SimpleForm";
import { createJobApplicationAction } from "@/lib/actions/careers";

const applicationFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
  {
    name: "expertise",
    label: "Area of Expertise",
    type: "select",
    options: ["Sales & Brokerage", "Marketing", "Property Management", "Operations"],
    span: "full",
  },
  {
    name: "portfolio",
    label: "LinkedIn Profile / Portfolio",
    type: "text",
    placeholder: "https://linkedin.com/in/...",
    span: "full",
    required: false,
  },
];

export function CareersApplicationForm({ role }: { role?: string }) {
  return (
    <SimpleForm
      fields={applicationFields}
      submitLabel="Send Open Application →"
      submitVariant="primary"
      initialValues={role ? { expertise: role } : undefined}
      action={(values) =>
        createJobApplicationAction({
          name: values.name,
          email: values.email,
          expertise: values.expertise,
          portfolio: values.portfolio,
        })
      }
    />
  );
}
