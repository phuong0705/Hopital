const DEFAULT_TTL_SECONDS = 60;
const DEFAULT_MAX_KEYS = 500;

const store = new Map();
const pending = new Map();

function now() {
  return Date.now();
}

function cloneValue(value) {
  if (value === null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function normalizeTtl(ttlSeconds) {
  const ttl = Number(ttlSeconds || DEFAULT_TTL_SECONDS);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TTL_SECONDS;
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= now()) {
    store.delete(key);
    return null;
  }

  return cloneValue(entry.value);
}

function set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const maxKeys = Number(process.env.MEMORY_CACHE_MAX_KEYS || DEFAULT_MAX_KEYS);
  if (store.size >= maxKeys && !store.has(key)) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) store.delete(oldestKey);
  }

  store.set(key, {
    value: cloneValue(value),
    expiresAt: now() + normalizeTtl(ttlSeconds) * 1000
  });

  return value;
}

async function getOrSet(key, ttlSeconds, factory) {
  const cached = get(key);
  if (cached !== null) {
    return {
      value: cached,
      hit: true
    };
  }

  if (pending.has(key)) {
    return {
      value: cloneValue(await pending.get(key)),
      hit: true,
      pending: true
    };
  }

  const promise = Promise.resolve().then(factory);
  pending.set(key, promise);

  try {
    const value = await promise;
    set(key, value, ttlSeconds);
    return {
      value: cloneValue(value),
      hit: false
    };
  } finally {
    pending.delete(key);
  }
}

function del(key) {
  return store.delete(key);
}

function delByPrefix(prefix) {
  let count = 0;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
      count += 1;
    }
  }
  return count;
}

function clear() {
  store.clear();
  pending.clear();
}

function stats() {
  return {
    size: store.size,
    pending: pending.size,
    keys: Array.from(store.keys())
  };
}

module.exports = {
  get,
  set,
  getOrSet,
  del,
  delByPrefix,
  clear,
  stats
};
