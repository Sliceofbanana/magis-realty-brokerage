"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    router.push("/portal");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden h-[560px] lg:block lg:h-auto">
        <Image
          src="/images/landing-page-photo.png"
          alt="A Magis Realty luxury coastal resort listing at dusk"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/70" />
        <div className="relative flex h-full flex-col justify-end p-10 xl:p-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            The Agent Portal
          </p>
          <h1 className="mt-2 max-w-md font-serif text-4xl font-bold leading-tight text-white">
            Empowering Excellence in Elite Real Estate.
          </h1>
          <span className="mt-4 h-1 w-16 rounded bg-gold-500" />
          <p className="mt-4 max-w-sm text-sm text-white/80">
            Access your portfolio, client leads, and market analytics through
            our proprietary brokerage interface.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-3xl font-bold text-navy-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your credentials to access the portal.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
              >
                Professional Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="agent@magisrealty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900"
                >
                  Security Password
                </label>
                <button type="button" className="text-xs font-medium text-navy-900 hover:text-gold-600">
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-3 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-navy-900" />
              Remember this device
            </label>

            <Button type="submit" className="w-full">
              Enter Portal
            </Button>
          </form>

          <div className="my-6 border-t border-black/10" />

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/portal")}
          >
            Skip Login (Demo)
          </Button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Bypasses authentication for this presentation build.
          </p>

          <p className="mt-6 text-center text-sm text-gray-600">
            New to the network?{" "}
            <Link href="/contact" className="font-semibold text-navy-900 hover:text-gold-600">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
