import { Suspense } from "react"
import SnackFinderClient from "@/components/quiz/SnackFinderClient"
import { getAllProducts } from "@/lib/products"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

// Same tool as /quiz, so point search engines at /quiz.
export const metadata = {
  title: "Snack Finder Quiz | The High Protein Snacks",
  description: "Answer a few questions to find high-protein snacks that match your goals and diet.",
  alternates: { canonical: "/quiz" },
}

export default function SnackFinderPage() {
  const products = getAllProducts()
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Snack Finder Quiz" }]}
      />
      <Suspense>
        <SnackFinderClient products={products} />
      </Suspense>
    </main>
  )
}
