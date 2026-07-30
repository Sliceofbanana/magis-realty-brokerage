import Image from "next/image";
import Link from "next/link";
import { SocialIcon, type SocialPlatform } from "@/components/ui/SocialIcon";

const socialPlatforms: SocialPlatform[] = ["facebook", "instagram", "linkedin"];

const columns = [
  {
    heading: "Explore",
    links: [
      { href: "/properties", label: "Residential Properties" },
      { href: "/properties", label: "Commercial Listings" },
      { href: "/properties", label: "New Developments" },
      { href: "/properties", label: "Investment Portfolios" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/agents", label: "Our Agents" },
      { href: "/contact", label: "Contact Us" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/faqs", label: "Terms of Service" },
      { href: "/faqs", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Image
            src="/images/footer-logo.png"
            alt="Magis Realty & Brokerage"
            width={1200}
            height={542}
            className="h-12 w-auto object-contain"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Defining the future of luxury real estate with precision, integrity,
            and an unwavering commitment to excellence.
          </p>
          <div className="mt-5 flex gap-3">
            {socialPlatforms.map((platform) => (
              <span
                key={platform}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <SocialIcon platform={platform} size={16} />
              </span>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              {col.heading}
            </p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link, i) => (
                <li key={link.label + i}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Magis Realty &amp; Brokerage. All rights reserved.</p>
          <p>DHSUD REG NO. 123456 &nbsp;&nbsp; PRC LICENSE NO. 009876</p>
        </div>
      </div>
    </footer>
  );
}
