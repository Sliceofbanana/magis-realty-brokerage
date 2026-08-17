import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magis Realty & Brokerage",
  description:
    "Empowering excellence in elite real estate. Magis Realty & Brokerage connects discerning buyers and investors with the Philippines' most prestigious properties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No server-side session fetch here on purpose: calling auth() would make
  // every route dynamic, including the fully static public marketing pages.
  // The portal layout fetches its own session (that subtree is already
  // dynamic/protected by middleware); this outer provider just gives
  // next-auth/react a context to hydrate into if a nested one isn't present.
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-navy-900">
        <AuthSessionProvider session={null}>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
