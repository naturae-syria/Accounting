/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // تكوين للنشر على GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/accounting-distribution-system' : '',
  trailingSlash: true, // إضافة شرطة مائلة في نهاية المسارات لتحسين التوافق مع GitHub Pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // ضروري للنشر على GitHub Pages
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
