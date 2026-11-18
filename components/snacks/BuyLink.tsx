"use client"

import type { ReactNode } from "react"
import { trackAmazonClick } from "@/lib/analytics"

type BuyLinkProps = {
  href: string
  productName: string
  productId: string
  className?: string
  children: ReactNode
}

/**
 * Outbound retailer link. Marked rel="sponsored" because it is an affiliate
 * link, and tracked in GA4 as an `amazon_click` event.
 */
export default function BuyLink({ href, productName, productId, className, children }: BuyLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => trackAmazonClick(productName, productId)}
      className={className}
    >
      {children}
    </a>
  )
}
