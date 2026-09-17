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
      {
        source: '/عن-غراس',
        destination: '/about',
      },
      {
        source: '/من-نحن',
        destination: '/about',
      },
      {
        source: '/الخصوصية',
        destination: '/policies/privacy',
      },
      {
        source: '/سياسة-الخصوصية',
        destination: '/policies/privacy',
      },
      {
        source: '/سياسة-التوصيل-والخصوصية',
        destination: '/policies/privacy',
      },
      {
        source: '/سياسة-الاسترجاع-والاسترداد',
        destination: '/policies/returns',
      },
      {
        source: '/سياسة-الاسترجاع-والاستبدال',
        destination: '/policies/returns',
      },
      {
        source: '/اتصل-بنا',
        destination: '/contact',
      },
      {
        source: '/المدونة',
        destination: '/blog',
      },
    ];
  },
};

export default nextConfig;
