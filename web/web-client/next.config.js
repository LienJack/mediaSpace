/** @type {import('next').NextConfig} */
const path = require('path');

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
  // experimental: {
  //   disablePrerendering: true, // 移除或修正这个选项
  // },
  
  // 禁用自动静态优化
  // staticPageGenerationTimeout: 1000,
  // reactStrictMode: true,
  // swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig; 