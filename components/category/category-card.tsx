/**
 * Card summarising a snack category for the homepage grid.
 */
import Link from "next/link"
import { categories } from "@/data/categories"
import type { Category } from "@/data/types"
import { ArrowRight } from "lucide-react"

type CategoryCardProps = {
  category: Category
}

export function CategoryGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-4">
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
          {category.primaryKeyword}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="mb-2 font-display text-2xl font-bold text-gray-900">{category.title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">{category.description}</p>

      {/* Hero Copy */}
      <p className="mb-4 text-sm leading-relaxed text-gray-600">{category.heroCopy}</p>

      {/* Secondary Keywords */}
      <div className="mb-6 flex flex-wrap gap-2">
        {category.secondaryKeywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-block rounded-md bg-gray-50 px-3 py-1 text-xs text-gray-700"
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href={`/category/${category.slug}`}
        className="inline-flex items-center rounded-full bg-[#CCFF00] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#A3CC00]"
      >
        View snacks <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  )
}
