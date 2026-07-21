import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: { domains: ['localhost'] },
  experimental: { optimizePackageImports: ['lucide-react', '@radix-ui/react-*'] },
};

export default nextConfig;
