/**
 * Reusable Product schema component for JSON-LD structured data.
 * Outputs @type: "Product" using a script tag.
 */
type ProductSchemaProps = {
  name: string
  description: string
  image: string
  brand: string
  rating?: number
  price?: number
  nutrition: {
    protein: number
    calories: number
  }
  url: string
}

export function ProductSchema({
  name,
  description,
  image,
  brand,
  rating,
  price,
  nutrition,
  url,
}: ProductSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    nutrition: {
      "@type": "NutritionInformation",
      proteinContent: `${nutrition.protein} g`,
      calorieContent: `${nutrition.calories} cal`,
    },
    url,
  }

  if (rating !== undefined) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      reviewCount: 12,
    }
  }

  if (price !== undefined) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
    }
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}


