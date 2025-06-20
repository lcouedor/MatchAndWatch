const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  // publicPath: '/MatchAndWatch/',
  devServer: {
    host: "localhost",
    port: 8080,
    allowedHosts: 'all',
    compress: true,
  },
});