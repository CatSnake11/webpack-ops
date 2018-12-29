const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
 
module.exports = {
    plugins: [
        // To strip all locales except “en”
        new MomentLocalesPlugin(),
    ],
};