const environment = require('./mock/environment.json');

process.env = {
  ...(process.env || {}),
  ...environment  
};
