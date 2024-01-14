module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules'],

  collectCoverage: true,
  coverageReporters: ['text', 'html', 'lcov'],
  coveragePathIgnorePatterns: ['lib/', '__fixtures__/'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 80,
      statements: -10,
    },
  },
};
