/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Unique build ID on every deploy — busts Vercel's CDN cache for pages
  generateBuildId: async () => `build-${Date.now()}`,

  // Allow all Replit preview/dev origins so the iframe proxy always works,
  // regardless of which container or subdomain Replit assigns.
  allowedDevOrigins: [
    ...(process.env.REPLIT_DOMAINS ?? "")
      .split(",")
      .filter(Boolean)
      .map((d) => d.trim()),
    "*.replit.dev",
    "*.repl.co",
    "*.kirk.replit.dev",
    "*.picard.replit.dev",
  ],

  // Disable caching for all HTML pages so browsers always fetch fresh content.
  // Static JS chunks are still cached — they use content-addressed hashes.
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
