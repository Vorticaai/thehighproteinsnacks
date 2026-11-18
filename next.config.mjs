/**
 * Next.js configuration for the High Protein Snacks directory.
 */
const nextConfig = {
  async redirects() {
    return [
      // Old duplicate product route; /snacks/[slug] is the one canonical URL.
      { source: "/snack/:id", destination: "/snacks/:id", permanent: true },
    ]
  },
  eslint: {
    dirs: ["app", "components", "data", "lib"],
  },
}

export default nextConfig
