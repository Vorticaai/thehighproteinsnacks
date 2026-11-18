import type { Product } from "@/lib/products"

/** Small pill shown on cards for products checked against a label source. */
export function VerifiedPill({ product }: { product: Product }) {
  if (product.verification.status !== "verified") return null
  return (
    <span className="inline-flex items-center rounded-full border border-[#006F6D]/30 bg-[#006F6D]/5 px-2 py-0.5 text-[10px] font-semibold text-[#006F6D]">
      Label-checked
    </span>
  )
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })

/** Where this product's nutrition numbers came from, and when. */
export function NutritionSource({ product }: { product: Product }) {
  const v = product.verification
  if (v.status === "verified" && v.checkedAt) {
    return (
      <div className="rounded-2xl border border-[#006F6D]/20 bg-[#006F6D]/5 p-4 text-sm text-gray-700">
        <p className="font-semibold text-[#006F6D]">Checked against the manufacturer label data</p>
        <p className="mt-1">
          Nutrition per serving matches{" "}
          {v.sources.map((s, i) => (
            <span key={s.name}>
              {i > 0 && (i === v.sources.length - 1 ? " and " : ", ")}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                {s.name}
              </a>
            </span>
          ))}
          , checked {formatDate(v.checkedAt)}. Recipes change, so check the package too.
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Not yet checked against a label</p>
      <p className="mt-1">
        These numbers come from our original research and may be out of date. We are checking every
        product against manufacturer label data; until then, rely on the package.
      </p>
    </div>
  )
}
