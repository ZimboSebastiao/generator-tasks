/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
