import { PublicHeader } from "@/components/public/PublicHeader";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
