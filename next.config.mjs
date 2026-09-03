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

  /**
   * El recorrido de demostracion es una pagina suelta que vive en public/demo.html,
   * para poder actualizarla sin tocar el codigo de la plataforma. Esto solo hace
   * que se vea en /demo en vez de /demo.html.
   */
  async rewrites() {
    return [{ source: '/demo', destination: '/demo.html' }];
  },
};

export default nextConfig;

