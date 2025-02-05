/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // 禁用自动静态优化
  staticPageGenerationTimeout: 1000,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig; 