/**
 * Centralised JWT token storage.
 *
 * Security note: localStorage is readable by any JavaScript on the page and is
 * therefore vulnerable to XSS. The correct long-term fix is to move auth to
 * httpOnly cookies issued by the backend so the token is never exposed to JS.
 * Until the backend supports that, all reads/writes go through this module so
 * the migration requires changes in exactly one file.
 */

const KEY = 'homys_token';

export const tokenStorage = {
  get: () => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  set: (token) => {
    try { localStorage.setItem(KEY, token); } catch { /* storage full / blocked */ }
  },
  remove: () => {
    try { localStorage.removeItem(KEY); } catch { /* noop */ }
  },
};
