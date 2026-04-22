import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  transpilePackages: ['react-markdown', 'remark-gfm', 'unified', 'micromark', 'mdast-util-from-markdown'],
};

export default nextConfig;
