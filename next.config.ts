import type { NextConfig } from "next";
import path from "node:path";

const root = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  // Keep Turbopack inside this app. A yarn.lock in the home directory
  // would otherwise make it watch the whole home folder.
  turbopack: {
    root,
  },
};

export default nextConfig;
