/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: process.env.NODE_ENV === 'development', // Desactivar optimización en dev
  },
  // Optimizaciones para velocidad en desarrollo
  swcMinify: process.env.NODE_ENV === 'production',
  optimizeFonts: process.env.NODE_ENV === 'production',
  
  // Reducir compilaciones innecesarias
  reactStrictMode: false, // Desactivar en desarrollo para evitar doble renderizado
  
  // Cache más agresivo en desarrollo
  onDemandEntries: {
    maxInactiveAge: 120 * 1000, // 2 min (aumentado)
    pagesBufferLength: 5, // Más páginas en buffer
  },
  
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    // Optimizar compilaciones
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  webpack: (config, { dev, isServer }) => {
    // Solo aplicar optimizaciones pesadas en producción
    if (!dev) {
      if (isServer) {
        config.externals.push('_http_common', '@prisma/client', 'prisma')
      }
    }
    
    // Optimizaciones de velocidad para desarrollo
    if (dev) {
      // Reducir chequeos de archivos
      config.watchOptions = {
        poll: 2000, // Aumentado para reducir uso de CPU
        aggregateTimeout: 600, // Aumentado para agrupar cambios
        ignored: [
          '**/node_modules/**', 
          '**/.next/**', 
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.cache/**',
          // Ignorar archivos del sistema de Windows
          'C:/hiberfil.sys',
          'C:/pagefile.sys', 
          'C:/swapfile.sys',
          'C:/DumpStack.log.tmp',
          '**/hiberfil.sys',
          '**/pagefile.sys',
          '**/swapfile.sys',
          '**/DumpStack.log.tmp'
        ]
      }
      
      // Optimizar resolución de módulos
      config.resolve.symlinks = false
      config.resolve.cacheWithContext = false
    }
    
    return config
  },
  
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600', // Cachear por 1 hora
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig