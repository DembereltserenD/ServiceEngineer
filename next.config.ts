import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: process.env.TEMPO === "true" ? ["*.tempo.build"] : undefined,
};

export default nextConfig;
