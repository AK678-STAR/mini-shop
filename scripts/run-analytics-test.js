// Runner script to bootstrap server-only mock before loading Analytics test suite
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
};

require("tsx/cjs");
require("../tests/analytics.test.ts");

