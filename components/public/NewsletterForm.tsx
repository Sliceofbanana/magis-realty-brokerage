"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className={`flex items-center justify-center gap-2 text-sm ${
          variant === "light" ? "text-emerald-600" : "text-gold-300"
        } ${className}`}
      >
        <CheckCircle2 size={18} />
        You&apos;re subscribed. Welcome to the Magis Letter.
      </div>
    );
  }

  if (variant === "light") {
    return (
      <form onSubmit={handleSubmit} noValidate className={className}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Your Professional Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            className="w-full flex-1 rounded-md border border-black/15 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-gray-400 focus:border-navy-900 focus:outline-none"
          />
          <Button type="submit" size="md" className="shrink-0">
            Subscribe Now
          </Button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        <p className="mt-3 text-xs text-gray-400">
          By subscribing, you agree to our{" "}
          <Link href="/privacy-policy" className="text-navy-900 hover:text-gold-600 hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/faqs" className="text-navy-900 hover:text-gold-600 hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        placeholder="Your professional email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!error}
        className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-gold-400 focus:outline-none"
      />
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      <Button type="submit" variant="gold" size="sm" className="mt-3 w-full">
        Subscribe Now
      </Button>
    </form>
  );
}
