/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .filter(Boolean)
    .map((d) => d.trim()),
};

module.exports = nextConfig;
