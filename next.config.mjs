/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['three'],
  /** eslint: {
    ignoreDuringBuilds: true,
  },**/
}

export default nextConfig;