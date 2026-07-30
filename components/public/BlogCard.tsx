import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { BlogPost } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="navy">{post.category}</Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-bold leading-snug text-navy-900">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-xs text-gray-500">
          <span>{post.author}</span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {post.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
