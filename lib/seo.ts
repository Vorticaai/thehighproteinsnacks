/**
 * Centralised helpers for SEO metadata so every route can stay consistent.
 */
import type { Metadata } from "next"

const SITE_NAME = "The High Protein Snacks"
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehighproteinsnacks.com"
  const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`


export const defaultMeta = {
  title: SITE_NAME,
  description:
    "Compare high-protein snacks by macros, diet tags, price, and ratings.",
}

type BuildMetadataOptions = {
  title: string
  description: string
  path?: string
  ogImage?: string
}

export const absoluteUrl = (path = "/") =>
  new URL(path, SITE_URL).toString()

export function buildMetadata({
  title,
  description,
  path = "/",
  ogImage,
}: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(path)
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    keywords: [
      "high protein snacks",
      "low sugar snacks",
      "keto snacks",
      "vegan protein bars",
      "healthy snacks",
    ],
    
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: ogImage || DEFAULT_OG_IMAGE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage || DEFAULT_OG_IMAGE],
    },
    
  }
}

