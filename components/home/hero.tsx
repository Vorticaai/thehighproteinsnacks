/**
 * Homepage hero with elevator pitch and quick category links.
 */
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { categories } from "@/data/categories"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="mb-10 rounded-3xl border bg-gradient-to-br from-white via-white to-orange-50 px-8 py-12 shadow-sm">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          The High Protein Snacks
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">
          Compare trusted snacks by protein, calories, price, and diet tags.
        </h1>
        <p className="text-lg text-muted-foreground">
          Built for nutrition nerds and shoppers who want simple answers fast.
          Filter by macros, diet requirements, and value to find the perfect
          bite for every goal.
        </p>
        <div className="flex flex-wrap gap-3">
          {["Vegan friendly", "Under 200 calories", "Best protein per dollar"].map(
            (item) => (
              <Badge
                key={item}
                variant="secondary"
                className="rounded-full px-4 py-1 text-sm"
              >
                {item}
              </Badge>
            ),
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link href="/category/weight-loss">
              Start with weight loss picks <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/blog/how-to-choose-high-protein-snacks">
              How the directory works
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {categories.slice(0, 4).map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="pill hover:border-primary hover:text-primary"
          >
            {category.title}
          </Link>
        ))}
      </div>
    </section>
  )
}



