const webpack = require('webpack');

module.exports = {
  plugins: [
    // To strip all locales except “en”
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};
