import type { Product } from "@/lib/products";

export function uniqueByBrand(products: Product[]) {
  const seen = new Set<string>();
  return products.filter((p) => {
    const brand = p.brand.toLowerCase();
    if (seen.has(brand)) return false;
    seen.add(brand);
    return true;
  });
}
