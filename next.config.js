/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      { pathname: "/api/images/**" },
      { pathname: "/nuevas/**" },
      { pathname: "/catalogo/**" },
      { pathname: "/images/**" },
      { pathname: "/camisetas/**" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
