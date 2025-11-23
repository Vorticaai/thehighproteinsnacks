import Link from "next/link";

export type BreadcrumbItem = {
  name: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-600"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.name} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-gray-900">
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900">{item.name}</span>
            )}
            {!isLast && <span className="text-gray-400">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

