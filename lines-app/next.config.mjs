/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  i18n: {
    locales: ["he"],
    defaultLocale: "he"
  }
};

export default nextConfig;


