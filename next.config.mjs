/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
    ],
  },
  // Enable edge runtime for API routes
  experimental: {
    runtime: 'edge',
  },
};

export default nextConfig; 