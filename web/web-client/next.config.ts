import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['avatars.githubusercontent.com'], // 添加允许的图像主机
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*', // 代理的请求路径
  //       destination: 'http://localhost:3000/api/:path*', // 目标服务器地址
  //     },
  //   ];
  // },
};

export default nextConfig;
