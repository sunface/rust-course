const { NODE_ENV, API, ANALYZE } = process.env

const withPlugins = require("next-compose-plugins")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: ANALYZE === "true",
})


const isProd = NODE_ENV === 'production'

const defaultConfig = {
  publicRuntimeConfig: {
    env: {
      NODE_ENV,
      API,
    },
  },
  target: "serverless",
  webpack: (config) => ({
    ...config,
    externals: [...config.externals],
  }),
  experimental: {
    optimizeFonts: true,
    modern: true,
  },
  redirects: require("./next-redirect"),
  assetPrefix: isProd ? 'cdn' : '',
}

module.exports = withPlugins(
  [withBundleAnalyzer],
  defaultConfig,
)
