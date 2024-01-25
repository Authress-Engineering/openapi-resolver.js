// eslint-disable-next-line import/extensions
const unitConfig = require('./jest.unit.config.cjs');

module.exports = {
  ...unitConfig,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    './src/': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
