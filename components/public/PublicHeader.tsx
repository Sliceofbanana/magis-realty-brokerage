"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/properties", label: "Properties" },
  { href: "/agents", label: "Agents" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-navy-900 underline decoration-gold-500 decoration-2 underline-offset-8"
                    : "text-gray-600 hover:text-navy-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-navy-900 hover:text-gold-600"
          >
            Login
          </Link>
          <Button href="/contact" size="sm">
            Inquire Now
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-navy-900 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <nav
            className="flex flex-col gap-1 px-4 py-4"
            aria-label="Mobile primary"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium text-navy-900 hover:bg-navy-900/5"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-sm font-medium text-navy-900 hover:bg-navy-900/5"
            >
              Login
            </Link>
            <Button href="/contact" size="sm" className="mt-2 w-full">
              Inquire Now
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
