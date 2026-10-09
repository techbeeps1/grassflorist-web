import type { NextConfig } from "next";

// Next.js configuration for Grass Florist
const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagicons.lipis.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "grassflorist.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/عن-غراس', destination: '/about' },
      { source: '/%D8%B9%D9%86-%D8%BA%D8%B1%D8%A7%D8%B3', destination: '/about' },
      { source: '/من-نحن', destination: '/about' },
      { source: '/%D9%85%D9%86-%D9%86%D8%AD%D9%86', destination: '/about' },
      { source: '/الخصوصية', destination: '/privacy-policy' },
      { source: '/%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', destination: '/privacy-policy' },
      { source: '/سياسة-الخصوصية', destination: '/privacy-policy' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', destination: '/privacy-policy' },
      { source: '/سياسة-التوصيل-والخصوصية', destination: '/privacy-policy' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AA%D9%88%D8%B5%D9%8A%D9%84-%D9%88%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', destination: '/privacy-policy' },
      { source: '/سياسة-الاسترجاع-والاسترداد', destination: '/return-policy' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%B1%D8%AC%D8%A7%D8%B9-%D9%88%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%B1%D8%AF%D8%A7%D8%AF', destination: '/return-policy' },
      { source: '/سياسة-الاسترجاع-والاستبدال', destination: '/return-policy' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%B1%D8%AC%D8%A7%D8%B9-%D9%88%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%A8%D8%AF%D8%A7%D9%84', destination: '/return-policy' },
      { source: '/اتصل-بنا', destination: '/contact' },
      { source: '/%D8%A7%D8%AA%D8%B5%D9%84-%D8%A8%D9%86%D8%A7', destination: '/contact' },
      { source: '/المدونة', destination: '/blog' },
      { source: '/%D8%A7%D9%84%D9%85%D8%AF%D9%88%D9%86%D8%A9', destination: '/blog' },
      { source: '/الأسئلة-الشائعة', destination: '/faq' },
      { source: '/%D8%A7%D9%84%D8%A3%D8%B3%D8%A6%D9%84%D8%A9-%D8%A7%D9%84%D8%B4%D8%A7%D8%A6%D8%B9%D8%A9', destination: '/faq' },
      { source: '/المفضلة', destination: '/wishlist' },
      { source: '/%D8%A7%D9%84%D9%85%D9%81%D8%B6%D9%84%D8%A9', destination: '/wishlist' },
      { source: '/الشروط-والأحكام', destination: '/terms-conditions' },
      { source: '/%D8%A7%D9%84%D8%B4%D8%B1%D9%88%D8%B7-%D9%88%D8%A7%D9%84%D8%A3%D8%AD%D9%83%D8%A7%D9%85', destination: '/terms-conditions' },
      { source: '/الشحن-والتوصيل', destination: '/policies/shipping' },
      { source: '/%D8%A7%D9%84%D8%B4%D8%AD%D9%86-%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%B5%D9%8A%D9%84', destination: '/policies/shipping' },
      { source: '/storage/:path*', destination: 'http://127.0.0.1:8000/storage/:path*' },
    ];
  },
};

export default nextConfig;
