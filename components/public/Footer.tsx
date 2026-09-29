import Image from "next/image";
import Link from "next/link";
import { SocialIcon, type SocialPlatform } from "@/components/ui/SocialIcon";

const socialLinks: { platform: SocialPlatform; href: string; label: string }[] = [
  { platform: "instagram", href: "https://instagram.com/magis.realty", label: "Instagram" },
];

const columns = [
  {
    heading: "Explore",
    links: [
      { href: "/services", label: "Buy, Sell & Rent" },
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
            Cebu&apos;s trusted brokerage for OFWs, investors &amp; families —
            with unlimited after-sales support. Buy. Sell. Rent.
          </p>
          <div className="mt-5 flex gap-3">
            {socialLinks.map(({ platform, href, label }) => (
              <a
                key={platform}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-navy-950"
              >
                <SocialIcon platform={platform} size={16} />
              </a>
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
          <p>PRC LICENSE NO. 0020102 &nbsp;&nbsp; DHSUD REG NO. B-01/19-0204</p>
        </div>
      </div>
    </footer>
  );
}
