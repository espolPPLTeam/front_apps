module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ? '/login/'
    : '/login/',
  devServer: {
    host: "localhost",
    port: 8080,
    proxy: {
      "/api": {
        logLevel: 'debug',
        target: "http://localhost:8001",
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
};