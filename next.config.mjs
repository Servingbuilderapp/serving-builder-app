import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  transpilePackages: ['react-markdown', 'remark-gfm', 'unified', 'micromark', 'mdast-util-from-markdown'],
};

export default nextConfig;

