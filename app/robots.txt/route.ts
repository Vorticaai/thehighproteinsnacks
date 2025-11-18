/**
 * Robots.txt route so search engines know how to crawl the directory.
 */
import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

export function GET(): Response {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}`

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}


