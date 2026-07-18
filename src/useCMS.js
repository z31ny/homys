import { useState, useEffect } from 'react';

const CACHE_TTL = 60_000; // 60 seconds — cache expires after this
const cache = {};   // { section: { data, ts } }
const pending = {};

async function fetchSection(section) {
  const now = Date.now();
  const hit = cache[section];
  if (hit && (now - hit.ts) < CACHE_TTL) return hit.data;

  if (!pending[section]) {
    const base = import.meta.env?.VITE_API_URL || '/api';
    pending[section] = fetch(`${base}/content/${section}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const content = data?.data?.content ?? {};
        cache[section] = { data: content, ts: Date.now() };
        delete pending[section];
        return content;
      })
      .catch((err) => { console.warn('[useCMS] Failed to load section:', section, err); delete pending[section]; return {}; });
  }
  return pending[section];
}

/** Call this after saving a section in the admin to force a fresh fetch. */
export function invalidateCache(section) {
  delete cache[section];
}

export function useCMS(section, defaults = {}) {
  const [content, setContent] = useState(() => {
    const hit = cache[section];
    if (hit && (Date.now() - hit.ts) < CACHE_TTL) {
      return { ...defaults, ...hit.data };
    }
    return { ...defaults };
  });

  useEffect(() => {
    fetchSection(section).then((data) => {
      setContent({ ...defaults, ...data });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  return content;
}

export default useCMS;
