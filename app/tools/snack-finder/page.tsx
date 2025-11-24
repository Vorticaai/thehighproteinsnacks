import SnackFinderClient from "@/components/quiz/SnackFinderClient"
import { getAllProducts } from "@/lib/products"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

export default function SnackFinderPage() {
  const products = getAllProducts()
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs 
        items={[{ label: "Home", href: "/" }, { label: "Snack Finder Quiz" }]}
      />
      <SnackFinderClient products={products} />
    </main>
  )
}
