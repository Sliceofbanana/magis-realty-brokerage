import Image from "next/image";
import Link from "next/link";
import { Ban, Home, Compass, MessageCircle } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { Footer } from "@/components/public/Footer";
import { Button } from "@/components/ui/Button";
import { exteriors } from "@/lib/stockPhotos";

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-600">
              <Ban size={14} /> Error 404
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-navy-900 sm:text-5xl">
              The property you&rsquo;re looking for has moved.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
              We apologize for the inconvenience. The page may have been
              relocated, or the link you followed is no longer active.
              Let&rsquo;s get you back on track to finding your dream
              residence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/">
                <Home size={16} /> Go Back Home
              </Button>
              <Button href="/properties" variant="outline">
                <Compass size={16} /> View Properties
              </Button>
            </div>

            <div className="mt-10 border-t border-black/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Helpful Links
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link href="/agents" className="font-semibold text-navy-900 hover:text-gold-600">
                  Contact an Agent
                </Link>
                <Link href="/faqs" className="font-semibold text-navy-900 hover:text-gold-600">
                  Buying Guide
                </Link>
                <Link href="/blog" className="font-semibold text-navy-900 hover:text-gold-600">
                  Market Trends
                </Link>
              </div>
            </div>
          </div>

          <div className="relative h-80 overflow-hidden rounded-2xl sm:h-[420px]">
            <Image
              src={exteriors.darkModernHouseDusk}
              alt="A modern desert residence at dusk"
              fill
              className="object-cover"
            />
            <p className="absolute inset-0 flex items-center justify-center font-serif text-[9rem] font-bold text-white/20">
              404
            </p>
            <div className="absolute bottom-4 right-4 max-w-[220px] rounded-xl bg-white/95 p-4 shadow-lg">
              <p className="font-serif text-sm font-bold text-navy-900">Lost at home?</p>
              <p className="mt-1 text-xs text-gray-500">
                Let our expert consultants guide you to the right destination.
              </p>
              <button
                type="button"
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-gold-600 hover:underline"
              >
                <MessageCircle size={12} /> Chat With Us
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
