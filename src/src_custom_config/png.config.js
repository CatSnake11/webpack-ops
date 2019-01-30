module.exports = {
    module: {
        rules: [
          {
            test: /\.png$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  mimetype: 'image/png'
                }
              }
            ]
          }
        ]
      }
}