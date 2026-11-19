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
      { source: "/snack/:id", destination: "/snacks/:id", permanent: true },
    ]
  },
  eslint: {
    dirs: ["app", "components", "data", "lib"],
  },
}

export default nextConfig
