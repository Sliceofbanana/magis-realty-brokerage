import { ReactNode } from "react";

export function PageHeader({
  breadcrumb,
  title,
  description,
  action,
}: {
  breadcrumb?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {breadcrumb && <p className="text-xs text-gray-400">{breadcrumb}</p>}
        <h1 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
