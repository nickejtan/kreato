/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

module.exports = nextConfig;
