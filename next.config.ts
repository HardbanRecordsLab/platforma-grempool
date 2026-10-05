import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.grempool.pl" }],
        destination: "https://grempool.pl/:path*",
        permanent: true,
      },
      { source: "/ogloszenia", destination: "/uslugi/materialy", permanent: false },
    ];
  },
};

export default nextConfig;
