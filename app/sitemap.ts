/**
 * Generates a minimal sitemap for critical pages.
 */
import type { MetadataRoute } from "next"
import { categories } from "@/data/categories"
import { snacks } from "@/data/snacks"
import { absoluteUrl } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog/how-to-choose-high-protein-snacks"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  const categoryEntries = categories.map((category) => ({
    url: absoluteUrl(`/category/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const snackEntries = snacks.map((snack) => ({
    url: absoluteUrl(`/snack/${snack.id}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...categoryEntries, ...snackEntries]
}


