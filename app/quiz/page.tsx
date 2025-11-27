import type { Metadata } from "next"
import SnackFinderClient from "@/components/quiz/SnackFinderClient"
import { getAllProducts } from "@/lib/products"

export const metadata: Metadata = {
  title: "Snack Finder Quiz | The High Protein Snacks",
  description:
    "Answer a few quick questions and get matched with the best high-protein snacks for your taste, macros, and diet.",
  openGraph: {
    title: "Snack Finder Quiz | The High Protein Snacks",
    description:
      "Find your ideal high-protein snacks based on your goals, diet, and flavor preferences.",
    images: ["/og-default.jpg"],
  },
}

export default function QuizPage() {
  const products = getAllProducts()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SnackFinderClient products={products} />
    </main>
  )
}

