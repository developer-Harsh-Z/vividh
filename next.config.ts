import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone", // self-contained server for the Docker image (college servers)
  serverExternalPackages: ["sharp"],
  experimental: { serverActions: { bodySizeLimit: "2mb" } }, // files go straight to storage, never through actions
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default config;
