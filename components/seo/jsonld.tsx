/**
 * Lightweight helpers for rendering JSON-LD schema snippets.
 */
import { absoluteUrl } from "@/lib/seo"
import type { Category } from "@/data/types"
import type { Product } from "@/lib/products"

type JsonLdProps = {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function ItemListJsonLd({
  category,
  snacks,
}: {
  category: Category
  snacks: Product[]
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.title} snacks`,
    itemListElement: snacks.map((snack, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: snack.name,
      url: absoluteUrl(`/snacks/${snack.id}`),
    })),
  }

  return <JsonLd data={data} />
}

export function ArticleJsonLd({
  title,
  description,
  slug,
}: {
  title: string
  description: string
  slug: string
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Organization",
      name: "The High Protein Snacks",
    },
    url: absoluteUrl(`/blog/${slug}`),
  }
  return <JsonLd data={data} />
}



