import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      // Ensure WASM files are served with the correct MIME type
      source: "/dice-box/ammo/ammo.wasm.wasm",
      headers: [
        { key: "Content-Type", value: "application/wasm" },
      ],
    },
  ],
};

export default nextConfig;
