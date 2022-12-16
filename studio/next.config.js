// const withPlugins = require('next-compose-plugins')
// const withTM = require('next-transpile-modules')(['browser-nativefs'])
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.BUNDLE_VISUALIZE == 1,
// })

// module.exports = withPlugins([[withBundleAnalyzer, {}], [withTM]])


const { withNativebase } = require("@native-base/next-adapter");
const path = require("path");

const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.ttf$/,
      loader: "url-loader", // or directly file-loader
      include: path.resolve(__dirname, "node_modules/@native-base/icons"),
    });
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
      "react-native-linear-gradient": "react-native-web-linear-gradient",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
}

module.exports = withNativebase({
  dependencies: ["@native-base/icons", "react-native-web-linear-gradient"],
  nextConfig,
});
