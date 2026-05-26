/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,  // Reduce memory usage
  optimizeFonts: true,
  compress: true,
  
  // Variables de entorno públicas
  env: {
    NOMBRE_APLICACION: process.env.NOMBRE_APLICACION || 'Sistema de Horarios UNT',
    VERSION: process.env.VERSION || '1.0.0',
  },

  // Configuración de imágenes
  images: {
    domains: ['localhost', 'horarios.unitru.edu.pe'],
    formats: ['image/webp'],  // Solo webp para reducir tamaño
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configuración de Webpack para WebSocket
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    // Reduce bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              name: 'commons'
            }
          }
        }
      };
    }
    return config;
  },
};

module.exports = nextConfig;
