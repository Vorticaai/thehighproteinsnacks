import Link from "next/link"
import { getAllProducts } from "@/lib/products"
import { categoryFilters } from "@/lib/categoryFilters"

type ExploreCategory = {
  slug: keyof typeof categoryFilters | "halal"
  title: string
  desc: string
  icon: string
  href: string
}

const exploreCategories: ExploreCategory[] = [
  {
    slug: "best-value",
    title: "Best Value",
    desc: "Highest protein per dollar right now",
    icon: "💸",
    href: "/snacks/best-value",
  },
  {
    slug: "low-sugar",
    title: "Low Sugar",
    desc: "≤2g sugar to prevent insulin spikes",
    icon: "🍬",
    href: "/snacks/low-sugar",
  },
  {
    slug: "weight-loss",
    title: "Weight Loss",
    desc: "Under 200 calories, designed to keep you full",
    icon: "⚖️",
    href: "/snacks/weight-loss",
  },
  {
    slug: "keto",
    title: "Keto",
    desc: "Low net carbs with serious flavor",
    icon: "🥑",
    href: "/snacks/keto",
  },
  {
    slug: "high-protein",
    title: "High Protein",
    desc: "20g+ protein per serving picks",
    icon: "💪",
    href: "/snacks/high-protein",
  },

  // ⭐ NEW — Halal category
  {
    slug: "halal",
    title: "Halal Snacks",
    desc: "Certified halal high-protein picks",
    icon: "🕌",
    href: "/snacks/halal",
  },
]

const formatCount = (count: number) => {
  if (count === 0) return "No snacks yet"
  return `${count} snack${count === 1 ? "" : "s"}`
}

export default function ExploreCategoryRow() {
  const products = getAllProducts()

  return (
    <section className="my-20">
      <h2 className="mb-10 text-center text-3xl font-black text-gray-900">
        Explore by Category
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exploreCategories.map((category) => {
          const filterFn = categoryFilters[category.slug]
          if (!filterFn) return null
          let count = 0;

          if (category.slug === "best-value") {
            count = products.filter((p) => p.proteinPerDollar >= 12).length;
          } else if (filterFn) {
            count = products.filter(filterFn).length;
          }
          

          return (
            <Link
              key={category.slug}
              href={category.href}
              className="group block rounded-2xl bg-white p-8 shadow-sm border-2 border-[#C6FF47] hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-[#C6FF47] transition"
            >
              <div className="mb-4 text-4xl">{category.icon}</div>
              <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{category.desc}</p>
              <p className="mt-4 text-sm font-semibold text-[#006F6D]">
                {formatCount(count)}
              </p>
              <span className="mt-6 inline-block font-bold text-[#0B1F1E] group-hover:underline">
                View snacks →
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
