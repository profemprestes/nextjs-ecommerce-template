/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "genkit",
    "@genkit-ai/google-genai",
    "@genkit-ai/core",
  ],
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
