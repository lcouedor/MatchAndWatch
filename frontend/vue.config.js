const path = require('path')
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'Match&Watch'
      return args
    })
  },
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
