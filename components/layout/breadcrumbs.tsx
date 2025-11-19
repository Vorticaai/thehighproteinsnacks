/**
 * Reusable breadcrumb navigation component
 * Maintains consistent styling across all pages
 */
import Link from "next/link"

export type Crumb = {
  label: string
  href?: string // if omitted, render as plain text (current page)
}

interface BreadcrumbsProps {
  items: Crumb[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-600">
      {items.map((crumb, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={index} className="flex items-center gap-2">
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-gray-900">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900">{crumb.label}</span>
            )}
            {!isLast && <span>/</span>}
          </span>
        )
      })}
    </nav>
  )
}

