import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center">
      <Image
        src={light ? "/images/footer-logo.png" : "/images/logo.png"}
        alt="Magis Realty & Brokerage"
        width={1200}
        height={542}
        priority
        className="h-11 w-auto object-contain"
      />
    </Link>
  );
}
