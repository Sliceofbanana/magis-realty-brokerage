"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm({ className = "" }: { className?: string }) {
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
      <div className={`flex items-center gap-2 text-sm text-gold-300 ${className}`}>
        <CheckCircle2 size={18} />
        You&apos;re subscribed. Welcome to the Magis Letter.
      </div>
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
