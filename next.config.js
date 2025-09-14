/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'via.placeholder.com', 'picsum.photos', 'commondatastorage.googleapis.com'],
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  }
}

module.exports = nextConfig
