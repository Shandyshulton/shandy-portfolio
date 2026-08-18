const CMS_API_URL = import.meta.env.VITE_CMS_API_URL ?? 'http://127.0.0.1:8000/api';

export async function fetchCms(path, options = {}) {
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
