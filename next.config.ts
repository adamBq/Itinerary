import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Lets you open the dev server from another device on the LAN
  // (e.g. your phone at http://192.168.0.200:3000).
  allowedDevOrigins: ['192.168.0.200'],
};

export default nextConfig;
