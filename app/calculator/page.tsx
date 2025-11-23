import { getAllProducts } from "@/lib/products"
import Breadcrumbs from "@/components/nav/Breadcrumbs"
import CalculatorForm from "@/components/calculator/CalculatorForm"

export const revalidate = 3600 // 1 hour

export default function CalculatorPage() {
  const products = getAllProducts()

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:py-12">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Protein Calculator" },
        ]}
      />

      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-gray-900 md:text-5xl">
          High-Protein Intake Calculator
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Estimate how much protein you need per day — and get snack
          recommendations based on your macros.
        </p>
      </div>

      {/* Client form with full snack list */}
      <CalculatorForm snacks={products} />
    </main>
  )
}
