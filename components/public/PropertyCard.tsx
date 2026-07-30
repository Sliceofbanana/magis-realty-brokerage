import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Ruler, Heart } from "lucide-react";
import { Property } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";

const statusTone: Record<Property["status"], "navy" | "green" | "gold" | "red"> = {
  "For Sale": "navy",
  Sold: "green",
  Pending: "gold",
  Exclusive: "red",
};

export function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/properties/${property.slug}`} className="relative block h-56 w-full overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone={statusTone[property.status]}>{property.status}</Badge>
        </div>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-900">
          <Heart size={14} />
        </span>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/properties/${property.slug}`}>
            <h3 className="font-serif text-lg font-bold leading-snug text-navy-900">
              {property.title}
            </h3>
          </Link>
          <p className="shrink-0 font-serif text-lg font-bold text-navy-900">
            {formatCurrency(property.price)}
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-500">{property.location}</p>

        <div className="mt-4 flex items-center gap-4 border-t border-black/5 pt-4 text-xs text-gray-600">
          {property.beds > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} /> {property.beds} Beds
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bath size={14} /> {property.baths} Baths
          </span>
          <span className="flex items-center gap-1">
            <Ruler size={14} /> {property.area.toLocaleString()} sqm
          </span>
        </div>

        <Link
          href={`/properties/${property.slug}`}
          className="mt-4 block w-full rounded-md border border-navy-900 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
