/**
 * Generates a complete sitemap for all pages on the site.
 * Includes homepage, categories, products, guides, and comparison pages.
 */
import type { MetadataRoute } from "next"
import { categories } from "@/data/categories"
import { snacks } from "@/data/snacks"
import { absoluteUrl } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static guide and comparison pages
  const staticGuidePaths = [
    "/calculator",
    "/quiz",
    "/best-high-protein-snacks-for-weight-loss",
    "/best-high-protein-snacks-for-keto",
    "/best-high-protein-snacks-for-road-trips",
    "/best-high-protein-snacks-for-office-and-desk",
    "/compare/quest-bars-vs-rxbars",
    "/blog/how-to-choose-high-protein-snacks",
  ]

  // Homepage
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ]

  // Guide and comparison pages
  const guideEntries = staticGuidePaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Category pages
  const categoryEntries = categories.map((category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  // Product pages
  const productEntries = snacks.map((snack) => ({
    url: absoluteUrl(`/snack/${snack.id}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [
    ...staticEntries,
    ...guideEntries,
    ...categoryEntries,
    ...productEntries,
  ]
}


