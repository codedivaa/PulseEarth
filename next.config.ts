import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},

  // Standalone output bundles only the necessary files for production.
  // Required for the multi-stage Docker build (Dockerfile).
  // The .next/standalone directory contains a self-contained server.js
  // that does not need a separate node_modules install at runtime.
  output: 'standalone',
}

export default nextConfig