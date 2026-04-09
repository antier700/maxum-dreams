/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['utils/**/*.js', 'controllers/userController.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
};
