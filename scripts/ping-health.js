const DEFAULT_TIMEOUT_MS = 8000;

function resolveHealthUrl() {
  const explicitUrl = process.env.HEALTHCHECK_URL || process.env.APP_URL || process.env.RENDER_EXTERNAL_URL;
  if (explicitUrl) {
    return explicitUrl.endsWith('/health') ? explicitUrl : `${explicitUrl.replace(/\/$/, '')}/health`;
  }

  const port = process.env.PORT || 3003;
  return `http://localhost:${port}/health`;
}

async function pingHealth() {
  const url = resolveHealthUrl();
  const timeoutMs = Number(process.env.HEALTHCHECK_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'user-agent': 'ql-noi-tru-health-cron/1.0'
      },
      signal: controller.signal
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.status !== 'ok') {
      throw new Error(`Health check failed with HTTP ${response.status}`);
    }

    console.log(`Health check ok: ${url} uptime=${payload.uptime || 'n/a'}`);
  } finally {
    clearTimeout(timer);
  }
}

pingHealth().catch((error) => {
  console.error(`Health check error: ${error.message}`);
  process.exitCode = 1;
});
