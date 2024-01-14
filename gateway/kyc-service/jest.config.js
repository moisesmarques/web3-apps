module.exports = {
  coverageThreshold: {
    './{!(utils|error),}.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
