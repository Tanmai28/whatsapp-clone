/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID: 562073871,
    NEXT_PUBLIC_ZEGO_SERVER_ID: "90f2947f9b32d8d36315cd1f6fb15f96",
  },
  images:{
    domains: ["localhost"],
  },
  // Add webpack configuration to handle browser-specific modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Handle large files and media
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
