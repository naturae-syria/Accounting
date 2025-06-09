/** @type {import('next').NextConfig} */
const nextConfig = {
  // استخدام الوضع المستقل للسماح بتشغيل الخادم الكامل
  output: 'standalone',
  // Allow overriding the base path via NEXT_BASE_PATH to support subpath deployments
  basePath: process.env.NEXT_BASE_PATH || '',
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
