import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
        protocol: "https",
        hostname: "*.grassflorist.com",
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
      { source: '/الخصوصية', destination: '/policies/privacy' },
      { source: '/%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', destination: '/policies/privacy' },
      { source: '/سياسة-الخصوصية', destination: '/policies/privacy' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', destination: '/policies/privacy' },
      { source: '/سياسة-التوصيل-والخصوصية', destination: '/policies/privacy' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AA%D9%88%D8%B5%D9%8A%D9%84-%D9%88%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9', destination: '/policies/privacy' },
      { source: '/سياسة-الاسترجاع-والاسترداد', destination: '/policies/returns' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%B1%D8%AC%D8%A7%D8%B9-%D9%88%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%B1%D8%AF%D8%A7%D8%AF', destination: '/policies/returns' },
      { source: '/سياسة-الاسترجاع-والاستبدال', destination: '/policies/returns' },
      { source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%B1%D8%AC%D8%A7%D8%B9-%D9%88%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%A8%D8%AF%D8%A7%D9%84', destination: '/policies/returns' },
      { source: '/اتصل-بنا', destination: '/contact' },
      { source: '/%D8%A7%D8%AA%D8%B5%D9%84-%D8%A8%D9%86%D8%A7', destination: '/contact' },
      { source: '/المدونة', destination: '/blog' },
      { source: '/%D8%A7%D9%84%D9%85%D8%AF%D9%88%D9%86%D8%A9', destination: '/blog' },
      { source: '/الأسئلة-الشائعة', destination: '/faq' },
      { source: '/%D8%A7%D9%84%D8%A3%D8%B3%D8%A6%D9%84%D8%A9-%D8%A7%D9%84%D8%B4%D8%A7%D8%A6%D8%B9%D8%A9', destination: '/faq' },
      { source: '/المفضلة', destination: '/wishlist' },
      { source: '/%D8%A7%D9%84%D9%85%D9%81%D8%B6%D9%84%D8%A9', destination: '/wishlist' },
      { source: '/الشروط-والأحكام', destination: '/policies/terms' },
      { source: '/%D8%A7%D9%84%D8%B4%D8%B1%D9%88%D8%B7-%D9%88%D8%A7%D9%84%D8%A3%D8%AD%D9%83%D8%A7%D9%85', destination: '/policies/terms' },
      { source: '/الشحن-والتوصيل', destination: '/policies/shipping' },
      { source: '/%D8%A7%D9%84%D8%B4%D8%AD%D9%86-%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%B5%D9%8A%D9%84', destination: '/policies/shipping' },
    ];
  },
};

export default nextConfig;
