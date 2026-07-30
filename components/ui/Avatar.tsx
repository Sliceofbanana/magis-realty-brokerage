import Image from "next/image";

const palette = [
  "bg-navy-800",
  "bg-gold-500",
  "bg-navy-600",
  "bg-gold-600",
  "bg-navy-700",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function Avatar({
  src,
  initials,
  name,
  size = 40,
}: {
  src?: string;
  initials?: string;
  name?: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "Avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const label = initials ?? name?.slice(0, 2) ?? "?";
  const bg = palette[hashString(label) % palette.length];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${bg}`}
      style={{ width: size, height: size }}
    >
      {label}
    </div>
  );
}
