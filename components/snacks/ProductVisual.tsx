import type { Product } from "@/lib/products"
import LabelCard from "@/components/snacks/LabelCard"

type Props = {
  product: Product
  size?: "sm" | "lg"
  className?: string
}

/**
 * Shows the product's licensed photo with its credit line, or the generated
 * label card when no licensed photo exists. Photos from Open Food Facts are
 * CC BY-SA, which requires the credit to stay next to the image.
 */
export default function ProductVisual({ product, size = "sm", className = "" }: Props) {
  const image = product.image
  if (!image) return <LabelCard product={product} size={size} className={className} />

  const large = size === "lg"
  return (
    <figure className={`flex h-full w-full flex-col ${className}`}>
      <div
        className={`flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-white ${
          large ? "min-h-[320px] p-6" : "min-h-[100px] p-2"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          loading={large ? "eager" : "lazy"}
          className={`w-auto object-contain ${large ? "max-h-[360px]" : "max-h-[96px]"}`}
        />
      </div>
      <figcaption className={`mt-1 px-1 text-gray-500 ${large ? "text-xs leading-snug" : "text-[9px] leading-tight"}`}>
        Photo:{" "}
        <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {image.credit}
        </a>
        ,{" "}
        <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline">
          {image.license}
        </a>
      </figcaption>
    </figure>
  )
}
