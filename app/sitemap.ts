import type { MetadataRoute } from "next";
import { guides } from "@/data/guides";
import { absoluteUrl } from "@/lib/seo";
import { getAllProducts } from "@/lib/products";
import { categorySlugs } from "@/lib/snackFilters";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const products = getAllProducts();

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: today,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/snacks"),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/guides"),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/calculator"),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/quiz"),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/how-we-review"),
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.4,
    },

  ];

  const categorySet = new Set([
    "best-value",
    "low-sugar",
    "weight-loss",
    ...categorySlugs,
  ]);

  categorySet.forEach((slug) => {
    entries.push({
      url: absoluteUrl(`/snacks/${slug}`),
      lastModified: today,
      changeFrequency: "weekly",
      priority: slug === "best-value" ? 0.85 : 0.8,
    });
  });

  entries.push({
    url: absoluteUrl("/snacks/halal-protein-bars"),
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.8,
  });

  products.forEach((product) => {
    entries.push({
      url: absoluteUrl(`/snacks/${product.id}`),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  // These two data/guides.ts slugs now permanently redirect to the
  // standalone pages below (see next.config.mjs) — list the destination,
  // not a URL that immediately 301s.
  const redirectedGuideSlugs = new Set([
    "best-high-protein-snacks-for-weight-loss",
    "best-keto-snacks",
  ]);

  guides
    .filter((guide) => !redirectedGuideSlugs.has(guide.slug))
    .forEach((guide) => {
      entries.push({
        url: absoluteUrl(`/guides/${guide.slug}`),
        lastModified: today,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

  // Standalone long-tail guide pages (app/best-high-protein-snacks-for-*):
  // real, substantial content pages that were missing from the sitemap
  // entirely, so search engines had no declared path to them.
  [
    "best-high-protein-snacks-for-weight-loss",
    "best-high-protein-snacks-for-keto",
    "best-high-protein-snacks-for-road-trips",
    "best-high-protein-snacks-for-office-and-desk",
  ].forEach((slug) => {
    entries.push({
      url: absoluteUrl(`/${slug}`),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return entries;
}
