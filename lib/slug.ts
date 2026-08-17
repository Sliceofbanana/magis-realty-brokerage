export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Appends -2, -3, ... to the base slug until existsCheck reports no collision. */
export async function uniqueSlug(
  base: string,
  existsCheck: (slug: string) => Promise<boolean>
): Promise<string> {
  const cleanBase = slugify(base) || "item";
  let candidate = cleanBase;
  let n = 2;
  while (await existsCheck(candidate)) {
    candidate = `${cleanBase}-${n}`;
    n++;
  }
  return candidate;
}
