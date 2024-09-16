/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  transpilePackages: ['three'],
  /** eslint: {
    ignoreDuringBuilds: true,
  },**/
}

export default nextConfig;