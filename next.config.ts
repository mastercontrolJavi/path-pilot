import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  // A stray lockfile in the home directory made Turbopack infer the wrong workspace root.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
