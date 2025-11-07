/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone for Netlify
  output: 'standalone',

  // Disable strict mode for easier migration
  reactStrictMode: true,

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },

  // Rewrites to ensure Netlify functions work
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/.netlify/functions/:path*',
          destination: 'http://localhost:9999/.netlify/functions/:path*',
        },
      ],
    };
  },

  // Webpack config for Netlify Functions
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
