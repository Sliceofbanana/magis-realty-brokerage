import { UserRound, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Privacy Policy | Magis Realty & Brokerage" };

const cookieTypes = [
  { type: "Essential", purpose: "Necessary for basic website functionality and security." },
  { type: "Performance", purpose: "Help us understand how visitors interact with the site." },
  { type: "Marketing", purpose: "Used to deliver advertisements relevant to your property interests." },
];

const collectedInfo = [
  {
    label: "Personal Identification",
    detail: "Name, email address, phone number, and physical address when you inquire about a property.",
  },
  {
    label: "Property Preferences",
    detail: "Budget range, desired locations, property types, and specific architectural interests.",
  },
  {
    label: "Technical Data",
    detail: "IP address, browser type, and usage data collected through cookies to enhance our high-performance digital experience.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Badge tone="navy">Legal Document</Badge>
          <h1 className="mt-4 font-serif text-4xl font-bold text-navy-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-500">Last Updated: May 20, 2024</p>
        </div>
      </section>

      <section className="bg-offwhite py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-navy-900">Introduction</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            At Magis Realty &amp; Brokerage, we value your trust and are committed to
            protecting your personal information. This Privacy Policy describes how we
            collect, use, and share your personal data when you visit our website, use
            our services, or interact with our representatives.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            By using our services, you agree to the collection and use of information
            in accordance with this policy. We ensure that your data is handled with
            the same architectural precision and high-end professionalism we apply to
            our property portfolios.
          </p>

          <div className="mt-12 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
              <UserRound size={20} />
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-900">
                Information We Collect
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We collect information to provide better services to our clients, including:
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
                {collectedInfo.map((item) => (
                  <li key={item.label} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    <span>
                      <strong className="font-semibold text-navy-900">{item.label}:</strong>{" "}
                      {item.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="bg-white p-6">
              <h3 className="font-serif text-lg font-bold text-navy-900">
                How We Use Information
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Your information allows us to provide curated property recommendations,
                facilitate viewings, and maintain the highest level of client security.
                We also use data to analyze market trends and improve our digital
                offerings.
              </p>
            </Card>
            <Card className="bg-white p-6">
              <h3 className="font-serif text-lg font-bold text-navy-900">Data Security</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                We implement industry-leading encryption and security protocols to
                safeguard your information. Just as we prioritize structural integrity
                in real estate, we prioritize the digital integrity of your personal
                data.
              </p>
            </Card>
          </div>

          <div className="mt-12">
            <h2 className="font-serif text-2xl font-bold text-navy-900">
              Cookies and Tracking
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              We use cookies and similar tracking technologies to track activity on our
              service and hold certain information. Cookies are files with a small
              amount of data which may include an anonymous unique identifier.
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-black/5 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3 font-semibold">Cookie Type</th>
                    <th className="px-6 py-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieTypes.map((row) => (
                    <tr key={row.type} className="border-t border-black/5">
                      <td className="px-6 py-4 font-semibold text-navy-900">{row.type}</td>
                      <td className="px-6 py-4 text-gray-600">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="relative mt-12 overflow-hidden rounded-2xl bg-navy-950 p-8 text-white">
            <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/5" />
            <h3 className="font-serif text-xl font-bold">Contact Our Privacy Officer</h3>
            <p className="mt-2 max-w-lg text-sm text-white/70">
              If you have any questions about this Privacy Policy or how we handle your
              data, please reach out to our dedicated legal team.
            </p>
            <div className="relative mt-5 flex flex-wrap gap-6 text-sm">
              <a
                href="mailto:privacy@magisrealty.com"
                className="flex items-center gap-2 font-semibold hover:text-gold-400"
              >
                <Mail size={16} className="text-gold-400" /> privacy@magisrealty.com
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 font-semibold hover:text-gold-400"
              >
                <Phone size={16} className="text-gold-400" /> +1 (555) 123-4567
              </a>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="font-serif text-2xl font-bold text-navy-900">Your Rights</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              You have the right to access, update, or delete the information we have
              on you. Whenever made possible, you can access, update or request
              deletion of your Personal Data directly within your account settings
              section. If you are unable to perform these actions yourself, please
              contact us to assist you.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
