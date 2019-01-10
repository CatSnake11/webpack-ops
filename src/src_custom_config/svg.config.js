module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: 'file-loader'
      }
    ]
  }
}