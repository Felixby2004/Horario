/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Variables de entorno públicas
  env: {
    NOMBRE_APLICACION: process.env.NOMBRE_APLICACION || 'Sistema de Horarios UNT',
    VERSION: process.env.VERSION || '1.0.0',
  },

  // Configuración de imágenes
  images: {
    domains: ['localhost', 'horarios.unitru.edu.pe'],
    formats: ['image/webp', 'image/avif'],
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
    return config;
  },
};

module.exports = nextConfig;
