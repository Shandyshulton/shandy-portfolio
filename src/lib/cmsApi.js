const CMS_API_URL = import.meta.env.VITE_CMS_API_URL ?? 'http://127.0.0.1:8000/api';

// In-memory cache + in-flight dedup for GET requests.
// Prevents duplicate network calls when multiple components request the same
// endpoint (e.g. /public/settings used by Home, Contact and Footer).
const getCache = new Map(); // path -> resolved JSON
const inFlight = new Map(); // path -> Promise

async function requestCms(path, options) {
  const response = await fetch(`${CMS_API_URL}${path}`, {
    ...options,
    headers: { Accept: 'application/json' },
    ...(options.body instanceof FormData ? {} : {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`CMS request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchCms(path, options = {}) {
  const method = (options.method ?? 'GET').toUpperCase();

  // Only cache/dedup idempotent GET requests.
  if (method !== 'GET') {
    return requestCms(path, options);
  }

  if (getCache.has(path)) {
    return getCache.get(path);
  }

  if (inFlight.has(path)) {
    return inFlight.get(path);
  }

  const promise = requestCms(path, options)
    .then((data) => {
      getCache.set(path, data);
      return data;
    })
    .finally(() => {
      inFlight.delete(path);
    });

  inFlight.set(path, promise);
  return promise;
}

export function getTranslation(item, locale) {
  const currentLocale = locale?.startsWith('id') ? 'id' : 'en';
  const translations = item.translations;

  if (Array.isArray(translations)) {
    return translations.find((entry) => entry.locale === currentLocale)
      ?? translations.find((entry) => entry.locale === 'en')
      ?? translations[0]
      ?? {};
  }

  return translations?.[currentLocale] ?? translations?.en ?? {};
}

export function formatPeriod(startDate, endDate, isCurrent, locale = 'en') {
  const formatter = new Intl.DateTimeFormat(locale?.startsWith('id') ? 'id-ID' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });

  const start = startDate ? formatter.format(new Date(startDate)) : '';
  const end = isCurrent ? 'Present' : endDate ? formatter.format(new Date(endDate)) : '';

  return [start, end].filter(Boolean).join(' - ');
}
