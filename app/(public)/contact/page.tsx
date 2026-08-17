import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { SimpleForm, FormField } from "@/components/public/SimpleForm";
import { Card } from "@/components/ui/Card";
import { exteriors } from "@/lib/stockPhotos";
import { submitInquiryAction } from "@/lib/actions/leads";

export const metadata = { title: "Contact Us | Magis Realty & Brokerage" };

const contactFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "e.g. Alexander Vance" },
  { name: "email", label: "Email Address", type: "email", placeholder: "alexander@luxe.com" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+63 900 000 0000" },
  {
    name: "interest",
    label: "Interest",
    type: "select",
    options: [
      "Penthouse Collections",
      "Private Estates",
      "Commercial Properties",
      "Investment Portfolios",
    ],
  },
  {
    name: "message",
    label: "Your Inquiry",
    type: "textarea",
    placeholder: "Describe your property requirements...",
    span: "full",
    required: false,
  },
];

export default function ContactPage() {
  async function submitContactInquiry(values: Record<string, string>) {
    "use server";
    return submitInquiryAction({
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: values.message,
      interest: values.interest,
      source: "Contact Page",
    });
  }

  return (
    <>
      <section className="relative flex h-[320px] items-center sm:h-[360px]">
        <Image
          src={exteriors.glassOfficeTowers}
          alt="Magis Realty & Brokerage office exterior"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/65" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-block rounded bg-navy-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Connect With Magis Realty &amp; Brokerage
          </span>
          <h1 className="mt-3 max-w-xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            Expert Guidance for Your Luxury Property Journey
          </h1>
        </div>
      </section>

      <div className="bg-offwhite py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
          <Card className="bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold text-navy-900">Inquiry Form</h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete the form below and one of our luxury specialists will
              contact you shortly.
            </p>
            <SimpleForm
              fields={contactFields}
              submitLabel="Send Inquiry"
              className="mt-6"
              successMessage="One of our luxury specialists will reach out shortly."
              action={submitContactInquiry}
            />
          </Card>

          <div className="space-y-6">
            <div className="rounded-2xl bg-navy-950 p-6 text-white">
              <MapPin className="text-gold-400" size={20} />
              <h3 className="mt-3 font-serif text-lg font-bold">Main Office</h3>
              <p className="mt-2 text-sm text-white/70">
                Room 610, Northwoods Place, H. Abellana St., Canduman, Mandaue
                City, 6014 Cebu
              </p>
            </div>

            <Card className="bg-white p-6">
              <h3 className="font-serif text-lg font-bold text-navy-900">Direct Reach</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-300 text-gold-600">
                    <Phone size={16} />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">
                      Inquiry Line
                    </p>
                    <p className="font-semibold text-navy-900">+63 (2) 8888 9999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-300 text-gold-600">
                    <Mail size={16} />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">
                      Email Concierge
                    </p>
                    <p className="font-semibold text-navy-900">luxe@magisrealty.com</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white p-6">
              <h3 className="font-serif text-lg font-bold text-navy-900">Business Hours</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-gray-500">Mon &ndash; Fri</span>
                  <span className="font-semibold text-navy-900">9:00 AM &ndash; 6:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-gray-500">Saturday</span>
                  <span className="font-semibold text-navy-900">10:00 AM &ndash; 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sunday</span>
                  <span className="font-semibold text-gold-600">By Appointment</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
            <iframe
              title="Map showing the Magis Realty & Brokerage office location"
              src="https://www.google.com/maps?q=Room+610,+Northwoods+Place,+H.+Abellana+St.,+Canduman,+Mandaue+City,+6014+Cebu&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </>
  );
}
