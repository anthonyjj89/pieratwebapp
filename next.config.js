/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true
  },
  // Ensure images from Discord CDN work
  images: {
    domains: ['cdn.discordapp.com']
  }
}

module.exports = nextConfig
