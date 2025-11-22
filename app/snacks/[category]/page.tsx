import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/snacks/ProductCard"
import {
  categorySlugs,
  getCategoryDetails,
  getProductsByCategory,
  type CategorySlug,
} from "@/lib/snackFilters"

type CategoryPageProps = {
  params: { category: CategorySlug }
}

export async function generateStaticParams() {
  return categorySlugs.map((category) => ({ category }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const details = getCategoryDetails(params.category)
  if (!details) {
    return {
      title: "Snack category not found",
      description: "This snack category does not exist.",
    }
  }

  const url = `https://thehighproteinsnacks.com/snacks/${params.category}`

  return {
    title: details.seoTitle,
    description: details.seoDescription,
    openGraph: {
      title: details.seoTitle,
      description: details.seoDescription,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: details.seoTitle,
      description: details.seoDescription,
    },
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const slug = params.category
  const details = getCategoryDetails(slug)

  if (!details) {
    notFound()
  }

  const products = getProductsByCategory(slug)

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: details.title,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: product.buyUrl || `https://thehighproteinsnacks.com/snacks/${slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#006F6D]">
            Snack Directory
          </p>
          <h1 className="font-display mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            {details.title}
          </h1>
          <p className="text-lg text-gray-600">{details.description}</p>
        </header>

        {products.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
            No snacks are flagged for this category yet. Check back soon!
          </div>
        )}
      </main>
    </>
  )
}


