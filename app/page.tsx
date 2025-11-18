/**
 * Homepage stitches together the hero, categories, featured snacks, and explainer.
 */
import { FeaturedSnacks } from "@/components/home/featured-snacks"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/category/category-card"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "High-protein snacks directory",
  description:
    "Compare high-protein snacks by macros, diet tags, and price before you buy.",
  path: "/",
})

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <Hero />
      <CategoryGrid />
      <FeaturedSnacks />
      <Explainer />
    </main>
  )
}

function Explainer() {
  const steps = [
    {
      title: "Browse by goal",
      body: "Pick a category such as budget, weight loss, or vegan to see curated snacks.",
    },
    {
      title: "Dial in filters",
      body: "Use protein, calories, diet toggles, and price-per-protein to refine results.",
    },
    {
      title: "Review details",
      body: "Each snack page breaks down macros, benefits, FAQs, and store links.",
    },
  ]
  return (
    <section className="rounded-3xl border bg-white px-8 py-10 shadow-sm">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          How the directory works
        </h2>
        <p className="text-muted-foreground">
          We designed this like a nutrition-first marketplace you can duplicate for
          other niches later.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className="rounded-2xl border border-dashed border-gray-200 p-5"
          >
            <p className="text-sm font-semibold text-primary">Step {idx + 1}</p>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
