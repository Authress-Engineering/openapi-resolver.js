const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '..', '..'),
  testEnvironment: 'node',
  testMatch: ['**/test/*.test.js', '**/test/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
};
