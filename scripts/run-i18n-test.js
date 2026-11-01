// Runner script to bootstrap server-only mock before loading i18n test suite
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
};

require("tsx/cjs");
require("../tests/i18n.test.ts");

