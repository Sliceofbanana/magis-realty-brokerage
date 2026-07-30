import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Bath,
  Ruler,
  Car,
  MapPin,
  BadgeCheck,
  Star,
  CalendarDays,
  Share2,
  ExternalLink,
} from "lucide-react";
import { properties, getPropertyBySlug } from "@/lib/data/properties";
import { getAgentBySlug } from "@/lib/data/agents";
import { PropertyCard } from "@/components/public/PropertyCard";
import { SimpleForm, FormField } from "@/components/public/SimpleForm";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  return { title: property ? `${property.title} | Magis Realty & Brokerage` : "Property Not Found" };
}

const inquiryFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe", span: "full" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", span: "full" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+1 (555) 000-0000", span: "full" },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    placeholder: "I am interested in scheduling a viewing...",
    span: "full",
    required: false,
  },
];

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const agent = getAgentBySlug(property.agentId);
  const similar = properties.filter((p) => p.id !== property.id).slice(0, 3);
  const galleryImages = [property.image, ...property.gallery].slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
        <Link href="/properties" className="hover:text-navy-900">
          Properties
        </Link>
        <span>/</span>
        <span className="text-navy-900">{property.title}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {property.verified && (
              <Badge tone="green">
                <BadgeCheck size={12} /> Verified
              </Badge>
            )}
            <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
              {property.collection}
            </span>
          </div>
          <h1 className="mt-2 max-w-2xl font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
            {property.title}
          </h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} /> {property.address}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">Asking Price</p>
          <p className="font-serif text-3xl font-bold text-navy-900">
            {formatCurrency(property.price)}
          </p>
          <p className="text-xs text-gray-500">
            ₱{property.pricePerSqft.toLocaleString()} / sq. ft.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:h-105 sm:grid-cols-[1.4fr_1fr]">
        <div className="relative h-64 overflow-hidden rounded-2xl sm:h-full">
          <Image src={property.image} alt={property.title} fill className="object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:h-full">
          {galleryImages.slice(1, 5).map((src, i) => (
            <div key={src + i} className="relative h-32 overflow-hidden rounded-2xl sm:h-full">
              <Image src={src} alt={`${property.title} photo ${i + 2}`} fill className="object-cover" />
              {i === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy-950/60 text-sm font-semibold text-white">
                  +12 More
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="grid grid-cols-2 gap-4 border-b border-black/10 pb-6 sm:grid-cols-4">
            {property.beds > 0 && (
              <div>
                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                  <BedDouble size={14} /> Bedrooms
                </p>
                <p className="mt-1 font-semibold text-navy-900">{property.beds} BR</p>
              </div>
            )}
            <div>
              <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                <Bath size={14} /> Bathrooms
              </p>
              <p className="mt-1 font-semibold text-navy-900">{property.baths} BA</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                <Ruler size={14} /> Living Area
              </p>
              <p className="mt-1 font-semibold text-navy-900">
                {property.area.toLocaleString()} sqft
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
                <Car size={14} /> Parking
              </p>
              <p className="mt-1 font-semibold text-navy-900">{property.parking} Slots</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-serif text-xl font-bold text-navy-900">Property Description</h2>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-gray-600">
              {property.description.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-serif text-xl font-bold text-navy-900">Premium Amenities</h2>
            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-navy-900">
                Neighborhood &amp; Location
              </h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-600"
              >
                Open in Google Maps <ExternalLink size={12} />
              </a>
            </div>
            <div className="relative mt-4 h-64 overflow-hidden rounded-2xl bg-sky-100">
              <iframe
                title={`Map of the area around ${property.address}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                <Badge tone="outline" className="bg-white/90">Dining (12+)</Badge>
                <Badge tone="outline" className="bg-white/90">Schools (3)</Badge>
                <Badge tone="outline" className="bg-white/90">Shopping (5)</Badge>
              </div>
            </div>
          </div>
        </div>

        {agent && (
          <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <Link href={`/agents/${agent.slug}`} className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full">
                <Image src={agent.photo} alt={agent.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold text-navy-900">{agent.name}</p>
                <p className="text-xs text-gray-500">{agent.title}</p>
                <p className="flex items-center gap-1 text-xs text-gold-600">
                  <Star size={12} className="fill-gold-500" /> {agent.rating.toFixed(1)} ({agent.reviews} Reviews)
                </p>
              </div>
            </Link>

            <h3 className="mt-6 font-serif text-lg font-bold text-navy-900">
              Inquire About This Property
            </h3>
            <SimpleForm fields={inquiryFields} submitLabel="Send Inquiry" className="mt-4 grid-cols-1" />

            <div className="mt-4 flex flex-col gap-2 border-t border-black/5 pt-4 text-sm">
              <button
                type="button"
                className="flex items-center gap-2 font-semibold text-navy-900 hover:text-gold-600"
              >
                <CalendarDays size={16} /> Schedule a Tour
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-gray-500 hover:text-navy-900"
              >
                <Share2 size={16} /> Share This Listing
              </button>
            </div>
          </aside>
        )}
      </div>

      <div className="mt-16">
        <div className="flex items-end justify-between border-b border-black/10 pb-4">
          <h2 className="font-serif text-2xl font-bold text-navy-900">Similar Luxury Residences</h2>
          <Link
            href="/properties"
            className="text-sm font-semibold text-navy-900 hover:text-gold-600"
          >
            View All Listings →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
