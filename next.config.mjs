/** @type {import('next').NextConfig} */

const nextConfig = {
    // Essas configurações ajudam com o build na Vercel
    output: 'standalone', // Otimiza para deployment
    
    // Configurações específicas para o problema de renderização estática
    // Evita que a Vercel faça SSG (Static Site Generation) durante o build
    // para páginas que usam componentes com 'use client'
    staticPageGenerationTimeout: 120, // tempo mais longo para gerar páginas estáticas
    
    // Configura o comportamento do erro CSR em páginas SSG
    onDemandEntries: {
      // Período que as páginas serão mantidas em memória
      maxInactiveAge: 60 * 1000,
      // Número máximo de páginas mantidas em memória
      pagesBufferLength: 5,
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
  
      // Opcional: Bloco para excluir pdf.worker.min.mjs do Terser (mantido comentado por enquanto)
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
            plugin.options.exclude.push(/\bpdf\.worker\.min\.(?:[a-f0-9]+\.)?mjs$/);
          }
          return plugin;
        });
      }
      */
  
      return config;
    },
    async headers() {
      // Tenta ler as variáveis de ambiente. Use valores padrão se não definidas durante o build.
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'URL_SUPABASE_PADRAO_SE_NAO_DEFINIDA';
      const cdnjsUrl = 'https://cdnjs.cloudflare.com'; // CDN para o worker do react-pdf
      const stripeJsUrl = 'https://js.stripe.com';
      const stripeApiUrl = 'https://api.stripe.com';
      const googleFontsUrl = 'https://fonts.googleapis.com';
      const googleFontsStaticUrl = 'https://fonts.gstatic.com';
      const vercelInsightsUrl = 'https://vitals.vercel-insights.com';
      const unpkgUrl = 'https://unpkg.com'; // Adicionada porque estava na CSP original
      const jsdelivrUrl = 'https://cdn.jsdelivr.net'; // Adicionada porque estava na CSP original
  
      // Aviso se a URL do Supabase não estiver definida (ainda útil para debug)
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
         console.warn('[Config] Aviso: NEXT_PUBLIC_SUPABASE_URL não está definida. CSP pode ficar incompleta.');
      }
  
      // URLs do Supabase (ajuste o domínio se for diferente)
      // Adicionamos tanto a URL base quanto a URL de storage (se for diferente e pública)
      const supabaseDomain = new URL(supabaseUrl).hostname; // Ex: wncnyqowqxcrfizfdcfq.supabase.co
      const supabaseStorageUrl = supabaseUrl.replace(supabaseDomain, `storage.${supabaseDomain}`); // Tentativa, pode não ser exato
      const supabaseStorageHostname = new URL(supabaseStorageUrl).hostname;
  
      // Construír a CSP dinamicamente
      // Fontes: 'self' (próprio domínio), URLs permitidas, 'unsafe-inline'/'unsafe-eval' (necessário por algumas libs/estilos inline, menos seguro)
      const cspValue = [
         `default-src 'self'`, // Padrão: só permite do próprio domínio
         `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${stripeJsUrl} ${cdnjsUrl} ${unpkgUrl} ${jsdelivrUrl}`, // Scripts: próprio site, inline, eval, Stripe.js, CDNJS, unpkg, jsdelivr
         `style-src 'self' 'unsafe-inline' ${googleFontsUrl} ${googleFontsStaticUrl}`, // Estilos: próprio site, inline, Google Fonts
         `style-src-elem 'self' 'unsafe-inline' ${googleFontsUrl} ${googleFontsStaticUrl}`, // Elementos de estilo específicos
         `font-src 'self' ${googleFontsStaticUrl} data:`, // Fontes: próprio site, Google Fonts, data URIs
         `img-src 'self' data: blob: ${supabaseUrl} https://${supabaseStorageHostname}`, // Imagens: próprio site, data URIs, blobs, Supabase URL e Storage
         `connect-src 'self' ${supabaseUrl} wss://${supabaseDomain} ${vercelInsightsUrl} ${stripeApiUrl} ${cdnjsUrl} ${unpkgUrl} ${jsdelivrUrl}`, // Conexões (API, WebSockets): próprio site, Supabase (API e WS), Vercel, Stripe API, CDNs
         `frame-src 'self' ${stripeJsUrl}`, // Iframes: próprio site, Stripe.js (para elementos do Stripe)
         `worker-src 'self' blob: ${cdnjsUrl} ${unpkgUrl} ${jsdelivrUrl}`, // Web Workers: próprio site, blobs, CDNs
         `upgrade-insecure-requests` // Tenta sempre usar HTTPS
       ].join('; ');
  
  
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: cspValue,
            },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'DENY' }, // Ou SAMEORIGIN se precisar de iframes do mesmo site
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;