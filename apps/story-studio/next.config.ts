import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.NEXT_STANDALONE ? 'standalone' : undefined,
  images: { domains: ['localhost'] },
  experimental: { optimizePackageImports: ['lucide-react', '@radix-ui/react-*'] },
};

export default nextConfig;
