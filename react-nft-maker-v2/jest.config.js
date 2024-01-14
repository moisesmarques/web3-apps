/* eslint-disable import/order */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  testPathIgnorePatterns: ['<rootDir>/cypress/'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  // For path aliases
  moduleNameMapper: {
    '^@/pages(.*)$': '<rootDir>/src/pages/$1',
    '^@/components(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks(.*)$': '<rootDir>/src/hooks/$1',
    '^@/mocks(.*)$': '<rootDir>/src/mocks/$1',
    '^@/assets(.*)$': '<rootDir>/src/assets/$1',
    '^@/constants(.*)$': '<rootDir>/src/constants/$1',
    '^@/modules(.*)$': '<rootDir>/src/modules/$1',
    '^@/validations(.*)$': '<rootDir>/src/validations/$1',
    '^@/services(.*)$': '<rootDir>/src/services/$1',
    '^@/store(.*)$': '<rootDir>/src/store/$1',
    '^@/utils(.*)$': '<rootDir>/src/utils/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// eslint-disable-next-line no-undef
module.exports = createJestConfig(customJestConfig);
