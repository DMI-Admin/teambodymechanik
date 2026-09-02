import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emits .next/standalone/server.js — a self-contained Node server that runs
  // without installing node_modules on the host. See DEPLOY.md.
  output: "standalone",
};

export default nextConfig;
