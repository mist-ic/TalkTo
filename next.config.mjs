/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable strict mode for better development
  reactStrictMode: true,
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  experimental: {
    optimizePackageImports: ['framer-motion', '@google-cloud/text-to-speech'],
  },
  // Customize webpack config
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Aggressive code splitting configuration
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 4000,
          maxSize: 15000000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
            middleware: {
              chunks: 'all',
              name: 'middleware',
              test: /[\\/]node_modules[\\/](swr|zod|@google-cloud)[\\/]/,
              priority: 30,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              chunks: 'async',
              name(module, chunks, cacheGroupKey) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1].replace('@', '');
                return `${cacheGroupKey}.${packageName}`;
              },
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            }
          }
        },
        runtimeChunk: 'single'
      };

      config.optimization.moduleIds = 'deterministic';
      config.optimization.minimize = true;
    }
    
    return config;
  },
  // Customize headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
};

export default nextConfig; 