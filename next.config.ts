import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1/:path*`,
      },
      {
        source: "/api/chat/:path*",
        destination: `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
