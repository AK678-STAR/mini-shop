// Runner script to bootstrap server-only mock before loading TypeScript test suite
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
};

require("tsx/cjs");
require("./verify-security-scenarios.ts");
