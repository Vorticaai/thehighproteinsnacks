import SnackGridPage from "@/components/snacks/snack-grid-page"
import { getAllProducts } from "@/lib/products"
import { categoryFilters } from "@/lib/categoryFilters"

export default function HalalSnacksPage() {
  const halalFilter = categoryFilters.halal
  const products = getAllProducts().filter(halalFilter)

  return (
    <SnackGridPage
      title="Halal Snacks"
      description="Certified halal high-protein snacks"
      products={products}
    />
  )
}
