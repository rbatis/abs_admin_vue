module.exports = {
  publicPath: '/',
  devServer: {
    port: 8080,
    proxy: {
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
}
