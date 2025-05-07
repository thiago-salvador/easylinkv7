/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Prevent server-side rendering for client components
    serverComponentsExternalPackages: ['react-i18next'],
  },
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
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Prevent server-side rendering for client components
    serverComponentsExternalPackages: ['react-i18next'],
  },
  // Configuração do Webpack
  webpack: (config, { isServer, dev }) => {
    // Resolver problema de canvas com React PDF (manter esta linha)
    config.resolve.alias.canvas = false;

    // Adicionar regra para tratar arquivos .mjs corretamente
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto", // Isso ajuda o Webpack a entender que .mjs é JavaScript e deve ser tratado como módulo
    });

    // Opcional: Se o problema com o Terser persistir APENAS para o pdf.worker.min.mjs,
    // podemos tentar excluir esse arquivo específico da minificação do Terser.
    // Descomente as linhas abaixo APENAS SE a configuração acima não resolver o erro do Terser.
    /*
    if (!dev && !isServer) { // Aplicar somente para build de cliente em produção
      config.optimization.minimizer = config.optimization.minimizer.map(plugin => {
        if (plugin.constructor.name === 'TerserPlugin') {
          if (!plugin.options) {
            plugin.options = {};
          }
          if (!plugin.options.exclude) {
            plugin.options.exclude = [];
          }
          // Adiciona uma regex para excluir o worker do pdf.js
          // Isso pode ser ajustado se o nome do arquivo for diferente no seu build
          plugin.options.exclude.push(/\bpdf\.worker\.min\.(?:[a-f0-9]+\.)?mjs$/);
        }
        return plugin;
      });
    }
    */

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://js.stripe.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://wncnyqowqxcrfizfdcfq.supabase.co; connect-src 'self' https://vitals.vercel-insights.com https://api.stripe.com https://cdn.jsdelivr.net https://unpkg.com https://wncnyqowqxcrfizfdcfq.supabase.co; frame-src 'self' https://js.stripe.com; worker-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com;",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;