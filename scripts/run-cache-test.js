// Runner script to bootstrap server-only mock and incremental cache mock before loading cache test suite
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
};

// In-memory cache store for simulating Next.js incrementalCache in Node test runner
const memoryStore = new Map();
const tagMap = new Map();

// Mock next/cache
const nextCachePath = require.resolve("next/cache");
const originalNextCache = require(nextCachePath);

require.cache[nextCachePath] = {
  id: nextCachePath,
  filename: nextCachePath,
  loaded: true,
  exports: {
    ...originalNextCache,
    revalidatePath: (path) => {
      // simulated path revalidation
    },
    revalidateTag: (tag) => {
      // Invalidate all entries tagged with `tag`
      const keys = tagMap.get(tag) || [];
      for (const k of keys) {
        memoryStore.delete(k);
      }
      tagMap.delete(tag);
    },
    unstable_cache: (cb, keyParts, options = {}) => {
      const baseKey = keyParts ? keyParts.join("-") : "default";
      const tags = options.tags || [];

      return async (...args) => {
        const fullKey = `${baseKey}-${JSON.stringify(args)}`;
        if (memoryStore.has(fullKey)) {
          return memoryStore.get(fullKey);
        }

        const freshValue = await cb(...args);
        memoryStore.set(fullKey, freshValue);

        for (const tag of tags) {
          if (!tagMap.has(tag)) tagMap.set(tag, []);
          tagMap.get(tag).push(fullKey);
        }

        return freshValue;
      };
    },
  },
};

require("tsx/cjs");
require("../tests/cache-products.test.ts");
