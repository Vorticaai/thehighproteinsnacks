/**
 * Next.js configuration for the High Protein Snacks directory.
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  eslint: {
    dirs: ["app", "components", "data", "lib"],
  },
}

export default nextConfig
