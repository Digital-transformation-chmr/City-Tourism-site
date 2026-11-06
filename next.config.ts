import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.88.48', '172.28.128.1'],
  reactCompiler: true,
};

export default nextConfig;
