import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  
  // eslint aur typescript options hata do
  // webpack config rahega
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    }
    return config
  },
}

export default nextConfig