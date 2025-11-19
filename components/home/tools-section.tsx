import Link from "next/link"
import { Calculator, TrendingDown, Leaf } from "lucide-react"

const tools = [
  {
    id: "calculator",
    title: "High-Protein Intake Calculator",
    description: "Find your daily target and see snacks that fit your macros.",
    href: "/calculator",
    icon: Calculator,
  },
  {
    id: "weight-loss",
    title: "Best snacks for weight loss",
    description: "Low-sugar, high-protein snacks under 200 calories.",
    href: "/best-high-protein-snacks-for-weight-loss",
    icon: TrendingDown,
  },
  {
    id: "keto",
    title: "Best snacks for keto",
    description: "Low-carb, high-fat options perfect for keto diets.",
    href: "/best-high-protein-snacks-for-keto",
    icon: Leaf,
  },
]

export function ToolsSection() {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="font-display text-3xl font-bold text-gray-900">Tools & Guides</h2>
        <p className="mt-2 text-gray-600">
          Calculate your protein needs or explore curated lists for specific goals.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.id} href={tool.href} className="group">
              <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#006F6D] text-white">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-gray-900">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

