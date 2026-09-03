// Klien chat: memanggil Vercel Function /api/chat (proxy + retrieval server-side).
// API key Groq tidak pernah ada di sisi browser.

function toLocale(language) {
  return language?.startsWith('id') ? 'id' : 'en';
}

export async function sendChatMessage({ message, history = [], locale = 'id' }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, locale: toLocale(locale) }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error ?? `Chat error: ${res.status}`);
  }

  return data.reply;
}
