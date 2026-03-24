import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/vjai-paper-hub",
  assetPrefix: "/vjai-paper-hub",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
