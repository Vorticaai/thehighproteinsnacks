/**
 * Next.js configuration for the High Protein Snacks directory.
 */
const nextConfig = {
  async redirects() {
    return [
      // Old duplicate product route; /snacks/[slug] is the one canonical URL.
      // Duplicate products merged (same USDA label record).
      { source: "/snacks/quest-cheddar-blast-chips", destination: "/snacks/quest-chips-cheddar-sourcream", permanent: true },
      { source: "/snack/quest-cheddar-blast-chips", destination: "/snacks/quest-chips-cheddar-sourcream", permanent: true },
      { source: "/snacks/lenny-larry-complete-cookie-choc-chip", destination: "/snacks/lenny-larry-complete-cookie-protein-chocolate-chip", permanent: true },
      { source: "/snack/lenny-larry-complete-cookie-choc-chip", destination: "/snacks/lenny-larry-complete-cookie-protein-chocolate-chip", permanent: true },
      { source: "/snacks/quest-nutrition-protein-puffs-ranch", destination: "/snacks/quest-ranch-protein-chips", permanent: true },
      { source: "/snack/quest-nutrition-protein-puffs-ranch", destination: "/snacks/quest-ranch-protein-chips", permanent: true },
      { source: "/snack/:id", destination: "/snacks/:id", permanent: true },
      // /guides/[slug] (data/guides.ts) duplicated two of the standalone
      // "best-high-protein-snacks-for-*" pages under a different URL, with
      // neither cross-linked nor consolidated — same search intent, two
      // self-canonicalizing pages. Consolidating onto the standalone pages
      // (shorter, more natural URLs; already the pattern road-trips/
      // office-and-desk use).
      { source: "/guides/best-high-protein-snacks-for-weight-loss", destination: "/best-high-protein-snacks-for-weight-loss", permanent: true },
      { source: "/guides/best-keto-snacks", destination: "/best-high-protein-snacks-for-keto", permanent: true },
    ]
  },
  eslint: {
    dirs: ["app", "components", "data", "lib"],
  },
}

export default nextConfig
