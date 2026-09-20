import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Регистрация переехала с /events/:slug на корень (/:slug) — старые
  // напечатанные/разосланные ссылки в старом формате не должны умирать.
  async redirects() {
    return [
      {
        source: "/events/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
