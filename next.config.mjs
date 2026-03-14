/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['playwright', 'axe-playwright']
};

export default nextConfig;
