/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        pathname: '/id/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't4.ftcdn.net',
        pathname: '/jpg/**',
      }
    ],
    domains: ['upload.wikimedia.org', 'media.istockphoto.com', 'i.pinimg.com', 't4.ftcdn.net']
  },
  // Enable edge runtime for API routes
  experimental: {
    runtime: 'edge',
  },
};

export default nextConfig; 