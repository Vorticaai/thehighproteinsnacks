import ProductCard from "@/components/snacks/ProductCard"
import type { Product } from "@/lib/products"

type SnackGridPageProps = {
  title: string
  description?: string
  products: Product[]
}

export default function SnackGridPage({
  title,
  description,
  products,
}: SnackGridPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-black text-gray-900">{title}</h1>
      {description ? (
        <p className="mt-4 text-lg text-gray-600">{description}</p>
      ) : null}

      {products.length === 0 ? (
        <p className="mt-10 text-gray-500">No snacks available yet. Check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}

