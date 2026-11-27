/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
