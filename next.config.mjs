/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure image domains if needed
  images: {
    unoptimized: true, // Required for Cloudflare Pages
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
  swcMinify: true, // Use SWC minification
  // Customize webpack config
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations for client-side production builds
    if (!dev && !isServer) {
      // Aggressive code splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        maxSize: 20000000, // 20MB max chunk size
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|framer-motion)[\\/]/,
            priority: 40,
            enforce: true
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module, chunks, cacheGroupKey) {
              const moduleFileName = module
                .identifier()
                .split('/')
                .reduceRight((item) => item);
              return `${cacheGroupKey}-${moduleFileName}`;
            },
            chunks: 'all',
            priority: 30,
            minChunks: 2,
            reuseExistingChunk: true
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20
          },
          shared: {
            name: false,
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true
          }
        }
      };

      // Minimize all chunks
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