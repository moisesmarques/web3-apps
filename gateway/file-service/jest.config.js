module.exports = {
  setupFiles: ['./.jest/setEnv.js'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  coverageThreshold: {
    './lambda/**/{!(utils),}.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
