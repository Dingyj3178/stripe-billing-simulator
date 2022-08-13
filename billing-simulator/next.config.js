/** @type {import('next').NextConfig} */

const withMDX = require("@next/mdx")();

const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;

module.exports = withMDX({
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
});
