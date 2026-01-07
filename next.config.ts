/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // FIX for Zoom COEP issue
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none', // Disable COEP for Zoom
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none', // Disable COOP for Zoom
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin', // Allow cross-origin resources
          },
        ],
      },
    ];
  },
  
  // Allow external scripts
  transpilePackages: [],
  
  // Allow Zoom domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.zoom.us',
      },
      {
        protocol: 'https',
        hostname: 'zoom.us',
      },
    ],
  },
};

module.exports = nextConfig;