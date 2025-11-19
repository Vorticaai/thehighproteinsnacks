import Hero from "@/components/home/hero"
import { FeaturedSnacks } from "@/components/home/featured-snacks"
import { CategoryGrid } from "@/components/category/category-card"
import { ToolsSection } from "@/components/home/tools-section"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Compare trusted snacks by protein, calories, price, and diet tags",
  description:
    "Built for nutrition nerds and shoppers who want simple answers fast. Filter by macros, diet requirements, and value to find the perfect bite for every goal.",
  path: "/",
})

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Browse Categories Section */}
        <section>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900">
              Browse categories
            </h2>
            <p className="mt-2 text-gray-600">
              Each angle highlights snacks with specific macros, budgets, or diet tags.
            </p>
          </div>
          <CategoryGrid />
        </section>

        {/* Tools & Guides Section */}
        <ToolsSection />

        {/* Featured Snacks Section */}
        <section>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900">
              Featured snacks
            </h2>
            <p className="mt-2 text-gray-600">
              Real data you can test: handpicked at the editor's picks.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <FeaturedSnacks />
          </div>
        </section>

        {/* How the Directory Works Section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
          <header className="mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900">
              How the directory works
            </h2>
            <p className="mt-2 text-gray-600">
              We designed this like a nutrition-first marketplace you can duplicate for other niches later.
            </p>
          </header>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center rounded-lg bg-[#006F6D] px-3 py-1.5 text-sm font-bold text-white">
                Step 1
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900">
                Browse by goal
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Pick a category such as budget, weight loss, or vegan to see curated snacks.
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center rounded-lg bg-[#006F6D] px-3 py-1.5 text-sm font-bold text-white">
                Step 2
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900">
                Dial in filters
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Use protein, calories, diet toggles, and price-per-protein to refine results.
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center rounded-lg bg-[#006F6D] px-3 py-1.5 text-sm font-bold text-white">
                Step 3
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900">
                Review details
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Fast snack page breaks down macros, benefits, FAQs, and store links.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
