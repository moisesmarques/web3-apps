module.exports = {
  setupFiles: ['./.jest/setEnv.js'],
  coverageThreshold: {
    './{!(utils),}.js': {
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
};
