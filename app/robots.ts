/**
 * Generates robots.txt to help search engines crawl the site.
 * Allows all bots to crawl all pages and points to the sitemap.
 */
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.thehighproteinsnacks.com/sitemap.xml",
  }
}
