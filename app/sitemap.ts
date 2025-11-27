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

  products.forEach((product) => {
    entries.push({
      url: absoluteUrl(`/snacks/${product.id}`),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  guides.forEach((guide) => {
    entries.push({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return entries;
}
