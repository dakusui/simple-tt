import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
    webpack: (config, { dev }) => {
        if (dev) {
            config.devtool = 'source-map';  // Ensure full source maps
        }
        return config;
    },
    experimental: {
        webpackDevMiddleware: (config) => {
            config.devtool = 'source-map'; // Force source maps in development
            return config;
        },
    },
    productionBrowserSourceMaps: true,
};
export default nextConfig;
