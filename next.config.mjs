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
  experimental: {
    // A configuração de serverActions é mantida aqui
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // A função async headers() foi REMOVIDA daqui
};

export default nextConfig;
