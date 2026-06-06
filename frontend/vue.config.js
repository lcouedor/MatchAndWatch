const path = require('path')
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        'shared-types': path.resolve(__dirname, '../shared-types'),
      }
    }
  },
  devServer: {
    host: "localhost",
    port: 8080,
    allowedHosts: 'all',
    compress: true,
  },
});
