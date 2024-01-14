module.exports = {
  setupFiles: [
    'dotenv/config',
  ],
  coverageThreshold: {
    './lambda/**/{!(utils),}.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
