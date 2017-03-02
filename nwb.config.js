module.exports = {
  type: 'web-module',
  npm: {
    esModules: true,
    umd: true
  },
  karma: {
    browsers: ['jsdom'],
    plugins: [require('karma-jsdom-launcher')]
  }
};
