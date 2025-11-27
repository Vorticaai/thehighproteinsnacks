import SnackFinderClient from "@/components/quiz/SnackFinderClient"
import { getAllProducts } from "@/lib/products"

export default function QuizPage() {
  const products = getAllProducts()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SnackFinderClient products={products} />
    </main>
  )
}

