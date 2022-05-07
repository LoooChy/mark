module.exports = {
    plugins: {
      autoprefixer: {
        overrideBrowserslist: [
          "Android 4.1",
          "iOS 7.1",
          "Chrome > 31",
          "ff > 31",
          "ie >= 10",
          "last 10 versions"
        ],
        grid: true
      },
      // 'postcss-pxtorem': {
      //   rootValue: 200,
      //   propList: ['*']
      // }
    }
  }