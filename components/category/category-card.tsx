/**
 * Card summarising a snack category for the homepage grid.
 */
import Link from "next/link"
import { categories } from "@/data/categories"
import type { Category } from "@/data/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

type CategoryCardProps = {
  category: Category
}

export function CategoryGrid() {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900">Browse categories</h2>
        <p className="text-muted-foreground">
          Each angle highlights snacks with specific macros, budgets, or diet tags.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Card className="h-full border-gray-100 shadow-sm transition hover:-translate-y-1 hover:border-primary/40">
      <CardHeader>
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
          {category.primaryKeyword}
        </Badge>
        <h3 className="text-xl font-semibold">{category.title}</h3>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{category.heroCopy}</p>
        <div className="flex flex-wrap gap-2">
          {category.secondaryKeywords.map((keyword) => (
            <span key={keyword} className="pill bg-gray-50">
              {keyword}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/category/${category.slug}`}
          className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          View snacks <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}



